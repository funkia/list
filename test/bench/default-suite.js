var benchmark = require("benchmark");

function Suite(name) {
  return new benchmark.Suite(name)
    .on("cycle", function (e) {
      var t = e.target;
      if (t.failure) {
        console.error(padl(10, t.name) + "FAILED: " + e.target.failure);
      }
      else {
        var result = padl(30, t.name)
              + padr(13, t.hz.toFixed(2) + " op/s")
              + " \xb1" + padr(7, t.stats.rme.toFixed(2) + "%")
              + padr(15, " (" + t.stats.sample.length + " samples)");
        console.log(result);
      }
    })
    .on("start", function () {
      console.log("\n\n" + banner(67, this.name));
    })
    .on("complete", function () {
      console.log(banner(67, "Best: " + this.filter("fastest").map("name")));
    });
}
exports.Suite = Suite;

function padl(n, s) {
  while (s.length < n) {
    s += " ";
  }
  return s;
}

function padr(n, s) {
  while (s.length < n) {
    s = " " + s;
  }
  return s;
}

function banner(n, s) {
  s = " " + s + " ";
  while (s.length < n) {
    s = "-" + s + "-";
  }
  return s;
}
