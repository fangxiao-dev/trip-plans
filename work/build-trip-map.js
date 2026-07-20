const fs = require('fs');
const path = require('path');

const root = 'E:/Personal/旅行';
const templatePath = path.join(root, '.agents/skills/trip-map-builder/assets/template.html');
const dataPath = path.join(root, 'work/trip-data.json');
const outputPath = path.join(root, 'outputs/thailand-honeymoon-map.html');
const portalOutputPath = path.join(root, 'outputs/index.html');
const boardOutputPath = path.join(root, 'outputs/thailand-honeymoon-board.html');
const coordinateAuditPath = path.join(root, 'work/trip-map-coordinate-audit.json');
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

const HOTEL = { name: hotels.bkk1.name, lat: 13.7205, lng: 100.5272 };
const overview = `function overviewContent() { return \`<div class="hero"><h1>泰国蜜月 · 慢慢走，好好住</h1><p class="subtitle">2026.09.24 — 10.05 · 曼谷、芭提雅、沙美岛</p></div><div class="info-grid"><div class="info-card"><div class="label">四段住宿</div><div class="value">已确定；详情从行程数据同步</div></div><div class="info-card"><div class="label">往返航班</div><div class="value">BKK 抵达与返程；班次待复核</div></div><div class="info-card"><div class="label">海岛交通</div><div class="value">班佩 ↔ Na Dan；船票与接送待确认</div></div><div class="info-card"><div class="label">地图性质</div><div class="value">参考路线，可随天气与体力调整</div></div></div><div class="section-head">行程概览</div><div class="day-list">\${DAYS.slice(1).map(d=>\`<div class="card" onclick="go(\${d.id})"><div class="name"><span class="dot" style="background:\${d.color}"></span>\${d.label} · \${d.title}</div><div class="desc">\${d.date}</div></div>\`).join('')}</div><div class="section-head">出发前复核</div><div class="pay-summary"><h4>不要把待确认项当成已预订</h4><p class="warn">大巴、班佩—沙美岛交通、船票、码头接送、上岛费及跳岛/浮潜天气，均以出发前与当天信息为准。</p></div><div class="pay-summary"><h4>酒店已确定</h4><p class="ok-text">四个首选酒店已写入地图；价格、库存、房型和取消条件仍需出发前复核。</p></div><div class="section-head">图例</div><div class="legend"><div class="legend-item"><div class="legend-dot" style="background:var(--tint-blue)"></div>景点</div><div class="legend-item"><div class="legend-dot" style="background:var(--tint-orange)"></div>住宿</div><div class="legend-item"><div class="legend-dot" style="background:var(--text-tertiary)"></div>交通</div><div class="legend-item"><div class="legend-dot" style="background:var(--tint-purple)"></div>咖啡/晚餐区域</div></div>\`; }`;

