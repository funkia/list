var fs = require("fs");

var benchmarks = fs.readdirSync(__dirname).filter(function(filename){
  return filename.match(/\.suite\.js$/);
});

console.log("Benchmarks found:");
benchmarks.forEach(function(file) {
  console.log("- " + file);
});

function run (list){
  function visit(length, i) {
    if (length > i) {
      require("./" + list[i])
        .on("complete", function() {
          visit(length, i + 1);
        });
    }
  }
  visit(list.length, 0);
}


run(benchmarks);
