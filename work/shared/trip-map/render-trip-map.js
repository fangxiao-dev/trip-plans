const REQUIRED_LOCATION_FIELDS = ['id', 'name', 'lat', 'lng', 'type', 'time', 'desc'];

function assertTripData(data) {
  if (!data || typeof data !== 'object') throw new Error('Trip data must be an object.');
  if (!data.title || !data.route || !data.base || !Array.isArray(data.days) || data.days.length === 0) {
    throw new Error('Trip data requires title, route, base and at least one day.');
  }
  const locationIds = new Set();
  for (const day of data.days) {
    if (!day.id || !day.label || !day.displayDate || !day.title || !Array.isArray(day.locations)) {
      throw new Error(`Invalid day: ${day.id || '(missing id)'}`);
    }
    for (const location of day.locations) {
      for (const field of REQUIRED_LOCATION_FIELDS) {
        if (location[field] === undefined || location[field] === null || location[field] === '') {
          throw new Error(`Location ${location.id || '(missing id)'} is missing ${field}.`);
        }
      }
      if (locationIds.has(location.id)) throw new Error(`Duplicate location id: ${location.id}`);
      locationIds.add(location.id);
      if (!Number.isFinite(location.lat) || !Number.isFinite(location.lng)) {
        throw new Error(`Location ${location.id} has invalid coordinates.`);
      }
      if (location.notices && !Array.isArray(location.notices)) {
        throw new Error(`Location ${location.id} notices must be an array.`);
      }
      if (!location.notices || location.notices.length === 0) {
        throw new Error(`Location ${location.id} requires at least one location-specific notice.`);
      }
    }
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function serializeForScript(value) {
  return JSON.stringify(value).replaceAll('<', '\\u003c');
}

function renderTripMap(data) {
  assertTripData(data);
  const title = escapeHtml(data.title);
  const description = escapeHtml(data.description || data.summary || data.title);
  const tripJson = serializeForScript(data);

  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${description}">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
:root {
  color-scheme: light;
  --paper: #f5efdf;
  --paper-strong: #fffaf0;
  --paper-soft: #fbf6e9;
  --ink: #123f37;
  --ink-soft: #496b63;
  --ink-faint: #6e867f;
  --line: rgba(18, 63, 55, .18);
  --line-strong: rgba(18, 63, 55, .30);
  --green: #164d46;
  --green-soft: #e2eee8;
  --orange: #d75d3f;
  --orange-soft: #f8e6db;
  --amber: #b66a13;
  --blue: #176ba0;
  --focus: #0b69c7;
  --shadow-map: 0 20px 46px rgba(31, 61, 51, .12);
  --shadow-popover: 0 20px 54px rgba(18, 42, 36, .25);
  --radius-lg: 28px;
  --radius-md: 18px;
  --motion: 200ms cubic-bezier(.22, 1, .36, 1);
}
* { box-sizing: border-box; }
html, body { margin: 0; min-width: 320px; min-height: 100%; }
body {
  color: var(--ink);
  background:
    repeating-linear-gradient(0deg, rgba(18, 63, 55, .025) 0 1px, transparent 1px 5px),
    var(--paper);
  font-family: "Noto Sans SC", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif;
  font-size: 16px;
  line-height: 1.6;
}
button, a { font: inherit; }
button { touch-action: manipulation; }
button:focus-visible, a:focus-visible {
  outline: 3px solid var(--focus);
  outline-offset: 3px;
}
.skip-link {
  position: fixed; z-index: 2000; top: 8px; left: 8px; transform: translateY(-150%);
  padding: 10px 14px; border-radius: 10px; color: #fff; background: var(--focus);
}
.skip-link:focus { transform: translateY(0); }
.trip-shell {
  display: grid;
  grid-template-columns: minmax(390px, 41%) minmax(0, 59%);
  gap: 24px;
  height: 100vh;
  height: 100dvh;
  padding: 24px;
}
.itinerary-pane {
  min-width: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-color: rgba(18, 63, 55, .28) transparent;
}
.itinerary-inner { width: min(720px, 100%); margin: 0 auto; padding: 10px 26px 52px; }
.trip-header {
  position: sticky; z-index: 20; top: 0;
  margin: -10px -4px 0;
  padding: 14px 4px 18px;
  background: linear-gradient(var(--paper) 76%, rgba(245, 239, 223, 0));
}
.eyebrow { margin: 0 0 4px; color: var(--orange); font-size: 13px; font-weight: 800; letter-spacing: .12em; }
h1, h2, h3 { font-family: "Noto Serif SC", "Songti SC", STSong, serif; }
h1 { margin: 0; font-size: clamp(31px, 4vw, 46px); line-height: 1.15; letter-spacing: -.035em; }
.trip-title-row { display: flex; align-items: baseline; gap: 14px; }
.trip-date { flex: 0 0 auto; color: var(--orange); font-size: 16px; font-weight: 750; white-space: nowrap; }
.base-row {
  display: flex; align-items: center; gap: 10px; margin-top: 12px;
  color: var(--ink-soft); font-size: 14px; font-weight: 650;
}
.base-mark {
  display: inline-grid; flex: 0 0 28px; width: 28px; height: 28px; place-items: center;
  border-radius: 50%; color: var(--green); background: var(--green-soft);
}
.base-mark svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 1.8; }
.day-tabs {
  display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px;
  margin-top: 18px; padding-bottom: 15px; border-bottom: 1px solid var(--line-strong);
}
.day-tab {
  min-height: 48px; padding: 7px 8px; border: 1px solid var(--line); border-radius: 14px;
  color: var(--ink-soft); background: rgba(255, 250, 240, .66); cursor: pointer;
  font-weight: 800; transition: color var(--motion), background var(--motion), border-color var(--motion);
}
.day-tab:hover { border-color: var(--green); }
.day-tab[aria-selected="true"] { color: #fffaf0; border-color: var(--green); background: var(--green); }
.day-tab small { display: block; margin-top: 1px; font-size: 11px; font-weight: 650; opacity: .82; }
.day-intro { padding: 24px 4px 8px; }
.day-title-row { display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: baseline; gap: 12px; }
.day-title-row h2 { margin: 0; font-size: clamp(26px, 3vw, 34px); line-height: 1.24; letter-spacing: -.025em; white-space: nowrap; }
.day-title-row p { margin: 0; color: var(--ink-soft); font-size: 15px; font-weight: 650; line-height: 1.55; }
.weather-note {
  display: flex; gap: 10px; margin: 14px 0 2px; padding: 12px 14px;
  border: 1px solid rgba(182, 106, 19, .24); border-radius: 14px;
  color: #70440f; background: rgba(248, 230, 219, .55); font-size: 14px;
}
.weather-note svg { width: 20px; height: 20px; flex: 0 0 20px; fill: none; stroke: currentColor; stroke-width: 1.8; }
.section-label { margin: 20px 0 10px 4px; color: var(--ink-soft); font-size: 13px; font-weight: 850; letter-spacing: .10em; }
.timeline { position: relative; padding-left: 31px; }
.timeline::before { content: ""; position: absolute; top: 24px; bottom: 24px; left: 9px; width: 1px; background: var(--line-strong); }
.route-item { position: relative; scroll-margin: 160px; }
.route-item + .route-item { margin-top: 2px; }
.route-dot {
  position: absolute; z-index: 2; top: 26px; left: -28px; width: 13px; height: 13px;
  border: 3px solid var(--paper); border-radius: 50%; background: var(--day-color, var(--orange));
  box-shadow: 0 0 0 1px var(--line-strong);
}
.route-card {
  position: relative; padding: 21px 18px 22px; border-bottom: 1px solid var(--line);
  border-radius: 14px; transition: background var(--motion), box-shadow var(--motion);
}
.route-card:hover { background: rgba(255, 250, 240, .48); }
.route-item.is-active .route-card { background: var(--paper-strong); box-shadow: 0 10px 30px rgba(31, 61, 51, .08); }
.route-time { color: var(--orange); font-size: 14px; font-weight: 850; letter-spacing: .015em; }
.route-name-row { display: flex; align-items: start; justify-content: space-between; gap: 12px; }
.route-name { margin: 3px 0 5px; font-size: 21px; line-height: 1.35; letter-spacing: -.018em; }
.kind-tag {
  flex: 0 0 auto; margin-top: 7px; padding: 2px 8px; border-radius: 999px;
  color: var(--ink-soft); background: var(--green-soft); font-size: 11px; font-weight: 800;
}
.route-desc { margin: 0; color: var(--ink-soft); font-size: 16px; line-height: 1.65; }
.choices { margin: 9px 0 0; padding-left: 20px; color: var(--ink-soft); font-size: 14px; }
.card-tools { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 13px; }
.notice-tools { display: flex; flex-wrap: wrap; gap: 8px; }
.notice-trigger {
  display: inline-grid; width: 44px; height: 44px; place-items: center; padding: 0;
  border: 1px solid var(--line); border-radius: 50%; color: var(--ink-soft);
  background: var(--paper-soft); cursor: pointer;
  transition: color var(--motion), background var(--motion), border-color var(--motion);
}
.notice-trigger:hover, .notice-trigger[aria-expanded="true"] { color: var(--green); border-color: var(--green); background: var(--green-soft); }
.notice-trigger:active { background: #d4e5dd; }
.notice-trigger svg { width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.nav-link, .reserve-link {
  display: inline-flex; min-height: 44px; align-items: center; justify-content: center; gap: 7px;
  padding: 8px 13px; border-radius: 12px; color: #fff; background: var(--blue);
  font-size: 14px; font-weight: 800; text-decoration: none;
  transition: filter var(--motion);
}
.reserve-link { color: var(--green); border: 1px solid var(--line-strong); background: var(--paper-strong); }
.nav-link:hover, .reserve-link:hover { filter: brightness(.94); }
.nav-link svg, .reserve-link svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 2; }
.card-links { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 8px; }
.map-pane { min-width: 0; min-height: 0; }
#map {
  width: 100%; height: 100%; min-height: 420px; overflow: hidden;
  border: 1px solid var(--line); border-radius: var(--radius-lg); background: #e9efeb;
  box-shadow: var(--shadow-map);
}
.map-fallback { display: grid; height: 100%; place-items: center; padding: 28px; color: var(--ink-soft); text-align: center; }
.map-pin {
  display: grid; width: 32px; height: 32px; place-items: center;
  border: 3px solid var(--paper-strong); border-radius: 50%; color: #fff;
  background: var(--pin-color, var(--orange)); box-shadow: 0 4px 13px rgba(18, 42, 36, .28);
  font: 800 12px/1 system-ui, sans-serif;
}
.map-pin.base { color: var(--green); background: var(--paper-strong); }
.leaflet-popup-content-wrapper { border-radius: 14px; color: var(--ink); background: var(--paper-strong); box-shadow: var(--shadow-popover); }
.leaflet-popup-tip { background: var(--paper-strong); }
.leaflet-popup-content { margin: 13px 15px; font-family: "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif; line-height: 1.55; }
.leaflet-control-zoom a { color: var(--green) !important; background: var(--paper-strong) !important; }
.leaflet-control-attribution { font-size: 9px; }
.notice-popover {
  position: fixed; z-index: 1200; width: min(330px, calc(100vw - 24px));
  padding: 18px 46px 18px 18px; border: 1px solid var(--line-strong); border-radius: 16px;
  color: var(--ink); background: rgba(255, 250, 240, .98); box-shadow: var(--shadow-popover);
  opacity: 0; transform: translateY(7px) scale(.985); pointer-events: none;
  transition: opacity 160ms ease-out, transform var(--motion);
}
.notice-popover[data-open="true"] { opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }
.notice-popover h3 { margin: 0 0 6px; font-size: 17px; line-height: 1.3; }
.notice-list { display: grid; gap: 12px; margin-top: 12px; }
.notice-row { display: grid; grid-template-columns: 34px minmax(0, 1fr); gap: 10px; align-items: start; }
.notice-row + .notice-row { padding-top: 12px; border-top: 1px solid var(--line); }
.notice-row-icon {
  display: grid; width: 34px; height: 34px; place-items: center;
  border-radius: 10px; color: var(--green); background: var(--green-soft);
}
.notice-row-icon svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.notice-row strong { display: block; margin-bottom: 2px; font-size: 13px; }
.notice-row p { margin: 0; color: var(--ink-soft); font-size: 14px; line-height: 1.6; }
.popover-close {
  position: absolute; top: 8px; right: 8px; display: grid; width: 36px; height: 36px; place-items: center;
  padding: 0; border: 0; border-radius: 50%; color: var(--ink-soft); background: transparent; cursor: pointer;
}
.popover-close:hover { color: var(--ink); background: var(--green-soft); }
.popover-close svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 2; }
.locate-control {
  display: grid; width: 44px; height: 44px; place-items: center; padding: 0;
  border: 0; border-radius: 12px; color: var(--green); background: var(--paper-strong); cursor: pointer;
  box-shadow: 0 2px 12px rgba(18, 42, 36, .20);
}
.locate-control svg { width: 21px; height: 21px; fill: none; stroke: currentColor; stroke-width: 2; }
@media (max-width: 900px) {
  html, body { height: 100%; overflow: hidden; }
  .trip-shell { position: relative; display: block; height: 100vh; height: 100dvh; padding: 0; }
  .map-pane { position: absolute; z-index: 1; inset: 0 0 auto; height: 37vh; height: 37dvh; min-height: 250px; }
  #map { min-height: 0; border: 0; border-radius: 0 0 26px 26px; box-shadow: none; }
  .itinerary-pane {
    position: absolute; z-index: 5; inset: max(230px, calc(37dvh - 20px)) 0 0;
    border-radius: 26px 26px 0 0; background: var(--paper); box-shadow: 0 -12px 32px rgba(31, 61, 51, .13);
  }
  .itinerary-inner { width: 100%; padding: 0 16px calc(32px + env(safe-area-inset-bottom)); }
  .trip-header { margin: 0 -16px; padding: 18px 16px 16px; border-radius: 26px 26px 0 0; background: rgba(245, 239, 223, .97); backdrop-filter: blur(16px); }
  .eyebrow { font-size: 12px; }
  h1 { font-size: clamp(29px, 8.5vw, 38px); }
  .trip-title-row { gap: 10px; }
  .trip-date { font-size: 14px; }
  .base-row { margin-top: 11px; }
  .day-tabs { margin-top: 14px; padding-bottom: 0; border: 0; }
  .day-tab { min-height: 48px; font-size: 14px; }
  .day-intro { padding-top: 21px; }
  .timeline { padding-left: 24px; }
  .route-dot { left: -22px; }
  .route-card { padding: 18px 11px 20px 14px; }
  .route-name { font-size: 20px; }
  .card-tools { align-items: flex-end; }
  .notice-popover { left: 12px !important; right: 12px; bottom: calc(12px + env(safe-area-inset-bottom)); top: auto !important; width: auto; }
}
@media (max-width: 520px) {
  .day-tab small { display: none; }
  .route-name-row { display: block; }
  .kind-tag { display: inline-flex; margin: 0 0 6px; }
  .card-tools { display: block; }
  .card-links { justify-content: flex-start; margin-top: 10px; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { scroll-behavior: auto !important; transition-duration: .01ms !important; animation-duration: .01ms !important; }
}
</style>
</head>
<body>
<a class="skip-link" href="#itinerary">跳到行程</a>
<main class="trip-shell">
  <section class="itinerary-pane" id="itinerary" aria-label="长沙行程">
    <div class="itinerary-inner">
      <header class="trip-header">
        <p class="eyebrow" id="trip-eyebrow"></p>
        <div class="trip-title-row"><h1 id="trip-title"></h1><span class="trip-date" id="trip-date"></span></div>
        <div class="base-row"><span class="base-mark" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 20V10l8-6 8 6v10h-6v-6h-4v6H4Z"/></svg></span><span id="trip-base"></span></div>
        <div class="day-tabs" id="day-tabs" role="tablist" aria-label="选择日期"></div>
      </header>
      <div id="day-content" tabindex="-1"></div>
    </div>
  </section>
  <aside class="map-pane" aria-label="行程地图"><div id="map"><div class="map-fallback">地图正在载入；行程文字仍可正常查看。</div></div></aside>
</main>
<aside class="notice-popover" id="notice-popover" role="dialog" aria-modal="false" aria-labelledby="popover-title" aria-describedby="popover-body" hidden>
  <button class="popover-close" type="button" aria-label="关闭提醒"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button>
  <h3 id="popover-title"></h3><div id="popover-body" class="notice-list"></div>
</aside>
<script>
const TRIP = ${tripJson};
const TYPE_LABELS = { hotel: '落脚点', spot: '景点', food: '吃饭', transport: '交通' };
const ICONS = {
  transport: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 17h14M7 17l-2-5 2-5h10l2 5-2 5M8 17v2m8-2v2M8 11h8"/></svg>',
  effort: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3h8M12 3v6m0 0-3 3m3-3 3 3M8 21l2-7h4l2 7"/></svg>',
  ticket: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16v4a2 2 0 0 0 0 4v4H4v-4a2 2 0 0 0 0-4V7Z"/><path d="M12 9v2m0 2v2"/></svg>',
  weather: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 16h10a4 4 0 1 0-1-7 5 5 0 0 0-9 2 2.5 2.5 0 0 0 0 5Z"/><path d="m9 19-1 2m5-2-1 2m5-2-1 2"/></svg>'
};
const NOTICE_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="3"/><path d="M8 8h8M8 12h8M8 16h5"/><circle cx="17" cy="16" r="1" fill="currentColor" stroke="none"/></svg>';
const NAV_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z"/></svg>';
const RESERVE_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5h14v15H5V5Zm3-2v4m8-4v4M5 10h14"/></svg>';
const WEATHER_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 16h10a4 4 0 1 0-1-7 5 5 0 0 0-9 2 2.5 2.5 0 0 0 0-4 4Z"/><path d="m9 19-1 2m5-2-1 2m5-2-1 2"/></svg>';
const safe = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;' }[char]));
const amapUrl = (location) => 'https://uri.amap.com/marker?position=' + location.lng + ',' + location.lat + '&name=' + encodeURIComponent(location.name) + '&src=changsha2608&coordinate=wgs84&callnative=1';

document.getElementById('trip-eyebrow').textContent = TRIP.eyebrow;
document.getElementById('trip-title').textContent = TRIP.title;
document.getElementById('trip-date').textContent = TRIP.dateRange;
document.getElementById('trip-base').textContent = TRIP.base.label + '：' + TRIP.base.name;

const tabs = document.getElementById('day-tabs');
const content = document.getElementById('day-content');
const popover = document.getElementById('notice-popover');
const popoverTitle = document.getElementById('popover-title');
const popoverBody = document.getElementById('popover-body');
let currentDayId = TRIP.days[0].id;
let map;
let layers = [];
let markerByLocation = new Map();
let activeTrigger = null;

function renderTabs() {
  tabs.innerHTML = TRIP.days.map((day) => '<button class="day-tab" type="button" role="tab" data-day="' + safe(day.id) + '" aria-selected="' + (day.id === currentDayId) + '">' + safe(day.label) + '<small>' + safe(day.weekday) + '</small></button>').join('');
}

function noticeButtons(location) {
  if (!location.notices?.length) return '';
  return '<button class="notice-trigger" type="button" data-location="' + safe(location.id) + '" aria-expanded="false" aria-controls="notice-popover" aria-label="查看' + safe(location.name) + '的地点提醒">' + NOTICE_ICON + '</button>';
}

function cardLinks(location) {
  let links = '<a class="nav-link" href="' + amapUrl(location) + '" target="_blank" rel="noreferrer">' + NAV_ICON + '导航</a>';
  if (location.reserve) links += '<a class="reserve-link" href="' + safe(location.reserve) + '" target="_blank" rel="noreferrer">' + RESERVE_ICON + '预约</a>';
  return links;
}

function renderDay(day) {
  const cards = day.locations.map((location) => '<article class="route-item" data-location-id="' + safe(location.id) + '" style="--day-color:' + safe(day.color) + '"><span class="route-dot" aria-hidden="true"></span><div class="route-card"><div class="route-time">' + safe(location.time) + '</div><div class="route-name-row"><h3 class="route-name">' + safe(location.name) + '</h3><span class="kind-tag">' + safe(TYPE_LABELS[location.type] || '地点') + '</span></div><p class="route-desc">' + safe(location.desc) + '</p>' + (location.choices?.length ? '<ul class="choices">' + location.choices.map((choice) => '<li>' + safe(choice) + '</li>').join('') + '</ul>' : '') + '<div class="card-tools"><div class="notice-tools" aria-label="' + safe(location.name) + '提醒">' + noticeButtons(location) + '</div><div class="card-links">' + cardLinks(location) + '</div></div></div></article>').join('');
  content.innerHTML = '<div class="day-intro"><div class="day-title-row"><h2>' + safe(day.displayDate || day.label) + '</h2><p>' + safe(day.title) + '</p></div>' + (day.weather ? '<div class="weather-note">' + WEATHER_ICON + '<span>' + safe(day.weather) + '</span></div>' : '') + '</div><div class="section-label">当天行程</div><div class="timeline">' + cards + '</div>';
}

function clearMap() {
  if (!map) return;
  layers.forEach((layer) => map.removeLayer(layer));
  layers = [];
  markerByLocation.clear();
}

function markerIcon(color, label, isBase = false) {
  return L.divIcon({ className: '', html: '<div class="map-pin' + (isBase ? ' base' : '') + '" style="--pin-color:' + color + '">' + safe(label) + '</div>', iconSize: [32, 32], iconAnchor: [16, 16], popupAnchor: [0, -18] });
}

function showDayOnMap(day) {
  if (!map) return;
  clearMap();
  const coordinates = [];
  day.locations.forEach((location, index) => {
    const marker = L.marker([location.lat, location.lng], { icon: markerIcon(day.color, index + 1) }).addTo(map);
    marker.bindPopup('<strong>' + safe(location.name) + '</strong><br><span>' + safe(location.time) + '</span>');
    marker.on('click', () => activateLocation(location.id, false));
    markerByLocation.set(location.id, marker);
    layers.push(marker);
    coordinates.push([location.lat, location.lng]);
  });
  const baseMarker = L.marker([TRIP.base.lat, TRIP.base.lng], { icon: markerIcon(TRIP.theme.green, '住', true), zIndexOffset: 800 }).addTo(map).bindPopup('<strong>' + safe(TRIP.base.name) + '</strong><br><span>住宿定位锚点</span>');
  layers.push(baseMarker);
  if (coordinates.length > 1) {
    const line = L.polyline(coordinates, { color: day.color, weight: 3, opacity: .62, dashArray: '7 7' }).addTo(map);
    layers.push(line);
  }
  if (coordinates.length) map.fitBounds(coordinates, { padding: [44, 44], maxZoom: 14 });
}

function activateLocation(locationId, openMarker = true) {
  document.querySelectorAll('.route-item').forEach((item) => item.classList.toggle('is-active', item.dataset.locationId === locationId));
  const item = document.querySelector('[data-location-id="' + CSS.escape(locationId) + '"]');
  if (item && !item.matches(':hover')) item.scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  const marker = markerByLocation.get(locationId);
  if (marker && openMarker) { map.panTo(marker.getLatLng()); marker.openPopup(); }
}

function findLocation(locationId) {
  return TRIP.days.flatMap((day) => day.locations).find((location) => location.id === locationId);
}

function positionPopover(trigger) {
  if (window.innerWidth <= 900) return;
  const rect = trigger.getBoundingClientRect();
  const width = popover.offsetWidth || 330;
  const height = popover.offsetHeight || 150;
  const left = Math.min(window.innerWidth - width - 12, Math.max(12, rect.left + rect.width / 2 - width / 2));
  const roomAbove = rect.top - 12;
  const top = roomAbove >= height ? rect.top - height - 10 : Math.min(window.innerHeight - height - 12, rect.bottom + 10);
  popover.style.left = left + 'px';
  popover.style.top = Math.max(12, top) + 'px';
}

function closePopover(restoreFocus = false) {
  if (!activeTrigger) return;
  const previous = activeTrigger;
  previous.setAttribute('aria-expanded', 'false');
  activeTrigger = null;
  popover.dataset.open = 'false';
  window.setTimeout(() => { if (!activeTrigger) popover.hidden = true; }, 180);
  if (restoreFocus) previous.focus();
}

function openNotice(trigger) {
  if (activeTrigger === trigger) { closePopover(true); return; }
  closePopover(false);
  const location = findLocation(trigger.dataset.location);
  if (!location?.notices?.length) return;
  activeTrigger = trigger;
  trigger.setAttribute('aria-expanded', 'true');
  popoverTitle.textContent = location.name + ' · 地点提醒';
  popoverBody.innerHTML = location.notices.map((notice) => '<div class="notice-row"><span class="notice-row-icon">' + (ICONS[notice.kind] || ICONS.transport) + '</span><div><strong>' + safe(notice.label) + '</strong><p>' + safe(notice.text) + '</p></div></div>').join('');
  popover.hidden = false;
  popover.dataset.open = 'false';
  positionPopover(trigger);
  requestAnimationFrame(() => { popover.dataset.open = 'true'; popover.querySelector('.popover-close').focus({ preventScroll: true }); });
}

function selectDay(dayId, moveFocus = false) {
  const day = TRIP.days.find((item) => item.id === dayId);
  if (!day) return;
  closePopover(false);
  currentDayId = day.id;
  renderTabs();
  renderDay(day);
  showDayOnMap(day);
  if (moveFocus) content.focus({ preventScroll: true });
}

tabs.addEventListener('click', (event) => {
  const button = event.target.closest('.day-tab');
  if (button) selectDay(button.dataset.day, true);
});
content.addEventListener('click', (event) => {
  const notice = event.target.closest('.notice-trigger');
  if (notice) { event.stopPropagation(); openNotice(notice); return; }
  if (event.target.closest('a, button')) return;
  const item = event.target.closest('.route-item');
  if (item) activateLocation(item.dataset.locationId, true);
});
content.addEventListener('keydown', (event) => {
  if ((event.key === 'Enter' || event.key === ' ') && event.target.classList.contains('route-card')) {
    event.preventDefault();
    activateLocation(event.target.closest('.route-item').dataset.locationId, true);
  }
});
popover.querySelector('.popover-close').addEventListener('click', () => closePopover(true));
document.addEventListener('pointerdown', (event) => {
  if (activeTrigger && !popover.contains(event.target) && !activeTrigger.contains(event.target)) closePopover(false);
});
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closePopover(true); });
window.addEventListener('resize', () => { if (activeTrigger) positionPopover(activeTrigger); if (map) map.invalidateSize(); });

function initMap() {
  if (!window.L) return;
  document.getElementById('map').innerHTML = '';
  map = L.map('map', { center: [TRIP.base.lat, TRIP.base.lng], zoom: 13, zoomControl: false });
  L.control.zoom({ position: 'topright' }).addTo(map);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap &copy; CARTO' }).addTo(map);
  const LocateControl = L.Control.extend({
    options: { position: 'bottomright' },
    onAdd() {
      const button = L.DomUtil.create('button', 'locate-control');
      button.type = 'button';
      button.setAttribute('aria-label', '定位我的位置');
      button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3"/></svg>';
      L.DomEvent.disableClickPropagation(button);
      button.addEventListener('click', () => map.locate({ setView: true, maxZoom: 15 }));
      return button;
    }
  });
  new LocateControl().addTo(map);
  map.on('locationfound', (event) => L.circleMarker(event.latlng, { radius: 7, color: TRIP.theme.blue, fillColor: TRIP.theme.blue, fillOpacity: .8 }).addTo(map));
}

initMap();
selectDay(currentDayId, false);
</script>
</body>
</html>`;
}

module.exports = { renderTripMap };
