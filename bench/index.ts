import * as Plotly from "plotly.js/lib/core";

import * as data from "./data.json";

for (const plot of data) {
  const header = document.createElement("h1");
  header.textContent = plot.name;
  const plotElm = document.createElement("div");
  Plotly.plot(plotElm, plot.data, {
    margin: { t: 0 }
  });
  document.body.appendChild(header);
  document.body.appendChild(plotElm);
}
