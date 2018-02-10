import * as Plotly from "plotly.js/lib/core";

import * as data from "./data.json";

for (const plot of data) {
  const plotElm = document.createElement("div");
  Plotly.plot(
    plotElm,
    plot.data,
    {
      title: plot.name
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
