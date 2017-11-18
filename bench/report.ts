import * as util from "util";
import * as fs from "fs";
const writeFile = util.promisify(fs.writeFile);
import prettyMs = require("pretty-ms");
import yargs = require("yargs");

import * as _ from "lodash";
import { List } from "immutable";
import * as Finger from "@paldepind/finger-tree";

import * as Benchmark from "benchmark";

import * as L from "../dist/index";
import * as Lo from "./list-old/dist/index";

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
  input?: Input[];
  before?: (input: Input) => void;
};

type Bench<Input> = {
  name: string;
  tests: Tests<Input>;
  input?: Input[];
  before?: (input: Input) => void;
};

const benchmarks: Bench<any>[] = [];

export function benchmark<Input = any>(
  name: string | BenchmarkOptions<Input>,
  tests: Tests<Input>
): void {
  if (typeof name === "string") {
    name = { name: name };
  }
  benchmarks.push(Object.assign({}, name, { tests }));
}

let left: any;
let right: any;

benchmark(
  {
    name: "concat",
    input: [10, 50, 200, 2000, 20000]
  },
  {
    "List, current": {
      before: n => {
        left = L.range(0, n);
        right = L.range(n, 2 * n);
      },
      run: () => L.concat(left, right)
    },
    "List, old": {
      before: n => {
        left = Lo.range(0, n);
        right = Lo.range(n, 2 * n);
      },
      run: () => Lo.concat(left, right)
    },
    Lodash: {
      before: n => {
        left = _.range(0, n);
        right = _.range(n, 2 * n);
      },
      run: () => _.concat(left, right)
    },
    "Array#concat": {
      before: n => {
        left = _.range(0, n);
        right = _.range(n, 2 * n);
      },
      run: () => left.concat(right)
    },
    "Immutable.js": {
      before: n => {
        left = List(_.range(0, n));
        right = List(_.range(n, 2 * n));
      },
      run: () => left.concat(right)
    },
    Finger: {
      before: n => {
        left = Finger.nil;
        for (let i = 0; i < n; ++i) {
          left = Finger.append(i, left);
        }
        right = Finger.nil;
        for (let i = n; i < 2 * n; ++i) {
          right = Finger.append(i, right);
        }
      },
      run: () => Finger.concat(left, right)
    }
  }
);

function areSubstrings(s: string, ss: string[]): boolean {
  return ss.some(s2 => s.toLowerCase().includes(s2));
}

async function runBenchmarks(
  benchmarkNames: string[],
  p: string[]
): Promise<void> {
  (<any>require)("./random-access.perf");
  (<any>require)("./prepend.perf");
  (<any>require)("./foldl.perf");
  (<any>require)("./foldl-iterator.perf");
  (<any>require)("./update.perf");

  const startTime = Date.now();
  const results = [];
  const relevantBenchmarks =
    benchmarkNames === undefined
      ? benchmarks
      : benchmarks.filter(({ name }) => areSubstrings(name, benchmarkNames));
  console.log("Running", relevantBenchmarks.length, "benchmarks");
  for (const suite of relevantBenchmarks) {
    const { name, input, tests } = suite;
    const data = [];
    const names =
      p === undefined
        ? Object.keys(tests)
        : Object.keys(tests).filter(name => areSubstrings(name, p));
    for (const testName of names) {
      const testData = tests[testName];
      const test =
        typeof testData === "function" ? { run: testData } : testData;
      const result = await runTest(testName, suite, test, input);
      const plot = plotData(testName, input, result);
      data.push(plot);
    }
    results.push({ name, data });
  }
  await writeFile("data.json", JSON.stringify(results));
  const endTime = Date.now();
  console.log("Done in ", prettyMs(endTime - startTime));
}

// tslint:disable-next-line:no-unused-expression
yargs
  .command(
    "run",
    "run the benchmarks",
    yargs => yargs,
    argv => {
      runBenchmarks(argv.b, argv.p);
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
  .help().argv;