const enhancementCss = String.raw`<style>
:root{--font-meta:16px;--font-body:18px;--font-title:22px;--font-heading:27px;--font-hero:36px;--font-button:16px}
body{color:#123f37!important;background:repeating-linear-gradient(0deg,rgba(18,63,55,.028) 0 1px,transparent 1px 5px),#f4eedf!important;font-family:"Microsoft YaHei","Noto Sans CJK SC",sans-serif!important}.content-pane{border:1px solid rgba(18,63,55,.18);border-radius:30px;background:rgba(255,250,240,.7);box-shadow:0 18px 40px rgba(31,61,51,.10)}.top-nav{border-color:rgba(18,63,55,.18)!important;background:rgba(255,250,240,.92)!important;box-shadow:none!important}.top-nav .tabs{background:transparent!important}.tab{color:#59756d!important;background:rgba(244,238,223,.86)!important;font-weight:800!important}.tab.active{color:#fffaf0!important;background:#123f37!important}.page-switch{background:#df6348!important;box-shadow:0 8px 18px rgba(223,99,72,.18)}.date-tab{border-color:rgba(18,63,55,.18);background:#fffaf0;color:#59756d}.date-tab.active{border-color:#df6348;background:#df6348;color:#fffaf0}.content{background:transparent}.card{border:1px solid rgba(18,63,55,.18);border-left:6px solid #df6348;border-radius:22px;background:#fffaf0;box-shadow:0 12px 26px rgba(31,61,51,.08)}.location-card:nth-child(3n) .card{border-left-color:#5ca9a0}.location-card:nth-child(3n+2) .card{border-left-color:#d99137}.card .name{color:#123f37}.card .desc,.card .time,.details{color:#59756d}.section-head{color:#59756d}.timeline::before{background:rgba(18,63,55,.18)}.tl-dot{box-shadow:0 0 0 4px #f4eedf}.map-pane #map{border:1px solid rgba(18,63,55,.18);box-shadow:0 18px 40px rgba(31,61,51,.10)}.leaflet-bar a{color:#123f37!important;background:#fffaf0!important;border-bottom-color:rgba(18,63,55,.18)!important}.leaflet-popup-content-wrapper{background:#fffaf0!important;color:#123f37!important}.leaflet-popup-tip{background:#fffaf0!important}.map-pin{border-color:#fffaf0!important}
.trip-layout{width:100%;margin:0 auto}.content-pane,.map-pane{min-width:0}.top-nav{display:flex;align-items:center;gap:10px}.top-nav .tabs{flex:1;min-width:0;border-radius:14px;box-shadow:var(--shadow-sm)}.page-switch{display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;padding:10px 14px;border-radius:12px;background:#164d46;color:#fff;text-decoration:none;font-size:var(--font-meta);font-weight:700;white-space:nowrap}.date-tabs{display:flex;gap:8px;overflow-x:auto;margin:12px 0 18px;padding-bottom:2px}.date-tab{flex:0 0 auto;border:1px solid var(--separator);border-radius:999px;background:var(--bg-elevated);color:var(--text-secondary);padding:8px 13px;font:600 var(--font-meta)/1 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;cursor:pointer}.date-tab.active{border-color:var(--accent);background:var(--accent);color:#fff}.info-card .label,.section-head,.day-head p,.route-bar,.card .time,.legend{font-size:var(--font-meta)}.info-card .value,.pay-summary,.pay-summary h4,.pay-summary p{font-size:var(--font-body)}.pay-summary h4{margin-bottom:6px}.pay-summary{line-height:1.65}.legend{gap:16px;padding:10px 0}.legend-dot{width:10px;height:10px}.day-list .card .name{font-size:var(--font-title)}.day-list .card .desc{font-size:var(--font-body)}.map-pin{width:30px;height:30px;border:2.5px solid #fff;border-radius:50%;display:grid;place-items:center;box-shadow:0 2px 9px rgba(0,0,0,.22);transition:transform .2s ease,box-shadow .2s ease}.map-pin.is-active{transform:scale(1.28);box-shadow:0 0 0 6px rgba(0,113,227,.22),0 4px 13px rgba(0,0,0,.28)}.precision{display:inline-flex;margin-left:6px;padding:2px 7px;border-radius:999px;background:#edf1f6;color:#5d6875;font-size:calc(var(--font-meta) - 3px);font-weight:700;letter-spacing:0}.precision.landfall{background:#e4f4ed;color:#17734c}.precision.area{background:#fff2d8;color:#9a6400}.location-card{scroll-margin:36px}.location-card.location-active{outline:3px solid rgba(0,113,227,.26);box-shadow:0 8px 24px rgba(0,113,227,.14)}
@media(min-width:980px){html,body{height:100%;overflow:hidden}.trip-layout{display:grid;grid-template-columns:minmax(360px,4fr) minmax(0,6fr);gap:28px;height:100vh;padding:24px 28px}.content-pane{display:flex;height:calc(100vh - 48px);min-height:0;flex-direction:column}.top-nav{flex:0 0 auto;margin:0 18px 14px;padding:10px 12px;background:var(--bg-elevated);border:1px solid var(--separator);border-radius:14px}.top-nav .tabs{position:static;top:auto;padding:0;background:transparent;border:0;box-shadow:none}.content{max-width:none;flex:1 1 auto;height:auto;margin:0;overflow-y:auto;padding:10px 18px 48px}.map-pane{height:calc(100vh - 48px);min-height:0}.map-pane #map{position:static;height:100%;min-height:0;border-radius:22px;box-shadow:var(--shadow-md)}.tab{font-size:var(--font-meta);padding:8px 16px}.hero{padding:16px 0 24px;text-align:left}.hero h1{font-size:var(--font-hero)}.hero .subtitle{font-size:calc(var(--font-body) + 2px)}.day-head h2{font-size:var(--font-heading)}.day-head p,.section-head{font-size:calc(var(--font-meta) + 1px)}.info-card{padding:18px}.card{padding:19px 21px}.card .time{font-size:var(--font-meta)}.card .name{font-size:var(--font-title);margin:4px 0 6px}.card .desc{font-size:var(--font-body);line-height:1.55}.details{font-size:calc(var(--font-body) - 1px);line-height:1.65}.btn{padding:10px 16px;font-size:var(--font-button)}.timeline{padding-left:28px;padding-bottom:16px}.tl-dot{left:-22px;width:11px;height:11px}.location-card{scroll-margin:48px}}
@media(max-width:979px){.trip-layout{display:flex;flex-direction:column}.map-pane{order:1}.content-pane{order:2}.map-pane #map{height:38vh;min-height:280px;position:sticky;top:0}.top-nav{position:sticky;top:0;z-index:10;padding:8px;background:var(--bg-elevated)}.top-nav .tabs{position:static;top:auto;padding:4px;background:transparent;box-shadow:none}.page-switch{padding:9px 11px}.content{max-width:680px}}
</style>`;

