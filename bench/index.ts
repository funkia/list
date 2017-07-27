import * as Plotly from "plotly.js/lib/core";

import * as data from "./data.json";

const plotElm = document.getElementById("plot1");

Plotly.plot(plotElm, data, {
  margin: { t: 0 }
});
