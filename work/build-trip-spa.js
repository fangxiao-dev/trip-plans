const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const outputsDir = path.join(root, 'outputs');
const routeDir = path.join(outputsDir, 'ing', 'honeymoon-with-liv');
const formerRouteDir = path.join(outputsDir, 'ing', 'honeymoon-with-live');
const legacyMapPath = path.join(outputsDir, 'thailand-honeymoon-map.html');
const legacyBoardPath = path.join(outputsDir, 'thailand-honeymoon-board.html');
const legacyPrototypePath = path.join(outputsDir, 'thailand-honeymoon-layout-prototype.html');

function runLegacyRenderer(scriptName) {
  execFileSync(process.execPath, [path.join(root, 'work', 'legacy', scriptName)], {
    cwd: root,
    stdio: 'inherit'
  });
}

function rewriteStaticPaths(html, links) {
  let output = html
    .replace(/(["'])outputs\/assets\//g, '$1/assets/')
    .replace(/(["'])assets\//g, '$1/assets/');
  for (const [from, to] of Object.entries(links)) output = output.replaceAll(from, to);
  return output;
}

function writeRootEntry() {
  fs.writeFileSync(path.join(outputsDir, 'index.html'), `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="refresh" content="0;url=/ing/honeymoon-with-liv/">
  <title>泰国蜜月 · 行程地图</title>
</head>
<body>
  <p>正在打开行程地图……</p>
  <p><a href="/ing/honeymoon-with-liv/">进入行程地图</a></p>
</body>
</html>
`, 'utf8');
}

function writeStaticRoutes(mapHtml, boardHtml) {
  const detailsDir = path.join(routeDir, 'details');
  fs.rmSync(formerRouteDir, { recursive: true, force: true });
  fs.rmSync(routeDir, { recursive: true, force: true });
  fs.mkdirSync(detailsDir, { recursive: true });

  fs.writeFileSync(path.join(routeDir, 'index.html'), rewriteStaticPaths(mapHtml, {
    'thailand-honeymoon-board.html': '/ing/honeymoon-with-liv/details/'
  }), 'utf8');
  fs.writeFileSync(path.join(detailsDir, 'index.html'), rewriteStaticPaths(boardHtml, {
    'thailand-honeymoon-map.html': '/ing/honeymoon-with-liv/'
  }), 'utf8');
}

runLegacyRenderer('build-unified-board.js');
runLegacyRenderer('build-trip-map.js');

const mapHtml = fs.readFileSync(legacyMapPath, 'utf8');
const boardHtml = fs.readFileSync(legacyBoardPath, 'utf8');
writeStaticRoutes(mapHtml, boardHtml);
writeRootEntry();

for (const legacyPath of [legacyMapPath, legacyBoardPath, legacyPrototypePath]) {
  fs.rmSync(legacyPath, { force: true });
}

console.log(`Wrote static routes to ${routeDir}`);
