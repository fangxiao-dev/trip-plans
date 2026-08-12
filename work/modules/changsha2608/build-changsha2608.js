const fs = require('fs');
const path = require('path');
const { renderTripMap } = require('../../shared/trip-map/render-trip-map');

const root = path.resolve(__dirname, '..', '..', '..');
const dataPath = path.join(__dirname, 'trip-data.json');
const outputDir = path.join(root, 'outputs', 'ing', 'changsha2608');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, 'index.html'), renderTripMap(data), 'utf8');

console.log(`Wrote ${data.route} to ${outputDir}`);
