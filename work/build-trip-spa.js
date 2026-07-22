const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const outputsDir = path.join(root, 'outputs');
const routeDir = path.join(outputsDir, 'ing', 'honeymoon-with-live');
const legacyMapPath = path.join(outputsDir, 'thailand-honeymoon-map.html');
const legacyBoardPath = path.join(outputsDir, 'thailand-honeymoon-board.html');
const legacyPrototypePath = path.join(outputsDir, 'thailand-honeymoon-layout-prototype.html');

function runLegacyRenderer(scriptName) {
  execFileSync(process.execPath, [path.join(root, 'work', 'legacy', scriptName)], {
    cwd: root,
    stdio: 'inherit'
  });
}

function extractBody(html) {
  const match = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (!match) throw new Error('Unable to extract HTML body');
  return match[1].replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').trim();
}

function extractStyles(html) {
  return [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)]
    .map((match) => match[1].trim())
    .filter(Boolean)
    .join('\n');
}

function extractScriptBlocks(html) {
  return [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match) => match[1].trim())
    .filter(Boolean);
}

function rewriteLinks(body) {
  return body
    .replace(/href="thailand-honeymoon-board\.html"/g, 'href="?view=details" data-spa-view="details"')
    .replace(/href="thailand-honeymoon-map\.html"/g, 'href="?view=map" data-spa-view="map"')
    .replace(/(?:src|href)="assets\//g, (match) => match.replace('"assets/', '"/assets/'));
}

function writeRootEntry() {
  fs.writeFileSync(path.join(outputsDir, 'index.html'), `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="refresh" content="0;url=/ing/honeymoon-with-live/">
  <title>泰国蜜月 · 行程地图</title>
</head>
<body>
  <p>正在打开行程地图……</p>
  <p><a href="/ing/honeymoon-with-live/">进入行程地图</a></p>
</body>
</html>
`, 'utf8');
}

function writeSpa(mapHtml, boardHtml) {
  fs.rmSync(routeDir, { recursive: true, force: true });
  fs.mkdirSync(routeDir, { recursive: true });

  const mapBody = rewriteLinks(extractBody(mapHtml));
  const boardBody = rewriteLinks(extractBody(boardHtml));
  const mapCss = extractStyles(mapHtml);
  const boardCss = extractStyles(boardHtml);
  // The map renderer has a base script followed by an enhancement script. They
  // share global bindings (for example, DAYS and map), so preserve their native
  // script-tag execution order instead of combining them in a Function scope.
  const mapScripts = extractScriptBlocks(mapHtml);
  const boardScripts = extractScriptBlocks(boardHtml);

  const baseCss = `:root { color-scheme: light; }
html, body { min-height: 100%; margin: 0; }
#app { min-height: 100vh; }
body.spa-map, body.spa-details { overflow-x: hidden; }
`;

  const appJs = `const views = ${JSON.stringify({
    map: { body: mapBody, css: mapCss, scripts: mapScripts, title: '泰国蜜月 · 行程地图' },
    details: { body: boardBody, css: boardCss, scripts: boardScripts, title: '泰国蜜月 · 住宿与旅行攻略' }
  })};

const app = document.getElementById('app');
let activeStyle = null;
let activeView = null;
const mountedViews = new Map();

function readView() {
  return new URLSearchParams(window.location.search).get('view') === 'details' ? 'details' : 'map';
}

function activateStyle(view) {
  if (activeStyle) activeStyle.remove();
  activeStyle = document.createElement('style');
  activeStyle.dataset.spaView = view;
  activeStyle.textContent = views[view].css;
  document.head.appendChild(activeStyle);
}

function bindViewLinks(viewElement) {
  viewElement.querySelectorAll('[data-spa-view]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      mount(link.dataset.spaView, true);
      window.scrollTo({ top: 0, behavior: 'auto' });
    });
  });
}

function mountView(view) {
  let viewElement = mountedViews.get(view);
  if (viewElement) return viewElement;

  viewElement = document.createElement('section');
  viewElement.dataset.spaView = view;
  // The initial map must be visible while Leaflet measures its container.
  viewElement.hidden = activeView !== null;
  viewElement.innerHTML = views[view].body;
  app.appendChild(viewElement);
  bindViewLinks(viewElement);

  // Appending real classic script tags keeps the legacy map scripts in their
  // original global scope and execution order. Each view is initialized once.
  views[view].scripts.forEach((source) => {
    const script = document.createElement('script');
    script.textContent = source;
    viewElement.appendChild(script);
  });
  mountedViews.set(view, viewElement);
  return viewElement;
}

function mount(view, pushState = false) {
  if (!views[view]) view = 'map';
  if (pushState) {
    const query = view === 'details' ? '?view=details' : '';
    window.history.pushState({ view }, '', window.location.pathname + query);
  }
  activateStyle(view);
  if (activeView && mountedViews.has(activeView)) mountedViews.get(activeView).hidden = true;
  const viewElement = mountView(view);
  document.body.classList.remove('spa-map', 'spa-details');
  document.body.classList.add('spa-' + view);
  viewElement.hidden = false;
  document.title = views[view].title;
  activeView = view;
  window.dispatchEvent(new Event('resize'));
}

window.addEventListener('popstate', () => mount(readView()));
mount(readView());
`;

  fs.writeFileSync(path.join(routeDir, 'index.html'), `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
  <meta name="description" content="曼谷、芭提雅与沙美岛的蜜月行程地图与住宿攻略">
  <link rel="canonical" href="https://shaw-is.com/ing/honeymoon-with-live/">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
  <link rel="stylesheet" href="./styles.css">
  <title>泰国蜜月 · 行程地图</title>
</head>
<body>
  <div id="app"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script type="module" src="./app.js"></script>
</body>
</html>
`, 'utf8');
  fs.writeFileSync(path.join(routeDir, 'styles.css'), baseCss, 'utf8');
  fs.writeFileSync(path.join(routeDir, 'app.js'), appJs, 'utf8');
}

runLegacyRenderer('build-unified-board.js');
runLegacyRenderer('build-trip-map.js');

const mapHtml = fs.readFileSync(legacyMapPath, 'utf8');
const boardHtml = fs.readFileSync(legacyBoardPath, 'utf8');
writeSpa(mapHtml, boardHtml);
writeRootEntry();

for (const legacyPath of [legacyMapPath, legacyBoardPath, legacyPrototypePath]) {
  fs.rmSync(legacyPath, { force: true });
}

console.log(`Wrote SPA to ${routeDir}`);
console.log('Removed legacy public HTML routes.');
