const fs = require('fs');
const path = require('path');
const { HOME_LINK_CSS, renderHomeLink, renderTripMap } = require('../../../shared/trip-map/render-trip-map');

const moduleDir = path.resolve(__dirname, '..');
const root = path.resolve(moduleDir, '..', '..', '..');
const dataPath = path.join(moduleDir, 'trip-data.json');
const outputPath = path.join(root, 'outputs/thailand-honeymoon-map.html');
const boardOutputPath = path.join(root, 'outputs/thailand-honeymoon-board.html');
const coordinateAuditPath = path.join(moduleDir, 'trip-map-coordinate-audit.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const candidateById = new Map(data.accommodation_candidates.map((candidate) => [candidate.id, candidate]));
const stayById = new Map(data.stay_segments.map((stay) => [stay.id, stay]));
const selected = (stayId) => candidateById.get(stayById.get(stayId).selected_candidate_id);
const hotels = { bkk1: selected('stay_bangkok_1'), pattaya: selected('stay_pattaya'), samet: selected('stay_koh_samet'), bkk2: selected('stay_bangkok_2') };
const hotel = (candidate, lat, lng, time, desc, detail) => ({ name: candidate.name, lat, lng, type: 'hotel', time, desc, detail, reserve: candidate.url, gmap: `${candidate.name}, Thailand` });
const place = (name, lat, lng, type, time, desc, detail) => ({ name, lat, lng, type, time, desc, detail, gmap: `${name}, Thailand` });

const DAYS = [
  { id: 0, label: '总览', color: '#0c6b63', locations: [] },
  { id: 1, label: '09.24', date: '2026年9月24日 · 抵达曼谷', title: '只做落地与休息', color: '#e8664d', locations: [
    place('素万那普机场 BKK', 13.6900, 100.7501, 'transport', '18:00 后', '抵达后直接进城；接机/机场快线方式待确认。', '航班实际抵达、行李与入境时间决定当晚节奏。'),
    hotel(hotels.bkk1, 13.7205, 100.5272, '晚间', 'Sathorn / Saint Louis 前四晚基地；只安排就近晚饭。', 'Airbnb 精确门牌以订单为准；地图点仅表示 Saint Louis 周边。')
  ] },
  { id: 2, label: '09.25', date: '2026年9月25日 · 曼谷老城与河边', title: '河船串起三座寺庙', color: '#e8664d', locations: [
    place('Saphan Taksin BTS / Sathorn Pier', 13.7188, 100.5143, 'transport', '09:00', '从 Saint Louis 换乘到河边；当天以河船为主。', '河船线路、首末班与码头安排待出发前确认。'),
    place('大皇宫', 13.7500, 100.4913, 'spot', '10:00', '当天唯一核心景点；排队或体力消耗过多就缩减后续。', '开放时间、着装与票务以官方当日信息为准。'),
    place('卧佛寺 Wat Pho', 13.7465, 100.4930, 'spot', '13:30', '与大皇宫同片区，午后按体力停留。'),
    place('郑王庙 Wat Arun', 13.7437, 100.4889, 'spot', '—', '体力充足才加的河对岸备选，不必硬塞。')
  ] },
  { id: 3, label: '09.26', date: '2026年9月26日 · Chatuchak 与 Ari', title: '市场逛够就收，Ari 收尾', color: '#e8664d', locations: [
    place('乍都乍周末市场 Chatuchak', 13.7999, 100.5506, 'spot', '10:00', '市场日；逛到觉得够就离开。', '下雨则直接改 Siam 室内商圈。'),
    { ...place('Ari', 13.7796, 100.5447, 'drink', '16:30', '咖啡或晚饭的生活感收尾区域；店铺临场选。'), dianpingKeyword: 'Ari Bangkok cafe', xhsKeyword: '曼谷 Ari 咖啡' }
  ] },
  { id: 4, label: '09.27', date: '2026年9月27日 · Lumphini / Siam', title: '松弛日，三选二就好', color: '#e8664d', locations: [
    place('伦披尼公园 Lumphini Park', 13.7316, 100.5417, 'spot', '10:00', '轻松散步；炎热或下雨时直接缩短。'),
    place('Siam / Chit Lom', 13.7462, 100.5348, 'spot', '15:00', '室内商圈与补给；不需要走完所有商场。'),
    hotel(hotels.bkk1, 13.7205, 100.5272, '傍晚', '回 Sathorn 按摩或就近晚餐，提前收行李。', '次日大巴集合点和车次待出发前确认。')
  ] },
  { id: 5, label: '09.28', date: '2026年9月28日 · 曼谷 → 芭提雅', title: '抵达日只走海边与周边', color: '#d99137', locations: [
    place('曼谷 → 芭提雅大巴集合点', 13.7307, 100.5418, 'transport', '待确认', '截图口径约 2 小时；实际出发点、班次和行李规则待确认。', '地图点只作市区出发参考，不代表已确认车站。'),
    hotel(hotels.pattaya, 12.9440660, 100.8867208, '入住后', 'Central Pattaya 北侧 Soi 5，靠近海滩；不去 Walking Street。', '房型、抵达时间和入住条款以预订页为准。'),
    place('Pattaya Beach', 12.9426, 100.8871, 'spot', '日落前', '酒店周边散步看海；晚饭在 Central Marina / Terminal 21 灵活选。'),
    place('Terminal 21 Pattaya', 12.9498756, 100.8897673, 'spot', '—', '雨天或想吹空调时的顺路备选。')
  ] },
  { id: 6, label: '09.29', date: '2026年9月29日 · 芭提雅', title: '真理寺为主，老虎园仅替换', color: '#d99137', locations: [
    place('真理寺 Sanctuary of Truth', 12.9727770, 100.8891503, 'spot', '10:00', '完整日的唯一门票型主项目；参观后不再赶远景点。', '门票、开放时间和雨天安排待出发前确认。'),
    place('Terminal 21 Pattaya', 12.9498756, 100.8897673, 'spot', '14:00', '回到北芭提雅吃饭、吹空调或短暂休息；不安排打卡任务。'),
    place('Wong Amat Beach（COSI入口）', 12.9587579, 100.8876018, 'spot', '日落前', '从可抵达的海滩入口看海、散步，作为真理寺后的松弛收尾。'),
    place('Tiger Park Pattaya', 12.8850, 100.8921, 'spot', '—', '仅在明确想去时替换真理寺；不与其同日串联。')
  ] },
  { id: 7, label: '09.30', date: '2026年9月30日 · 芭提雅 → 沙美岛', title: '转岛日，余量比景点重要', color: '#55a59e', locations: [
    hotel(hotels.pattaya, 12.9440660, 100.8867208, '早晨', '退房后前往班佩；上门接送或集合点待确认。', '为路况、码头与行李预留余量。'),
    place('班佩码头 Ban Phe Pier', 12.6270870, 101.4385231, 'transport', '待确认', '陆路转船节点；是否直达、船票是否含在接送内待确认。', '截图口径约 5 小时、约 200 泰铢，只作参考。'),
    place('Na Dan Pier', 12.5748563, 101.4635254, 'transport', '待确认', '上岛主码头；联系 Larissa 确认接送或双条车下车点。'),
    hotel(hotels.samet, 12.5694651, 101.4686256, '傍晚', 'Sai Kaew 东侧的安静私属小海滩；入住后看海和主街晚饭。', '酒店入口、码头接送与行李动线待出发前复核。')
  ] },
  { id: 8, label: '10.01', date: '2026年10月1日 · 沙美岛', title: '酒店与 Sai Kaew 的慢休闲', color: '#55a59e', locations: [
    hotel(hotels.samet, 12.5694651, 101.4686256, '上午', '私属小海滩看海、浅浮潜或放空；不需要租车。', '酒店餐饮、海况与浮潜条件待当天判断。'),
    place('Sai Kaew Beach（度假村入口）', 12.5689077, 101.4669303, 'spot', '下午', '步行范围内的主海滩、主街和补给；按天气与体力调整。')
  ] },
  { id: 9, label: '10.02', date: '2026年10月2日 · 沙美岛环岛', title: '只租一天摩托，南线到日落', color: '#55a59e', locations: [
    place('Ao Wong Duean', 12.5529500, 101.4497100, 'spot', '10:00', '从 Larissa 向南的第一段海湾停留。'),
    place('Ao Thian', 12.5496940, 101.4492830, 'spot', '12:00', '午间海湾，不赶路。'),
    place('Ao Wai', 12.5395000, 101.4460000, 'spot', '14:30', '从道路入口步行到海湾；不把针脚放在水面。'),
    place('Ao Prao', 12.5714000, 101.4491700, 'spot', '日落前', '西岸日落；建议 18:00 前返程，夜间不骑车。', '摩托租赁、油量、头盔和雨天路况待当天确认。')
  ] },
  { id: 10, label: '10.03', date: '2026年10月3日 · 沙美岛天气触发日', title: '晴天出海，雨天原地松弛', color: '#55a59e', locations: [
    place('Na Dan Pier', 12.5748563, 101.4635254, 'transport', '晴天待确认', '仅在海况合适时集合参加跳岛/浮潜。', '船票、集合时间、跳岛线路与天气风险均待出发前确认；下雨则不出海。'),
    hotel(hotels.samet, 12.5694651, 101.4686256, '雨天备选', '留在 Larissa 和 Sai Kaew 周边，按摩、咖啡、看海即可。', '这是等价替代，不是计划失败。')
  ] },
  { id: 11, label: '10.04', date: '2026年10月4日 · 沙美岛 → 曼谷', title: '直接入住 Rangnam，不回 Sathorn', color: '#164d46', locations: [
    place('Na Dan Pier', 12.5748563, 101.4635254, 'transport', '待确认', '离岛回班佩，船票和酒店送码头时间待确认。'),
    place('班佩码头 Ban Phe Pier', 12.6270870, 101.4385231, 'transport', '待确认', '接陆路回曼谷；班次与下车位置待出发前确认。'),
    hotel(hotels.bkk2, 13.7586877, 100.5397268, '傍晚', '帕突南 / Rangnam 缓冲夜；直接入住，不折返 Sathorn。', '精确房型与拖行李路线以订单和当天地图导航为准。'),
    place('King Power Rangnam / Pratunam', 13.7563, 100.5396, 'spot', '—', '抵达够早才轻量补货；晚到就跳过。')
  ] },
  { id: 12, label: '10.05', date: '2026年10月5日 · 曼谷 → 武汉', title: '机场快线返程', color: '#164d46', locations: [
    place('Ratchaprarop Airport Rail Link', 13.7551, 100.5423, 'transport', '待确认', '从酒店前往 BKK 的明确动线；按航班与行李量倒推出发时间。', '班次、拖行李路线和机场预留时间均待出发前确认。'),
    place('素万那普机场 BKK', 13.6900, 100.7501, 'transport', '12:35 起飞', '返程航班；以航司值机、安检和登机口要求为准。')
  ] }
];

const dailyHotel = {
  1: { candidate: hotels.bkk1, lat: 13.7205, lng: 100.5272, desc: 'Sathorn / Saint Louis 前四晚基地；当天回这里休息。', detail: 'Airbnb 精确门牌以订单为准；地图点仅表示 Saint Louis 周边。' },
  2: { candidate: hotels.bkk1, lat: 13.7205, lng: 100.5272, desc: 'Sathorn / Saint Louis 前四晚基地；出发前从这里开始。', detail: 'Airbnb 精确门牌以订单为准；地图点仅表示 Saint Louis 周边。' },
  3: { candidate: hotels.bkk1, lat: 13.7205, lng: 100.5272, desc: 'Sathorn / Saint Louis 前四晚基地；出发前从这里开始。', detail: 'Airbnb 精确门牌以订单为准；地图点仅表示 Saint Louis 周边。' },
  4: { candidate: hotels.bkk1, lat: 13.7205, lng: 100.5272, desc: 'Sathorn / Saint Louis 前四晚基地；当天回这里整理行李。', detail: 'Airbnb 精确门牌以订单为准；地图点仅表示 Saint Louis 周边。' },
  5: { candidate: hotels.pattaya, lat: 12.9440660, lng: 100.8867208, desc: 'Central Pattaya 北侧 Soi 5；芭提雅两晚基地。', detail: '房型、抵达时间和入住条款以预订页为准。' },
  6: { candidate: hotels.pattaya, lat: 12.9440660, lng: 100.8867208, desc: 'Central Pattaya 北侧 Soi 5；当天从这里出发、回这里休息。', detail: '房型、抵达时间和入住条款以预订页为准。' },
  7: { candidate: hotels.samet, lat: 12.5694651, lng: 101.4686256, desc: 'Larissa Samed Resort；抵达沙美岛后的四晚基地。', detail: '酒店入口、码头接送与行李动线待出发前复核。' },
  8: { candidate: hotels.samet, lat: 12.5694651, lng: 101.4686256, desc: 'Larissa Samed Resort；Sai Kaew 附近的四晚基地。', detail: '酒店餐饮、海况与浮潜条件待当天判断。' },
  9: { candidate: hotels.samet, lat: 12.5694651, lng: 101.4686256, desc: 'Larissa Samed Resort；环岛日从这里出发并回这里休息。', detail: '摩托租赁、油量、头盔和雨天路况待当天确认。' },
  10: { candidate: hotels.samet, lat: 12.5694651, lng: 101.4686256, desc: 'Larissa Samed Resort；天气触发日的固定基地。', detail: '晴天出海、雨天原地松弛，均以当天海况为准。' },
  11: { candidate: hotels.bkk2, lat: 13.7586877, lng: 100.5397268, desc: 'True Siam Rangnam Hotel；返程前一晚的机场动线基地。', detail: '精确房型与拖行李路线以订单和当天地图导航为准。' },
  12: { candidate: hotels.bkk2, lat: 13.7586877, lng: 100.5397268, desc: 'True Siam Rangnam Hotel；返程当天从这里出发。', detail: '按航班与行李量倒推出发时间。' }
};

DAYS.slice(1).forEach((day) => {
  const stay = dailyHotel[day.id];
  if (!stay || day.locations.some((location) => location.type === 'hotel' && location.name === stay.candidate.name)) return;
  day.locations.unshift(hotel(stay.candidate, stay.lat, stay.lng, '出发前', stay.desc, stay.detail));
});

const coordinateMetadata = {
  '沙吞安静联排别墅，靠近Saint Louis轻轨站': { precision: 'area', source: 'Airbnb 公开区域信息', note: '订单确认后才会显示精确门牌。' },
  '曼谷 → 芭提雅大巴集合点': { precision: 'area', source: '当前行程截图', note: '上车点尚未确认，地图只表达曼谷市区出发区域。' },
  'Ao Wong Duean': { precision: 'landfall', source: 'Vongdeuan Resort POI', note: '以可抵达的度假村/海湾入口代替海湾中心。' },
  'Ao Thian': { precision: 'landfall', source: 'Sangthian Beach Resort POI', note: '以可抵达的度假村/海湾入口代替海湾中心。' },
  'Ao Wai': { precision: 'landfall', source: 'Ao Wai 道路入口', note: '以道路入口代替海湾水面中心。' },
  'Ao Prao': { precision: 'landfall', source: 'Ao Prao Resort POI', note: '以度假村入口代替西岸海湾中心。' },
  'Wong Amat Beach（COSI入口）': { precision: 'landfall', source: 'COSI Pattaya Wong Amat Beach POI', note: '以酒店旁可抵达入口定位。' },
  'Sai Kaew Beach（度假村入口）': { precision: 'landfall', source: 'Sai Kaew Beach Resort POI', note: '以可抵达入口定位。' }
};

DAYS.forEach((day) => day.locations.forEach((location, index) => {
  const meta = coordinateMetadata[location.name] || { precision: 'exact', source: 'OpenStreetMap / 公共 POI 复核', note: '以公共地点或交通设施入口定位。' };
  location.locationId = `d${day.id}-l${index + 1}`;
  location.precision = meta.precision;
  location.coordinateSource = meta.source;
  location.coordinateNote = meta.note;
  location.navQuery = location.gmap || `${location.name}, Thailand`;
}));

const googleMapsUrl = (query) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
const dayKey = (id) => `day-${id}`;
const precisionLabels = { exact: '精确地点', landfall: '陆地入口', area: '区域定位' };
const weekdayOf = (label) => {
  const [month, day] = label.split('.').map(Number);
  const date = new Date(Date.UTC(2026, month - 1, day));
  return new Intl.DateTimeFormat('zh-CN', { weekday: 'short', timeZone: 'UTC' }).format(date);
};

const navigationGroups = [
  { id: 'bangkok-start', label: '曼谷', dayIds: [1, 2, 3, 4].map(dayKey) },
  { id: 'pattaya', label: '芭提雅', dayIds: [5, 6].map(dayKey) },
  { id: 'samet', label: '沙美岛', dayIds: [7, 8, 9, 10].map(dayKey) },
  { id: 'bangkok-return', label: '返程曼谷', dayIds: [11, 12].map(dayKey) }
];

const trip = {
  route: '/ing/honeymoon-with-liv/',
  eyebrow: 'THAILAND · HONEYMOON TRIP',
  title: '泰国蜜月行程地图',
  description: '曼谷、芭提雅与沙美岛的十二天蜜月行程地图',
  dateRange: '2026.09.24 ~ 10.05',
  basemap: 'osm',
  detailsHref: '/ing/honeymoon-with-liv/details/',
  navigationGroups,
  theme: {
    green: '#164d46',
    orange: '#d75d3f',
    blue: '#176ba0'
  },
  base: {
    name: '四段住宿已确定',
    label: '住宿',
    lat: 13.7563,
    lng: 100.5018,
    placeholder: true
  },
  days: DAYS.slice(1).map((day) => {
    const [month, dayOfMonth] = day.label.split('.').map(Number);
    return {
      id: dayKey(day.id),
      label: day.label,
      displayDate: `${month}月${dayOfMonth}日`,
      weekday: weekdayOf(day.label),
      subtitle: day.date.split(' · ').slice(1).join(' · '),
      title: day.title,
      color: day.color,
      locations: day.locations.map((location) => {
        const notices = [{
          kind: 'transport',
          label: `${precisionLabels[location.precision] || '精确地点'} · 定位说明`,
          text: `${location.coordinateNote}（来源：${location.coordinateSource}）`
        }];
        if (location.detail) {
          notices.unshift({
            kind: location.type === 'transport' ? 'transport' : location.type === 'hotel' ? 'ticket' : 'effort',
            label: '出发前确认',
            text: location.detail
          });
        }
        return {
          id: location.locationId,
          name: location.name,
          lat: location.lat,
          lng: location.lng,
          type: location.type,
          time: location.time === '—' ? '备选' : location.time,
          desc: location.desc,
          notices,
          reserve: location.reserve,
          gmap: googleMapsUrl(location.navQuery),
          fit: location.time !== '—',
          optional: location.time === '—'
        };
      })
    };
  })
};

fs.writeFileSync(outputPath, renderTripMap(trip), 'utf8');

let boardHtml = fs.readFileSync(boardOutputPath, 'utf8');
if (!boardHtml.includes('data-personal-board')) {
  boardHtml = boardHtml.replaceAll('<strong>为什么留着：</strong>', '');
  boardHtml = boardHtml.replace('</head>', '<style data-personal-board>.stay-reason{font-style:normal}.stay-reason strong{display:none}@media(min-width:1081px){.page-top{align-items:start}.rail{top:50vh;transform:translateY(-50%)}.intro,.stage-header{display:none}.content{padding-top:8px}.stay-selector{margin-top:0}}@media(max-width:1080px){.stage-header{display:none}.intro{display:none}.stay-selector{margin-top:0}}</style></head>');
  boardHtml = boardHtml.replace('</body>', '<script data-personal-board>const railTitle=document.querySelector(".rail-top h1");const railKicker=document.querySelector(".rail-top p");const railMeta=document.querySelector(".rail-top span");function updateRail(button){const copy=button.querySelector(".rail-copy");if(!copy)return;const title=copy.querySelector("strong")?.textContent.split(" · ")[0]||"这趟的落脚点";const date=copy.querySelector("small")?.textContent||"";const note=copy.querySelector("span")?.textContent||"";railKicker.textContent="我们这次住哪儿";railTitle.textContent=title;railMeta.textContent=[date,note].filter(Boolean).join(" · ");}document.querySelectorAll("[data-stage-target]").forEach((button)=>button.addEventListener("click",()=>updateRail(button)));updateRail(document.querySelector("[data-stage-target]"));</script></body>');
}
if (!boardHtml.includes('data-home-link')) {
  const boardHomeCss = `<style data-home-link>
${HOME_LINK_CSS}
.rail-home-link{top:20px;left:20px}.rail-top{padding-left:54px}
@media(max-width:700px){.rail-home-link{top:10px;left:12px}.rail-top{padding-left:52px}}
@media print{.rail-home-link{display:none}}
</style>`;
  boardHtml = boardHtml.replace('</head>', boardHomeCss + '</head>');
  boardHtml = boardHtml.replace('<div class="rail-top">', renderHomeLink('rail-home-link') + '<div class="rail-top">');
  fs.writeFileSync(boardOutputPath, boardHtml, 'utf8');
}

const coordinateAudit = DAYS.slice(1).flatMap((day) => day.locations.map((location) => ({
  date: day.date,
  location_id: location.locationId,
  name: location.name,
  latitude: location.lat,
  longitude: location.lng,
  precision: location.precision,
  source: location.coordinateSource,
  note: location.coordinateNote,
  navigation_query: location.navQuery
})));
fs.writeFileSync(coordinateAuditPath, JSON.stringify({
  generated_at: new Date().toISOString(),
  policy: '海湾类地点使用可抵达入口或相邻度假村 POI；区域定位不伪装为精确位置。',
  locations: coordinateAudit
}, null, 2) + '\n', 'utf8');

console.log(`Wrote ${outputPath}`);
