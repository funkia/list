import * as Plotly from "plotly.js/lib/core";
import * as _ from "lodash";
import * as data from "./data.json";

for (const plot of data) {
  const plotElm = document.createElement("div");
  const sortedData = _.reverse(_.sortBy(plot.data, (d) => _.last(d.y)));
  Plotly.plot(
    plotElm,
    sortedData,
    {
      title: plot.name,
      yaxis: {
        title: "Time spent"
      },
      xaxis: {
        title: "Number of elements"
      }
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
  document.body.appendChild(plotElm);
}
