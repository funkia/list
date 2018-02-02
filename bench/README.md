# Benchmarks

## Running the benchmarks

Clone the repository, install all the dependencies and build the
library.

```
git clone https://github.com/funkia/list
cd list
npm install
npm run build
cd bench
npm install
```

The benchmarks support comparing List against older versions of
itself. Some secondary List version needs to be present for the
benchamrks to run.

```
git clone https://github.com/funkia/list list-old
cd list-old
npm install
npm run build
```

There are two groups of benchmarks. The first outputs data on the
command line and the second generate graphs for viewing in a browser.

Run the first group with.

```
node index.js
```

Generate the data for the graphs with.

```
npm run create-report-data -- run
```

And view them in your browser by running the following command and
opening [localhost:8080](localhost:8080).

```
npm run serve-report
```

Generating all the data for the benchmarks can take a long time (5-10
minutes). If you're only interested in some of the results you can
filter which benchmark cases are run and which libraries are tested.

For instance to only run the concat and the foldl benchmark run this:

```
npm run create-report-data -- run -b concat foldl
```

To only compare List with and older version of itself you can run:

```
npm run create-report-data -- run -p list
```

The options can be combined. The below command will only run the
concat benchmark and only test List and Lodash.

```
npm run create-report-data -- run -b concat -p list lodash
```