const refinementCss = '<style>.content-pane{border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important}.top-nav{margin-bottom:18px!important;padding:0 0 16px!important;border:0!important;border-bottom:1px solid rgba(18,63,55,.22)!important;border-radius:0!important}.top-nav .tabs{gap:10px}.tab,.date-tab{padding:11px 18px!important;font-size:18px!important}.page-switch{padding:13px 22px!important;font-size:18px!important;border-radius:14px!important}.card{border:0!important;border-left:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;padding:20px 12px 20px 22px!important}.tl-item{margin-bottom:0!important}.tl-item:not(:last-child) .card{border-bottom:1px solid rgba(18,63,55,.2)!important}.location-card.location-active .card{background:rgba(255,250,240,.72)!important}.btn{padding:12px 19px!important;font-size:18px!important;border-radius:12px!important}.timeline{padding-right:0}.map-pane #map{border-radius:28px!important}@media(min-width:980px){.content-pane{height:auto!important;min-height:calc(100vh - 48px)}.content{padding:10px 18px 34px!important}.top-nav{margin:0 18px 18px!important}}@media(max-width:979px){.top-nav{padding:10px 0 14px!important}.tab,.date-tab{font-size:16px!important}.page-switch{padding:11px 15px!important;font-size:16px!important}.btn{font-size:16px!important}}</style>';

const spacingRefinementCss = '<style>.top-nav,.top-nav .tabs{background:transparent!important}.tab:not(.active){background:transparent!important}.top-nav{border-bottom-color:rgba(18,63,55,.28)!important}.content-pane,.content{background:transparent!important}@media(min-width:980px){.top-nav{margin-left:42px!important;margin-right:42px!important}.content{padding:24px 42px 64px!important}.timeline{padding-left:32px!important}}@media(max-width:979px){.content{padding-left:24px!important;padding-right:24px!important}}</style>';

