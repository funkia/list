import * as util from "util";
import * as fs from "fs";
const writeFile = util.promisify(fs.writeFile);
const webpack = require("webpack");
const webpackAsync = util.promisify(webpack);
import prettyMs = require("pretty-ms");
import yargs = require("yargs");

import * as Benchmark from "benchmark";

const webpackConfig = require("./webpack.config");

function runAsync(benchmark: Benchmark) {
  return new Promise(resolve => {
    benchmark.on("complete", resolve).run();
  });
}

async function runTest<A>(
  name: string,
  suite: Bench<any>,
  test: Test<A>,
  input: A[]
): Promise<Benchmark[]> {
  const results = [];
  for (const n of input) {
    if (suite.before !== undefined) {
      suite.before(n);
    }
    if (test.before !== undefined) {
      test.before(n);
    }
    const b = new Benchmark(name + n.toString(), {
      fn: test.run
    });
    await runAsync(b);
    results.push(b);
  }
  return results;
}

function plotData(name: string, ns: number[], stats: Benchmark[]): any {
  return {
    name: name,
    x: ns,
    y: stats.map(s => s.stats.mean),
    type: "scatter",
    error_y: {
      type: "data",
      visible: true,
      array: stats.map(s => s.stats.moe)
    },
    text: stats.map(s => s.hz.toFixed(2) + " op/s")
  };
}

type Test<Input> = {
  before?: (input: Input) => void;
  run: () => void;
};

type Tests<Input> = { [name: string]: Test<Input> | (() => void) };

type BenchmarkOptions<Input> = {
  name: string;
  description?: string;
  input?: Input[];
  before?: (input: Input) => void;
};

type Bench<Input> = {
  name: string;
  description?: string;
  tests: Tests<Input>;
  input?: Input[];
  before?: (input: Input) => void;
};

const benchmarks: Bench<any>[] = [];

export function benchmark<Input = any>(
  options: string | BenchmarkOptions<Input>,
  tests: Tests<Input>
): void {
  if (typeof options === "string") {
    options = { name: options };
  }
  benchmarks.push(Object.assign({}, options, { tests }));
}

function areSubstrings(s: string, ss: string[]): boolean {
  return ss.some(s2 => s.toLowerCase().includes(s2));
}

async function runBenchmarks(argv: any): Promise<void> {
  const { b: benchmarkNames, p, exP } = argv;
  (<any>require)("./prepend.perf");
  (<any>require)("./concat.perf");
  (<any>require)("./foldl.perf");
  (<any>require)("./slice.perf");
  (<any>require)("./random-access.perf");
  (<any>require)("./update.perf");
  (<any>require)("./iterator.perf");
  (<any>require)("./foldl-iterator.perf");

  const startTime = Date.now();
  const results = [];
  const relevantBenchmarks =
    benchmarkNames === undefined
      ? benchmarks
      : benchmarks.filter(({ name }) => areSubstrings(name, benchmarkNames));
  console.log("Running", relevantBenchmarks.length, "benchmarks");

  for (const suite of relevantBenchmarks) {
    const { name, description, input, tests } = suite;
    console.log("des", description);
    const data = [];
    const names = Object.keys(tests);
    const names2 =
      p !== undefined ? names.filter(name => areSubstrings(name, p)) : names;
    const names3 =
      exP !== undefined
        ? names2.filter(name => !areSubstrings(name, exP))
        : names2;
    for (const testName of names3) {
      const testData = tests[testName];
      const test =
        typeof testData === "function" ? { run: testData } : testData;
      const result = await runTest(testName, suite, test, input);
      data.push({ testName, result });
    }
    results.push({ name, description, input, data });
  }

  await writeFile("data.json", JSON.stringify(results));
  const endTime = Date.now();
  console.log("Generating bundle");
  await webpackAsync(webpackConfig);
  console.log("Done in ", prettyMs(endTime - startTime));
}

// tslint:disable-next-line:no-unused-expression
yargs
  .command(
    "run",
    "run the benchmarks",
    yargs => yargs,
    argv => {
      runBenchmarks(argv);
    }
  )
  .option("b", {
    alias: "benchmarks",
    describe:
      "Filtering of benchmarks. Only run those that include one of the names.",
    type: "array"
  })
  .option("p", {
    alias: "performers",
    describe:
      "Filtering of performers. Only run those that include one of the names.",
    type: "array"
  })
  .option("exP", {
    alias: "excludePerformers",
    describe: "Exclude any performers that includes any of the given strings.",
    type: "array"
  })
  .help().argv;
