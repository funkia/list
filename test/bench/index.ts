import * as Plotly from "plotly.js/lib/core";
import * as _ from "lodash";
import * as R from "ramda";
import * as Benchmark from "benchmark";
import * as chroma from "chroma-js";

// @ts-ignore
import * as data from "./data.json";
// @ts-ignore
import * as tableView from "./view.handlebars";

const colormap = chroma
  .scale(["rgb(50, 213, 119)", "rgb(255, 84, 84)"])
  .mode("hsl");

function scale(min: number, max: number, n: number): number {
  return (n - min) / (max - min);
}

function createDt(text: string) {
  const dt = document.createElement("td");
  dt.textContent = text;
  return dt;
}
function createTh(text: string) {
  const dt = document.createElement("th");
  dt.textContent = text;
  return dt;
}

type TableData = {
  name: string;
  description: string;
  input: any;
  tableRows: {
    name: string;
    data: { color: string; n: number }[];
  }[];
};

function createTableData(plot): TableData {
  const getMean = R.path(["stats", "mean"]);
  const lowHigh: [number, number][] = R.pipe(
    R.pluck("result"),
    // @ts-ignore
    R.map(R.map(getMean)),
    R.transpose,
    R.map(
      R.reduce(([low, high], n: number) => [R.min(low, n), R.max(high, n)], [
        Infinity,
        0
      ])
    )
  )(plot.data);
  const tableRows = plot.data.map(
    (entry: { result: any; testName: string }) => {
      const data = _.map(
        _.zip<any, [number, number]>(entry.result, lowHigh),
        ([r, [low, high]]) => {
          const color = colormap(scale(low, high, r.stats.mean));
          const n = (r.stats.mean / low).toFixed(2);
          return { color, n, fastest: getMean(r) === low };
        }
      );
      return {
        name: entry.testName,
        data
      };
    }
  );
  return {
    name: plot.name,
    description: plot.description,
    tableRows,
    input: plot.input
  };
}

function createData(data) {
  return {
    benchmarks: R.map(createTableData, data)
  };
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

function insertGraphs(): void {
  for (const plot of data) {
    const plotElm = document.createElement("div");
    const input = plot.input;
    const dataForPlot = plot.data.map(({ testName, result }) =>
      plotData(testName, input, result)
    );
    const sortedData = _.reverse(_.sortBy(dataForPlot, d => _.last(d.y)));
    Plotly.plot(
      plotElm,
      sortedData,
      {
        yaxis: {
          title: "Time spent"
        },
        xaxis: {
          title: "Number of elements"
        },
        font: {
          size: 14,
          family: "'Source Sans Pro', sans-serif"
        },
        // autosize: false,
        width: 600,
        height: 350,
        margin: {
          l: 65,
          r: 100,
          b: 40,
          t: 0
        },
        paper_bgcolor: "transparent",
        plot_bgcolor: "transparent"
      },
      {
        modeBarButtons: [
          [
            "zoom2d",
            "pan2d",
            "zoomIn2d",
            "zoomOut2d",
            "autoScale2d",
            "resetScale2d",
            "hoverClosestCartesian",
            "hoverCompareCartesian"
          ]
        ],
        displaylogo: false
      }
    );
    document.getElementById(plot.name + "-graph").appendChild(plotElm);
    // document.body.appendChild(createTable(plot));
  }
}

const div = document.createElement("div");
const viewData = createData(data);
div.innerHTML = tableView(viewData);
document.body.appendChild(div);

insertGraphs();
