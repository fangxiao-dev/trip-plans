const fs = require('fs');
const path = require('path');
const { renderTripMap } = require('../../shared/trip-map/render-trip-map');

const root = path.resolve(__dirname, '..', '..', '..');
const slug = path.basename(__dirname);
const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'trip-data.json'), 'utf8'));

if (data.route !== `/ing/${slug}/`) {
  throw new Error(`trip-data.json route must be /ing/${slug}/`);
}

const outputDir = path.join(root, 'outputs', 'ing', slug);
const html = renderTripMap(data);

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, 'index.html'), html, 'utf8');

console.log(`Wrote ${data.route} to ${outputDir}`);