const gridSafetyCss = '<style>@media(min-width:980px){.trip-layout{grid-template-columns:40% minmax(0,1fr)!important;width:100%!important}.content-pane,.map-pane{width:100%!important;max-width:none!important;min-width:0!important}.map-pane{overflow:hidden!important}}</style>';

const centeredBarCss = '<style>.place-bar-slot{display:flex;justify-content:center;margin:18px 0 30px}.place-bar-slot .top-nav{width:auto!important;margin:0!important;padding:0 0 14px!important;border:0!important;border-bottom:1px solid rgba(18,63,55,.28)!important}.place-bar-slot .top-nav .tabs{flex:0 1 auto}.tl-item{margin-bottom:16px!important}.card{border:1px solid rgba(18,63,55,.16)!important;border-left:6px solid #df6348!important;border-radius:20px!important;background:rgba(255,250,240,.92)!important;box-shadow:0 10px 24px rgba(31,61,51,.07)!important;padding:22px 24px!important}.tl-item:not(:last-child) .card{border-bottom:1px solid rgba(18,63,55,.16)!important}.location-card:nth-child(3n) .card{border-left-color:#5ca9a0!important}.location-card:nth-child(3n+2) .card{border-left-color:#d99137!important}@media(min-width:980px){.place-bar-slot{margin:22px 0 34px}.place-bar-slot .top-nav{max-width:100%}}@media(max-width:979px){.place-bar-slot{justify-content:flex-start;overflow-x:auto}.place-bar-slot .top-nav{min-width:max-content}}</style>';

const topControlsCss = '<style>.top-nav{margin-top:0!important}.top-nav .tab{padding:14px 24px!important;font-size:20px!important}.top-nav .page-switch{padding:15px 26px!important;font-size:20px!important}.date-tab{padding:12px 21px!important;font-size:19px!important}@media(max-width:979px){.top-nav .tab{padding:11px 17px!important;font-size:17px!important}.top-nav .page-switch{padding:12px 17px!important;font-size:17px!important}.date-tab{padding:10px 16px!important;font-size:17px!important}}</style>';

const outlinedBarCss = '<style>.top-nav{margin-top:34px!important;padding:10px 12px!important;border:1px solid rgba(18,63,55,.3)!important;border-radius:18px!important;background:transparent!important}.top-nav .tabs{background:transparent!important;border:0!important;box-shadow:none!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important}.top-nav .tabs::before,.top-nav .tabs::after{display:none!important}@media(min-width:980px){.top-nav{margin-top:34px!important;margin-bottom:24px!important}}@media(max-width:979px){.top-nav{margin-top:20px!important}}</style>';

const railTabsCss = '<style>.top-nav .tabs{gap:8px!important}.top-nav .place-tab{display:inline-flex;align-items:center;gap:9px;padding:9px 15px!important;border:0!important;border-radius:16px!important;background:transparent!important;color:#123f37!important;font-size:18px!important;font-weight:800!important}.top-nav .place-number{display:grid;width:29px;height:29px;place-items:center;border:2px solid #123f37;border-radius:50%;font-size:11px;font-weight:900}.top-nav .place-tab.active{background:#123f37!important;color:#fffaf0!important}.top-nav .place-tab.active .place-number{border-color:#fffaf0;background:#df6348;color:#123f37}@media(max-width:979px){.top-nav .place-tab{padding:8px 11px!important;font-size:16px!important}.top-nav .place-number{width:25px;height:25px}}</style>';

