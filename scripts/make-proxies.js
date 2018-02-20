const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const pkg = require("../package.json");

const readDir = promisify(fs.readdir);
const mkDir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);

const noop = () => {};

const removeExt = (ext, str) => path.basename(str, `.${ext}`);

const fileProxy = file => `{
  "name": "${pkg.name}/${removeExt("js", file)}",
  "private": true,
  "main": "../dist/${file}",
  "module": "../dist/es/${file}"
}
`;

async function processDir(dir) {
  const files = (await readDir(dir)).filter(
    file => /\.js$/.test(file) && file !== "index.js"
  );
  return await Promise.all(
    files.map(async file => {
      const proxyDir = removeExt("js", file);
      await mkDir(proxyDir).catch(noop);
      await writeFile(`${proxyDir}/package.json`, fileProxy(file));
      return proxyDir;
    })
  );
}

processDir("dist").then(proxies =>
  console.log(`Proxy directories (${proxies.join(", ")}) generated!`)
);
