// import util = require("util");
import * as util from "util";
import * as fs from "fs";
import * as _ from "lodash";
import {List} from "immutable";
const writeFile = util.promisify(fs.writeFile);
import * as Finger from "../dist/finger";

import * as Benchmark from "benchmark";

import * as L from "../dist/index";

const bench = new Benchmark("test", () => {
  L.range(0, 1000);
});

function runAsync(benchmark: Benchmark) {
  return new Promise((resolve) => {
    benchmark.on("complete", resolve).run();
  });
}

async function benchmarkFunction<A>(ns: A[], f: (n: A) => void): Promise<Benchmark[]> {
  const results = [];
  for (const n of ns) {
    const b = new Benchmark(n.toString(), function () { f(n); });
    await runAsync(b);
    results.push(b);
  }
  return results;
}

async function runBenchmark<A>(ns: A[], d: BenchmarkDeclaration<A>): Promise<Benchmark[]> {
  const results = [];
  for (const n of ns) {
    d.setup(n);
    const b = new Benchmark(d.name + n.toString(), {
      fn: d.fn
    });
    await runAsync(b);
    results.push(b);
  }
  return results;
}

function plotData(decl: BenchmarkDeclaration<number>, ns: number[], stats: Benchmark[]): any {
  return {
    name: decl.name,
    x: ns,
    y: stats.map((s) => s.stats.mean),
    type: "scatter",
    error_y: {
      type: "data", visible: true, array: stats.map((s) => s.stats.moe)
    },
    text: stats.map((s) => s.hz.toFixed(2) + " op/s")
  };
}

type BenchmarkDeclaration<Input> = {
  name: string,
  setup: (input: Input) => void,
  fn: (() => void) | string
};

let left: any;
let right: any;

const concatList: BenchmarkDeclaration<number> = {
  name: "List",
  setup: (n) => {
    left = L.range(0, n);
    right = L.range(n, 2 * n);
  },
  fn: () => L.concat(left, right)
};

const concatLodash: BenchmarkDeclaration<number> = {
  name: "Lodash",
  setup: (n) => {
    left = _.range(0, n);
    right = _.range(n, 2 * n);
  },
  fn: () => _.concat(left, right)
};

const concatArray: BenchmarkDeclaration<number> = {
  name: "Array#concat",
  setup: (n) => {
    left = _.range(0, n);
    right = _.range(n, 2 * n);
  },
  fn: () => left.concat(right)
};

const concatImmutable: BenchmarkDeclaration<number> = {
  name: "Immutable.js",
  setup: (n) => {
    left = List(_.range(0, n));
    right = List(_.range(n, 2 * n));
  },
  fn: () => left.concat(right)
};

const concatFinger: BenchmarkDeclaration<number> = {
  name: "Finger",
  setup: (n) => {
    left = Finger.nil;
    for (let i = 0; i < n; ++i) {
      left = Finger.append(i, left);
    }
    right = Finger.nil;
    for (let i = n; i < 2 * n; ++i) {
      right = Finger.append(i, right);
    }
  },
  fn: () => Finger.concat(left, right)
};

const benchmarks = [
  concatList,
  concatLodash,
  concatArray,
  concatImmutable,
  concatFinger
];

async function main(): Promise<void> {
  const ns = [10, 20, 32, 33, 40, 100, 500, 1000];
  const data = [];
  for (const decl of benchmarks) {
    const result = await runBenchmark(ns, decl);
    data.push(plotData(decl, ns, result));
  }
  await writeFile("data.json", JSON.stringify(data));
}

main();