const enhancementJs = String.raw`<script>
(() => {
  const originalMap = document.getElementById('map');
  const originalTabs = document.getElementById('tabs');
  const content = document.getElementById('content');
  const mapPane = document.querySelector('.map-pane');
  const topNav = document.querySelector('.top-nav');
  const contentPane = document.querySelector('.content-pane');
  const tabs = originalTabs.cloneNode(true); originalTabs.replaceWith(tabs); tabs.innerHTML='';
  const markerByLocation = new Map(); let managedLayers = []; let activeLocationId = null;
  const precisionLabel = { exact:'精确地点', landfall:'陆地入口', area:'区域定位' };
  const colors = { food:'#df6348', spot:'#5ca9a0', drink:'#d99137', hotel:'#df6348', transport:'#59756d' };
  const emojis = { food:'🍽️', spot:'📍', drink:'☕', hotel:'🏨', transport:'↔' };
  function removeLayers(){ if(typeof clearMap==='function') clearMap(); managedLayers.forEach((layer)=>map.removeLayer(layer)); managedLayers=[]; markerByLocation.clear(); }
  function pin(loc, color){ return L.divIcon({className:'',html:'<div class="map-pin" data-pin-id="'+loc.locationId+'" style="background:'+color+'">'+(emojis[loc.type]||'📌')+'</div>',iconSize:[30,30],iconAnchor:[15,15],popupAnchor:[0,-17]}); }
  function cleanActive(){ document.querySelectorAll('.location-card.location-active').forEach((el)=>el.classList.remove('location-active')); document.querySelectorAll('.map-pin.is-active').forEach((el)=>el.classList.remove('is-active')); }
  function activateLocation(id, fromMarker){ const locEntry = markerByLocation.get(id); const card = document.getElementById('card-'+id); cleanActive(); activeLocationId=id; if(card){card.classList.add('location-active'); if(fromMarker) card.scrollIntoView({behavior:'smooth',block:'center'});} if(locEntry){const el=locEntry.marker.getElement();if(el)el.querySelector('.map-pin').classList.add('is-active'); if(!fromMarker){map.flyTo([locEntry.loc.lat,locEntry.loc.lng],Math.max(map.getZoom(),15),{duration:.45});locEntry.marker.openPopup();}} }
  const placeGroups = [{id:'bangkok-start',label:'曼谷',dayIds:[1,2,3,4]},{id:'pattaya',label:'芭提雅',dayIds:[5,6]},{id:'samet',label:'沙美岛',dayIds:[7,8,9,10]},{id:'bangkok-return',label:'返程曼谷',dayIds:[11,12]}]; let currentPlace='bangkok-start';
  function groupForDay(dayId){ return placeGroups.find((group)=>group.dayIds.includes(dayId)); }
  function renderPlaceTabs(){ tabs.innerHTML=placeGroups.map((group,index)=>'<button class="tab place-tab'+(group.id===currentPlace?' active':'')+'" type="button" data-place="'+group.id+'"><span class="place-number">'+String(index+1).padStart(2,'0')+'</span><span>'+group.label+'</span></button>').join(''); }
  function dateTabsHtml(dayId){ const group=groupForDay(dayId); if(!group)return ''; return '<div class="date-tabs" role="tablist" aria-label="'+group.label+'日期">'+group.dayIds.map((id)=>{const item=DAYS.find((day)=>day.id===id);return '<button class="date-tab'+(id===dayId?' active':'')+'" type="button" role="tab" aria-selected="'+(id===dayId)+'" data-day="'+id+'">'+item.label+'</button>';}).join('')+'</div>'; }
  function cardHtml(loc, dayId){ const badge = loc.type==='spot'?'景':loc.type==='drink'?'饮':loc.type==='food'?'餐':''; const tag = badge ? '<span class="badge '+loc.type+'">'+badge+'</span>' : ''; const detail = loc.detail || (loc.precision==='area' ? '此点为区域参考，精确集合点/门牌以订单或出发前信息为准。' : ''); const nav = '<button class="btn nav" type="button" onclick="openAS('+JSON.stringify(loc.name)+','+loc.lat+','+loc.lng+','+JSON.stringify(loc.navQuery)+')">📍 导航</button>'; return '<article class="tl-item location-card" id="card-'+loc.locationId+'" data-location-id="'+loc.locationId+'" tabindex="0"><div class="tl-dot '+loc.type+'"></div><div class="card"><div class="time">'+(loc.time==='—'?'备选':loc.time)+'</div><div class="name">'+tag+' '+loc.name+'<span class="precision '+loc.precision+'">'+(precisionLabel[loc.precision]||'精确地点')+'</span></div><div class="desc">'+loc.desc+'</div><div class="links">'+nav+(loc.reserve?'<a href="'+loc.reserve+'" target="_blank" class="btn rsv">📅 住宿</a>':'')+'</div>'+(detail?'<div class="details">'+detail+'</div>':'')+'</div></article>'; }
  window.renderDay = function(idx){ const day=DAYS.find((item)=>item.id===idx); if(!day)return ''; const main=day.locations.filter((loc)=>loc.time!=='—'); const alternatives=day.locations.filter((loc)=>loc.time==='—'); let html='<div class="day-head"><h2>'+day.title+'</h2><p>'+day.date+'</p></div>'+dateTabsHtml(idx); if(main.length)html+='<div class="section-head">行程</div><div class="timeline">'+main.map((loc)=>cardHtml(loc,idx)).join('')+'</div>'; if(alternatives.length)html+='<div class="section-head">备选</div><div class="timeline">'+alternatives.map((loc)=>cardHtml(loc,idx)).join('')+'</div>'; return html; };
  window.showDay = function(idx){ removeLayers(); if(idx===0){const pts=[]; DAYS.slice(1).forEach((day)=>day.locations.forEach((loc)=>{pts.push([loc.lat,loc.lng]); const marker=L.circleMarker([loc.lat,loc.lng],{radius:5,fillColor:day.color,color:'#fff',weight:1.5,fillOpacity:.95}).addTo(map); marker.on('click',()=>{window.go(day.id);window.setTimeout(()=>activateLocation(loc.locationId,true),60);}); managedLayers.push(marker);})); if(pts.length)map.fitBounds(pts,{padding:[34,34]}); return;} const day=DAYS.find((item)=>item.id===idx); if(!day)return; const coords=[]; day.locations.forEach((loc)=>{const marker=L.marker([loc.lat,loc.lng],{icon:pin(loc,colors[loc.type]||'#007aff')}).addTo(map); marker.bindPopup('<b>'+loc.name+'</b><br><span style="color:#86868b">'+(precisionLabel[loc.precision]||'精确地点')+'</span>'); marker.on('click',()=>activateLocation(loc.locationId,true)); markerByLocation.set(loc.locationId,{marker,loc}); managedLayers.push(marker); if(loc.time!=='—')coords.push([loc.lat,loc.lng]);}); if(coords.length>1){const line=L.polyline(coords,{color:day.color,weight:3,opacity:.58,dashArray:'7,6'}).addTo(map);managedLayers.push(line);} if(coords.length)map.fitBounds(coords,{padding:[42,42],maxZoom:15}); };
  window.go = function(idx){ cleanActive(); activeLocationId=null; const group=groupForDay(idx); if(group)currentPlace=group.id; renderPlaceTabs(); contentPane.insertBefore(topNav,content); content.innerHTML=idx===0?overviewContent():renderDay(idx); showDay(idx); content.scrollTo({top:0,behavior:'auto'}); };
  function selectPlace(placeId){ const group=placeGroups.find((item)=>item.id===placeId); if(!group)return; currentPlace=placeId; window.go(group.dayIds[0]); }
  tabs.addEventListener('click',(event)=>{const tab=event.target.closest('.place-tab');if(!tab)return;event.preventDefault();selectPlace(tab.dataset.place);});
  content.addEventListener('click',(event)=>{const dateTab=event.target.closest('.date-tab');if(dateTab){event.preventDefault();window.go(Number(dateTab.dataset.day));return;}const card=event.target.closest('.location-card');if(!card||event.target.closest('.btn,.links'))return;activateLocation(card.dataset.locationId,false);});
  content.addEventListener('keydown',(event)=>{if((event.key==='Enter'||event.key===' ')&&event.target.classList.contains('location-card')){event.preventDefault();activateLocation(event.target.dataset.locationId,false);}});
  window.requestAnimationFrame(()=>{ map.invalidateSize(); selectPlace('bangkok-start'); });
  window.addEventListener('resize',()=>map.invalidateSize());
})();
</script>`;

let html = fs.readFileSync(templatePath, 'utf8');
html = html.replace('<!-- REPLACE: Trip Title -->', '泰国蜜月 · 行程地图');
html = html.replace('<!-- REPLACE: Trip Description -->', '曼谷、芭提雅与沙美岛的可调整参考行程地图');
html = html.replace(/const HOTEL = \{ name: 'Hotel Name', lat: 0, lng: 0 \};[\s\S]*?\n\];/, `const HOTEL = ${JSON.stringify(HOTEL)};\n\nconst DAYS = ${JSON.stringify(DAYS, null, 2)};`);
html = html.replace(/function overviewContent\(\) \{[\s\S]*?(?=\/\/ ║  ENGINE — Do not modify below unless customizing behavior)/, `${overview}\n\n`);
html = html.replace('</head>', `${enhancementCss}${refinementCss}${spacingRefinementCss}${gridSafetyCss}${centeredBarCss}${topControlsCss}${outlinedBarCss}${railTabsCss}</head>`);
html = html.replace(/<div id="map"><\/div>\r?\n<div class="tabs" id="tabs"><\/div>\r?\n<div class="content" id="content"><\/div>/, '<main class="trip-layout"><section class="content-pane" aria-label="地点、日期与行程时间轴"><div class="top-nav"><div class="tabs place-tabs" id="tabs"></div><a class="page-switch" href="thailand-honeymoon-board.html">🏨 住宿选择</a></div><section class="content" id="content"></section></section><aside class="map-pane" aria-label="行程地图"><div id="map"></div></aside></main>');
html = html.replace('</body>', `${enhancementJs}</body>`);
fs.writeFileSync(outputPath, html, 'utf8');
const portalHtml = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>泰国蜜月 · 入口</title><style>:root{color-scheme:light;--ink:#123d38;--accent:#e8664d;--paper:#fffdf6;--line:#d9dfda}*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:32px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;color:var(--ink);background:radial-gradient(circle at top left,#e7f2eb,transparent 34%),var(--paper)}main{width:min(900px,100%)}.eyebrow{color:var(--accent);font-weight:800;letter-spacing:.12em;font-size:13px}.title{font-size:clamp(36px,7vw,64px);line-height:1.08;margin:10px 0 16px;letter-spacing:-.04em}.intro{font-size:18px;line-height:1.65;color:#55706a;max-width:600px}.choices{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;margin-top:34px}.choice{display:block;min-height:230px;padding:28px;text-decoration:none;color:inherit;border:1px solid var(--line);border-radius:24px;background:rgba(255,255,255,.82);box-shadow:0 18px 50px rgba(18,61,56,.1);transition:transform .18s ease,box-shadow .18s ease}.choice:hover{transform:translateY(-4px);box-shadow:0 24px 56px rgba(18,61,56,.16)}.number{color:var(--accent);font-weight:800;font-size:14px}.choice h2{font-size:28px;margin:44px 0 10px;letter-spacing:-.03em}.choice p{margin:0;font-size:16px;line-height:1.6;color:#55706a}@media(max-width:620px){body{padding:22px}.choices{grid-template-columns:1fr}.choice{min-height:190px}.choice h2{margin-top:26px}}</style></head><body><main><div class="eyebrow">THAILAND HONEYMOON · 2026</div><h1 class="title">慢慢走，好好住</h1><p class="intro">两份独立页面放在同一个入口下：一份用于按天查看路线与地图，一份用于查看四段住宿选择。它们暂不共享逻辑或样式。</p><nav class="choices" aria-label="页面入口"><a class="choice" href="thailand-honeymoon-map.html"><div class="number">01 · 行程</div><h2>行程地图</h2><p>按日期切换、查看地图点、路线与导航入口。</p></a><a class="choice" href="thailand-honeymoon-board.html"><div class="number">02 · 住宿</div><h2>住宿选择</h2><p>查看四段住宿的首选方案与对比信息。</p></a></nav></main></body></html>`;
fs.writeFileSync(portalOutputPath, portalHtml, 'utf8');
let boardHtml = fs.readFileSync(boardOutputPath, 'utf8');
if (!boardHtml.includes('data-page-switch="map"')) {
  boardHtml = boardHtml.replace('</head>', '<style>.page-switch-map{position:fixed;z-index:20;top:20px;right:22px;display:inline-flex;align-items:center;gap:7px;padding:11px 15px;border-radius:999px;background:#164d46;color:#fff;text-decoration:none;font:700 14px/1 -apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;box-shadow:0 8px 24px rgba(13,73,63,.2)}@media(max-width:700px){.page-switch-map{top:12px;right:12px;padding:9px 12px}}</style></head>');
  boardHtml = boardHtml.replace('<body>', '<body><a class="page-switch-map" data-page-switch="map" href="thailand-honeymoon-map.html">🗺️ 行程地图</a>');
  fs.writeFileSync(boardOutputPath, boardHtml, 'utf8');
}
if (!boardHtml.includes('data-personal-board')) {
  boardHtml = boardHtml.replaceAll('<strong>为什么留着：</strong>', '');
  boardHtml = boardHtml.replace('</head>', '<style data-personal-board>.stay-reason{font-style:normal}.stay-reason strong{display:none}@media(min-width:1081px){.page-top{align-items:start}.rail{top:50vh;transform:translateY(-50%)}.intro,.stage-header{display:none}.content{padding-top:8px}.stay-selector{margin-top:0}}@media(max-width:1080px){.stage-header{display:none}.intro{display:none}.stay-selector{margin-top:0}}</style></head>');
  boardHtml = boardHtml.replace('</body>', '<script data-personal-board>const railTitle=document.querySelector(\".rail-top h1\");const railKicker=document.querySelector(\".rail-top p\");const railMeta=document.querySelector(\".rail-top span\");function updateRail(button){const copy=button.querySelector(\".rail-copy\");if(!copy)return;const title=copy.querySelector(\"strong\")?.textContent.split(\" · \")[0]||\"这趟的落脚点\";const date=copy.querySelector(\"small\")?.textContent||\"\";const note=copy.querySelector(\"span\")?.textContent||\"\";railKicker.textContent=\"我们这次住哪儿\";railTitle.textContent=title;railMeta.textContent=[date,note].filter(Boolean).join(\" · \");}document.querySelectorAll(\"[data-stage-target]\").forEach((button)=>button.addEventListener(\"click\",()=>updateRail(button)));updateRail(document.querySelector(\"[data-stage-target]\"));</script></body>');
  fs.writeFileSync(boardOutputPath, boardHtml, 'utf8');
}
const coordinateAudit = DAYS.slice(1).flatMap((day) => day.locations.map((location) => ({ date: day.date, location_id: location.locationId, name: location.name, latitude: location.lat, longitude: location.lng, precision: location.precision, source: location.coordinateSource, note: location.coordinateNote, navigation_query: location.navQuery })));
fs.writeFileSync(coordinateAuditPath, JSON.stringify({ generated_at: new Date().toISOString(), policy: '海湾类地点使用可抵达入口或相邻度假村 POI；区域定位不伪装为精确位置。', locations: coordinateAudit }, null, 2) + '\n', 'utf8');
console.log(`Wrote ${outputPath}`);
console.log(`Wrote ${portalOutputPath}`);
