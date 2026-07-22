const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const dataPath = path.join(root, 'work/trip-data.json');
const outputPath = path.join(root, 'outputs/thailand-honeymoon-board.html');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const byId = new Map(data.accommodation_candidates.map((candidate) => [candidate.id, candidate]));

const photoChoices = {
  pattaya_best_beach_villa: [[6, '酒店外景'], [2, '卧床'], [5, '公共休息区'], [3, '卫生间']],
  pattaya_edge_central_walking_street: [[1, '酒店外景'], [2, '卧床'], [4, '公共休息区'], [3, '卫生间']],
  pattaya_holiday_inn_express_central: [[3, '酒店外景'], [13, '卧床'], [11, '公共休息区'], [16, '卫生间']],
  pattaya_leela_resort_spa: [[1, '酒店外景'], [4, '卧床'], [2, '公共休息区'], [7, '盥洗区']],
  koh_samet_larissa_private_beach: [[1, '度假村外景'], [18, '卧床'], [16, '露台休憩区'], [19, '海边景观']],
  koh_samet_tubtim_beachfront: [[1, '海滩外景'], [12, '简易别墅外观'], [3, '公共休息区'], [2, '卫生间']],
  koh_samet_viking_ao_thian: [[3, '度假村外景'], [4, '卧床'], [6, '室内休憩区'], [5, '卫生间']],
  koh_samet_samed_garden_aonoinna: [[1, '度假村外景'], [2, '卧床'], [5, '室内休憩区'], [3, '卫生间']],
  bkk2_true_siam_rangnam: [[6, '酒店外景'], [2, '卧床'], [4, '室内休憩区'], [17, '卧床细节']],
  bkk2_global_pratunam: [[1, '酒店外景'], [2, '卧床'], [4, '室内休憩区'], [3, '卫生间']],
  bkk2_siam_star: [[4, '酒店公共区'], [2, '卧床'], [10, '室内休憩区'], [3, '卫生间']],
  bkk2_4m_pratunam: [[1, '酒店外景'], [2, '卧床'], [5, '公共休息区'], [3, '卫生间']]
};
const imageCategoryNotes = {
  koh_samet_larissa_private_beach: 'Booking 页面官方图库未提供卫生间图，第四张保留真实海边景观。',
  koh_samet_tubtim_beachfront: 'Booking 页面官方图库未提供室内卧床图，第二张保留真实简易别墅外观。',
  bkk2_true_siam_rangnam: 'Booking 页面官方图库未提供卫生间图，第四张保留真实卧床细节。',
  bkk2_siam_star: 'Booking 页面官方图库未提供明确酒店外景，第一张保留真实酒店公共区。'
};

const groupDefs = [
  {
    id: 'bangkok1', staySegmentId: 'stay_bangkok_1', city: '曼谷', date: '09.24 — 09.28', nights: '4晚', status: '温馨城市基地', accent: 'coral', primary: 'bkk1_airbnb_sathon_quiet_townhouse',
    candidateIds: ['bkk1_airbnb_sathon_quiet_townhouse', 'bkk1_airbnb_silom_apartment', 'bkk1_airbnb_sathon_one_bed_pool_gym', 'bkk1_airbnb_saint_louis_two_bedroom', 'bkk1_airbnb_silom_cozy_condo_507'],
    tabNames: ['沙吞安静联排别墅', '是隆公寓', '沙吞一卧室公寓', 'Saint Louis 两卧室', '是隆舒适一卧'],
    subtitle: '9月24日抵达 · 3个完整白天',
    guideTitle: '把曼谷拆成三条轻量日线',
    guideLead: 'Saint Louis 是每天回得来的生活基地：老城走河船、北边留给周末市场，Siam 与 Lumphini 负责雨天和松弛收尾。三天不为打卡横穿城市，也不为景点搬住宿。',
    signals: ['河船接老城', '周六乍都乍 + Ari', '雨天切换 Siam', '按摩与蜜月晚餐收尾'],
    fieldNotes: ['寺庙日准备遮肩、过膝衣物；大皇宫是当天唯一必须保留的主景点。', '乍都乍走累就直接去 Ari 或回住处，不再横穿到河边。', 'Airbnb 精确门牌以订单为准，出发前按真实起点复核夜间步行与轻轨入口。'],
    routeTitle: '把代表性留住，不把行程塞满',
    route: [['抵达后，吃一顿就近的晚饭', '安顿、洗澡、早点睡，把第一晚留给适应节奏。'], ['老城与河边', 'Saint Louis → Saphan Taksin → 河船；大皇宫、卧佛寺为主，郑王庙视体力加入。'], ['乍都乍 + Ari', 'Chatuchak 逛到觉得够就离开，再去 Ari 喝咖啡或吃晚饭；雨天改 Siam 室内商圈。'], ['Lumphini / Siam 松弛日', '公园、Siam 或 Chit Lom 三选二；傍晚回 Sathorn 按摩和晚餐。']],
    reminder: 'Saint Louis BTS 是城市移动入口；老城河船、周末市场动线和具体交通时刻均待出发前确认。'
  },
  {
    id: 'pattaya', staySegmentId: 'stay_pattaya', city: '芭提雅', date: '09.28 — 09.30', nights: '2晚', status: '近海轻过渡', accent: 'saffron', primary: 'pattaya_best_beach_villa',
    candidateIds: ['pattaya_best_beach_villa', 'pattaya_edge_central_walking_street', 'pattaya_holiday_inn_express_central', 'pattaya_leela_resort_spa'],
    tabNames: ['Best Beach Villa', 'EDGE Central', 'Holiday Inn Express', 'The Leela'],
    subtitle: '两晚过渡 · 靠海，方便吃饭和走走',
    guideTitle: '把芭提雅当成靠海的过渡段',
    guideLead: 'Best Beach Villa 靠近 Pattaya Beach 与 Terminal 21，抵达日和晚饭都能在酒店周边解决。完整日只留北线真理寺，老虎园若真想去就作为整日替换，不把南北两端硬串。',
    signals: ['海滩步行约 5 分钟', 'Terminal 21 约 12 分钟', '真理寺走北线', '不把 Walking Street 设为主计划'],
    fieldNotes: ['9月30日带行李转岛，优先核实酒店上门接送或固定集合点。', '公共交通可能需要在罗勇换乘并步行到码头，不按“5小时整”卡死末班船。', '若当日体力一般，海滩、商场与泳池已经足够，不再补格兰岛。'],
    routeTitle: '海边走走，晚上再出门',
    route: [['抵达后，海滩日落与附近晚餐', 'Best Beach Villa → Pattaya Beach → Central Marina / Terminal 21；不折返 Walking Street。'], ['真理寺主景点日', '真理寺更顺路；回酒店或 Terminal 21 午餐，下午海滩/泳池休息。老虎园只作为替换项，不与北南两端硬串。'], ['离开前，留出转岛余量', '慢早餐、收好行李，提前确认酒店到班佩的接送/集合点，不把船班卡死。']],
    reminder: 'Best Beach Villa 靠海和市中心北侧；真理寺、老虎园取舍、转班佩交通和具体班次均待出发前确认。'
  },
  {
    id: 'samet', staySegmentId: 'stay_koh_samet', city: '沙美岛', date: '09.30 — 10.04', nights: '4晚', status: '海景慢住', accent: 'lagoon', primary: 'koh_samet_larissa_private_beach',
    candidateIds: ['koh_samet_larissa_private_beach', 'koh_samet_tubtim_beachfront', 'koh_samet_viking_ao_thian', 'koh_samet_samed_garden_aonoinna'],
    tabNames: ['Larissa Samed Resort', 'Tubtim Resort', 'Viking Holiday Resort', 'Samed Garden Resort'],
    subtitle: '海边与酒店是主菜 · 天气和体力可互换',
    guideTitle: '四晚围绕海况，而不是任务表',
    guideLead: 'Larissa 的安静私属小海滩负责看海，Sai Kaew Beach 与主街负责游泳、按摩、补给和晚餐；只有环岛日需要摩托。10月初海况可能很好，也可能午后大雨，所以出海永远是天气触发项。',
    signals: ['私属礁石小海滩', '步行到 Sai Kaew', '只租一天摩托', '晴天出海 · 雨天原地休息'],
    fieldNotes: ['私属海滩偏礁石，带水鞋；现金、驱蚊液与饮水比打卡清单更实用。', '双条车可能只到 Sai Kaew Beach Resort 门口，提前把酒店英文名发给司机并确认行李下车点。', '摩托约 300—400 泰铢/天仅作体验参考：验车、戴头盔、不押护照，18:00前回酒店。', '早餐、餐厅、船票、上岛费与跳岛价格都要按出发前和当天信息复核。'],
    routeTitle: '不安排任务，把海岛过成停留',
    route: [['入住日，只做第一眼的海', 'Larissa 入住后先去私属小海滩或 Sai Kaew Beach，看日落并在主街吃饭。'], ['酒店周边慢休闲', '私属小海滩浅浮潜/看海 → Sai Kaew Beach → 按摩、咖啡和晚餐；不需要租车。'], ['只租一天摩托环岛', 'Ao Wong Duean → Ao Thian → Ao Wai → Laem Toei → Ao Prao 日落；18:00 前回酒店。'], ['天气触发日', '晴天再从 Na Dan 主码头参加跳岛/浮潜；雨天就留在 Larissa 和 Sai Kaew 周边。']],
    reminder: 'Larissa 位置已适配；船票、码头接送、摩托、跳岛和天气敏感活动均标为出发前确认。'
  },
  {
    id: 'bangkok2', staySegmentId: 'stay_bangkok_2', city: '返程前的曼谷', date: '10.04 — 10.05', nights: '1晚', status: '机场快线缓冲', accent: 'ink', primary: 'bkk2_true_siam_rangnam',
    candidateIds: ['bkk2_true_siam_rangnam', 'bkk2_global_pratunam', 'bkk2_siam_star', 'bkk2_4m_pratunam'],
    tabNames: ['True Siam Rangnam', 'Global Hotel Pratunam', 'Siam Star Hotel', '4M Pratunam Hotel'],
    subtitle: '一晚缓冲 · 次日从 BKK 返程',
    guideTitle: '最后一晚只为返程减压',
    guideLead: '从沙美岛回曼谷后直接住 Rangnam，不折返 Sathorn。到得早就只在 King Power / Pratunam 附近补货；次日用 Ratchaprarop Airport Rail Link 去 BKK，不再安排任何景点。',
    signals: ['不折返 Sathorn', 'Airport Rail Link 缓冲', '附近轻量补货', '12:35 航班不排景点'],
    fieldNotes: ['酒店到 Ratchaprarop 公开距离口径不一，页面采用约650米的保守值。', '10月4日尽量白天离岛回曼谷，避免把次日国际航班缓冲押在晚班车上。', '出发前按行李量复核拖行李路线、机场快线班次和航司值机时间。'],
    routeTitle: '把行李、睡眠和余量留出来',
    route: [['回到曼谷，直接入住', '从沙美岛回曼谷后去 True Siam Rangnam；若时间充裕，只做 King Power / Pratunam 轻量补货。'], ['出发日，直接去素万那普', 'Ratchaprarop Airport Rail Link 动线明确；班次、拖行李路线和机场预留时间出发前确认。']],
    reminder: 'True Siam Rangnam 是机场快线缓冲夜；机场动线明确，具体班次和出发时间待出发前确认。'
  }
];

const selectedCandidateByStay = new Map(data.stay_segments.map((segment) => [segment.id, segment.selected_candidate_id]));
groupDefs.forEach((group) => {
  const selectedId = selectedCandidateByStay.get(group.staySegmentId);
  if (!selectedId || !byId.has(selectedId)) return;
  group.primary = selectedId;
  group.candidateIds = [selectedId];
});

function escapeHtml(value) { return String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]); }
function assetPath(value) { return value.replace(/^outputs\//, ''); }
function cancellationText(value) {
  if (!value) return '下单前复核取消条款';
  if (value.includes('2026-09-28T14:00')) return '09.28 14:00 前可取消';
  if (value.includes('2026-09-21')) return '09.21 前可取消';
  if (value.includes('2026-09-27T16:00')) return '09.27 16:00 前可取消';
  if (value.includes('2026-09-26')) return '09.26 前可取消';
  if (value.includes('2026-09-25')) return '09.25 前可取消';
  if (value.includes('2026-09-16')) return '09.16 前可取消';
  if (value.includes('2026-09-27')) return '09.27 前可取消';
  if (value.includes('2026-10-02')) return '10.02 前可取消';
  if (value.includes('2026-10-03')) return '10.03 前可取消';
  if (value.includes('free_cancellation')) return '页面显示可免费取消';
  return '下单前复核取消条款';
}
function cancellationMetric(value) {
  const text = cancellationText(value);
  if (text.includes('前可取消')) return text.replace(' 前可取消', '');
  if (text.includes('免费取消')) return '可取消';
  return '待复核';
}
function bookingLabel(candidate) { return candidate.platform === 'Airbnb' ? '打开 Airbnb' : '打开 Booking 中国站'; }
function getPhotos(candidate) {
  if (photoChoices[candidate.id]) return photoChoices[candidate.id].map(([index, label]) => ({ path: `outputs/assets/booking/${candidate.id}-candidate-${String(index).padStart(2, '0')}.jpg`, label }));
  return (candidate.image_assets || []).map((image, index) => ({ path: image, label: index === 0 ? '房源内部' : '房源细节' }));
}
function updateData() {
  const sourceItems = [];
  for (const [id, choices] of Object.entries(photoChoices)) {
    const candidate = byId.get(id);
    if (!candidate) continue;
    const images = choices.map(([index, category]) => `outputs/assets/booking/${id}-candidate-${String(index).padStart(2, '0')}.jpg`);
    candidate.image_assets = images;
    candidate.image_source = 'Booking.com 中国站页面实际加载的官方图库';
    candidate.image_categories = choices.map(([, category]) => category);
    candidate.image_category_note = imageCategoryNotes[id] || null;
    sourceItems.push({ candidate_id: id, property_name: candidate.name, source_page: candidate.url, images: images.map((image, index) => ({ path: image, category: choices[index][1] })) });
  }
  data.updated_at = '2026-07-20T22:00:00+02:00';
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  fs.writeFileSync(path.join(root, 'outputs/assets/booking/booking-image-sources.json'), JSON.stringify({ updated_at: data.updated_at, source: 'Booking.com 中国站实际加载页面图库', items: sourceItems }, null, 2) + '\n', 'utf8');
}
function card(candidate, group) {
  const photos = getPhotos(candidate);
  const candidateId = `stay-${group.id}`;
  const rating = candidate.rating ?? candidate.review_score ?? '待复核';
  const review = candidate.review_count ? `${candidate.review_count.toLocaleString('zh-CN')} 条评价` : '评分详情待复核';
  const cancellation = cancellationText(candidate.price?.cancellation || candidate.cancellation);
  const cancellationMetricText = cancellationMetric(candidate.price?.cancellation || candidate.cancellation);
  const reason = candidate.fit || candidate.note || '以位置、房型和当前价格为基础保留；预订前再核对库存与条款。';
  const note = candidate.tradeoff || '预订前确认实际房型、含税价格与最终取消条件。';
  const images = photos.map((photo, photoIndex) => `<img class="stay-image${photoIndex ? '' : ' is-active'}" src="${escapeHtml(assetPath(photo.path))}" alt="${escapeHtml(candidate.name)} · ${escapeHtml(photo.label)}" loading="lazy">`).join('');
  const controls = photos.length > 1 ? `<div class="gallery-controls"><button type="button" data-gallery-step="-1" aria-label="上一张图片">←</button><button type="button" data-gallery-step="1" aria-label="下一张图片">→</button></div><span class="gallery-count" aria-live="polite">1 / ${photos.length}</span>` : '';
  return `<article class="accommodation-card" id="${candidateId}"><div class="stay-gallery" data-gallery><div class="stay-images">${images}</div>${controls}</div><div class="stay-body"><div class="stay-intro"><p class="stay-kicker">${escapeHtml(candidate.area || group.city)}</p><h3>${escapeHtml(candidate.name)}</h3><p class="stay-area">${escapeHtml(candidate.room_summary || candidate.property_type || '具体房型以预订页为准')}</p></div><p class="stay-reason">${escapeHtml(reason)}</p><dl class="stay-metrics"><div><dt>评分</dt><dd>${escapeHtml(rating)}</dd><small>${escapeHtml(review)}</small></div><div><dt>取消提示</dt><dd class="metric-date">${escapeHtml(cancellationMetricText)}</dd><small>${escapeHtml(cancellation)}</small></div></dl><footer class="stay-footer"><p>${escapeHtml(note)}</p><a class="booking-link" href="${escapeHtml(candidate.url)}" target="_blank" rel="noreferrer">${bookingLabel(candidate)} <span aria-hidden="true">↗</span></a></footer></div></article>`;
}
function stage(group) {
  const candidate = byId.get(group.primary);
  if (!candidate) return '';
  const route = group.route.map(([title, detail], index) => `<li><span>${String(index + 1).padStart(2, '0')}</span><div><strong>${escapeHtml(title)}</strong><p>${escapeHtml(detail)}</p></div></li>`).join('');
  const signals = group.signals.map((signal) => `<li>${escapeHtml(signal)}</li>`).join('');
  const fieldNotes = group.fieldNotes.map((note) => `<li>${escapeHtml(note)}</li>`).join('');
  return `<section class="stage stage-${group.accent}" id="stage-${group.id}" data-stage="${group.id}"><header class="stay-heading"><div><p class="section-label">${escapeHtml(group.date)} · ${escapeHtml(group.nights)}</p><h2>${escapeHtml(group.city)}</h2></div><span class="booked-badge"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>住宿已确定</span></header>${card(candidate, group)}<section class="guide-brief"><div class="guide-copy"><p class="section-label">住在这里之后</p><h2>${escapeHtml(group.guideTitle)}</h2><p>${escapeHtml(group.guideLead)}</p></div><ul class="guide-signals" aria-label="攻略重点">${signals}</ul></section><div class="stage-notes"><section class="route-card"><p class="section-label">逐日攻略</p><h2>${escapeHtml(group.routeTitle)}</h2><ol>${route}</ol></section><aside class="reminder-card"><p class="section-label">现场笔记</p><h2>${escapeHtml(group.status)}</h2><ul class="field-notes">${fieldNotes}</ul><p class="reminder-summary">${escapeHtml(group.reminder)}</p></aside></div></section>`;
}

updateData();
const stages = groupDefs.map(stage).join('');
let html = `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light"><title>泰国蜜月 · 住宿与旅行攻略</title><style>
:root{--paper:#f4eedf;--card:#fffaf0;--ink:#123f37;--soft:#59756d;--line:rgba(18,63,55,.18);--coral:#df6348;--saffron:#d99137;--lagoon:#5ca9a0;--shadow:0 18px 40px rgba(31,61,51,.10)}*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;color:var(--ink);background:repeating-linear-gradient(0deg,rgba(18,63,55,.028) 0 1px,transparent 1px 5px),var(--paper);font-family:"Microsoft YaHei","Noto Sans CJK SC",sans-serif}button,a{font:inherit}.page{max-width:1640px;margin:auto;padding:30px 36px 64px}.page-top{display:grid;grid-template-columns:310px 1fr;gap:48px;align-items:start}.rail{position:sticky;top:24px;padding:28px 25px;border:1px solid var(--line);border-radius:34px;background:rgba(255,250,240,.82);box-shadow:var(--shadow)}.rail-top p{margin:0;color:var(--coral);font-size:12px;font-weight:800;letter-spacing:.1em}.rail-top h1{margin:9px 0 4px;font-family:Georgia,"Songti SC",serif;font-size:34px;line-height:1}.rail-top span{color:var(--soft);font-size:13px}.rail-list{position:relative;display:grid;gap:11px;margin:27px 0 25px;padding:0;list-style:none}.rail-list:before{position:absolute;left:20px;top:23px;bottom:23px;width:1px;background:var(--line);content:""}.rail-button{position:relative;z-index:1;display:grid;grid-template-columns:42px 1fr;gap:11px;width:100%;padding:10px;border:0;border-radius:19px;color:var(--ink);background:transparent;text-align:left;cursor:pointer}.rail-button:hover,.rail-button:focus-visible{outline:0;background:rgba(18,63,55,.07)}.rail-button[aria-current="true"]{color:var(--card);background:var(--ink);box-shadow:0 10px 22px rgba(18,63,55,.18)}.rail-dot{display:grid;width:42px;height:42px;place-items:center;border:2px solid var(--ink);border-radius:50%;color:var(--ink);background:var(--paper);font-size:11px;font-weight:900}.rail-button[aria-current="true"] .rail-dot{border-color:var(--card);color:var(--ink);background:var(--coral)}.rail-button:nth-child(2) .rail-dot{background:#f3c466}.rail-button:nth-child(3) .rail-dot{background:#9ed6d0}.rail-copy small{display:block;color:var(--coral);font-size:11px;font-weight:800;letter-spacing:.05em}.rail-button[aria-current="true"] small,.rail-button[aria-current="true"] span{color:#f7dfd4}.rail-copy strong{display:block;margin:2px 0;font-family:Georgia,"Songti SC",serif;font-size:20px;line-height:1.1}.rail-copy span{display:block;color:var(--soft);font-size:12px}.rail-bottom{padding-top:18px;border-top:1px solid var(--line);color:var(--soft);font-size:12px}.rail-bottom b{color:var(--ink)}.content{min-width:0}.intro{display:flex;justify-content:space-between;gap:30px;margin:8px 0 43px;padding:28px 34px;border:1px solid rgba(223,99,72,.34);border-radius:30px;background:rgba(255,250,240,.72)}.intro p{max-width:670px;margin:0;color:var(--soft);font-size:15px;line-height:1.8}.intro h2{margin:0;font-family:Georgia,"Songti SC",serif;font-size:42px;line-height:1.04}.stage{scroll-margin-top:22px;margin-bottom:74px}.stage[hidden]{display:none}.stage-header{padding:0 7px 19px;border-bottom:1px solid var(--line)}.stage-header>p{margin:0 0 6px;color:var(--coral);font-size:12px;font-weight:900;letter-spacing:.14em}.stage-header h1{margin:0;font-family:Georgia,"Songti SC",serif;font-size:clamp(46px,6vw,74px);line-height:.98;letter-spacing:-.07em}.stage-header>div{display:flex;justify-content:space-between;align-items:center;gap:16px;margin-top:10px;color:var(--soft);font-size:15px}.stage-header b{padding:8px 13px;border-radius:99px;background:#d9eee8;color:var(--ink);font-size:12px}.stay-selector{margin:28px 0 18px}.stay-selector h2{margin:0 0 13px;font-family:Georgia,"Songti SC",serif;font-size:32px;letter-spacing:-.04em}.stay-tabs{display:flex;flex-wrap:wrap;gap:9px}.stay-tab{padding:10px 16px;border:1px solid var(--line);border-radius:999px;color:var(--soft);background:rgba(255,250,240,.72);font-size:13px;font-weight:800;cursor:pointer;transition:transform .18s ease,background .18s ease,color .18s ease}.stay-tab:hover,.stay-tab:focus-visible{outline:0;transform:translateY(-2px);border-color:var(--ink);color:var(--ink)}.stay-tab[aria-selected="true"]{color:var(--card);border-color:var(--ink);background:var(--ink)}.stay-tab.is-primary[aria-selected="true"]{border-color:var(--coral);background:var(--coral)}.accommodation-card{display:grid;grid-template-columns:372px minmax(0,1fr);min-height:372px;overflow:hidden;border:1px solid var(--line);border-left:8px solid var(--coral);border-radius:28px;background:var(--card);box-shadow:var(--shadow)}.stage-saffron .accommodation-card{border-left-color:var(--saffron)}.stage-lagoon .accommodation-card{border-left-color:var(--lagoon)}.stage-ink .accommodation-card{border-left-color:var(--ink)}.stay-gallery{position:relative;width:372px;height:372px;overflow:hidden;background:#dbe5df}.stay-images,.stay-image{position:absolute;inset:0;width:100%;height:100%}.stay-image{object-fit:cover;opacity:0;transition:opacity .25s ease,transform .3s ease}.stay-image.is-active{opacity:1}.stay-gallery:hover .stay-image.is-active{transform:scale(1.035)}.gallery-controls{position:absolute;right:16px;bottom:16px;left:16px;z-index:2;display:flex;justify-content:space-between;pointer-events:none}.gallery-controls button{width:45px;height:45px;border:1px solid rgba(255,250,240,.85);border-radius:50%;color:var(--card);background:rgba(18,63,55,.78);font-size:21px;cursor:pointer;pointer-events:auto}.gallery-controls button:hover,.gallery-controls button:focus-visible{outline:0;background:var(--coral)}.gallery-count{position:absolute;top:15px;right:15px;z-index:2;padding:6px 10px;border-radius:99px;color:var(--card);background:rgba(18,63,55,.78);font-size:11px;font-weight:800}.stay-body{display:flex;min-width:0;min-height:372px;flex-direction:column;padding:30px 34px 25px}.stay-kicker{margin:0;color:var(--coral);font-size:11px;font-weight:900;letter-spacing:.12em}.stage-saffron .stay-kicker{color:var(--saffron)}.stage-lagoon .stay-kicker{color:#2a8077}.stay-intro h3{margin:8px 0 5px;font-family:Georgia,"Songti SC",serif;font-size:clamp(34px,3.7vw,53px);line-height:1.02;letter-spacing:-.055em}.stay-area{margin:0;color:var(--soft);font-size:13px;line-height:1.55}.stay-reason{display:-webkit-box;overflow:hidden;margin:16px 0 13px;padding-top:14px;border-top:1px solid var(--line);-webkit-box-orient:vertical;-webkit-line-clamp:2;color:var(--soft);font-size:13px;line-height:1.55}.stay-reason strong{color:var(--ink)}.stay-metrics{display:grid;grid-template-columns:repeat(3,1fr);margin:0;border:1px solid var(--line)}.stay-metrics>div{min-width:0;padding:13px 17px;border-right:1px solid var(--line)}.stay-metrics>div:last-child{border-right:0}.stay-metrics dt{margin-bottom:4px;color:var(--soft);font-size:11px;font-weight:800}.stay-metrics dd{overflow:hidden;margin:0;color:var(--coral);font-family:Georgia,"Songti SC",serif;font-size:31px;font-weight:800;line-height:1;text-overflow:ellipsis;white-space:nowrap}.stay-metrics .metric-date{font-size:23px}.stay-metrics small{display:block;overflow:hidden;margin-top:5px;color:var(--soft);font-size:11px;text-overflow:ellipsis;white-space:nowrap}.stay-footer{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-top:auto;padding-top:14px}.stay-footer p{display:-webkit-box;max-width:54%;overflow:hidden;margin:0;color:var(--soft);-webkit-box-orient:vertical;-webkit-line-clamp:2;font-size:12px;line-height:1.5}.booking-link{flex:0 0 auto;padding:12px 16px;border-radius:13px;color:var(--card);background:var(--ink);font-size:13px;font-weight:900;text-decoration:none}.booking-link:hover,.booking-link:focus-visible{outline:0;background:var(--coral)}.stage-notes{display:grid;grid-template-columns:minmax(0,1fr) 290px;gap:20px;margin-top:20px}.route-card,.reminder-card{border:1px solid var(--line);border-radius:25px;background:rgba(255,250,240,.64)}.route-card{padding:25px 30px}.section-label{margin:0;color:var(--coral);font-size:11px;font-weight:900;letter-spacing:.12em}.route-card h2,.reminder-card h2{margin:8px 0 15px;font-family:Georgia,"Songti SC",serif;font-size:32px;line-height:1.12}.route-card ol{margin:0;padding:0;list-style:none}.route-card li{display:grid;grid-template-columns:42px 1fr;gap:14px;padding:13px 0;border-top:1px solid var(--line)}.route-card li span{display:grid;width:36px;height:36px;place-items:center;border-radius:50%;color:var(--card);background:var(--ink);font-size:11px;font-weight:900}.route-card strong{font-size:14px}.route-card li p{margin:4px 0 0;color:var(--soft);font-size:13px;line-height:1.55}.reminder-card{padding:25px}.reminder-card p:last-child{margin:0;color:var(--soft);font-size:13px;line-height:1.75}.stage-saffron .section-label{color:var(--saffron)}.stage-lagoon .section-label{color:#2a8077}@media(max-width:1080px){.page{padding:20px}.page-top{grid-template-columns:1fr}.rail{position:static;display:block;padding:17px 18px;border-radius:24px}.rail-list{display:flex;overflow-x:auto;gap:7px;margin:15px -3px;padding:3px}.rail-list:before{display:none}.rail-button{flex:0 0 215px;grid-template-columns:34px 1fr;padding:9px}.rail-dot{width:34px;height:34px}.rail-bottom{display:none}.intro{margin-bottom:34px}.accommodation-card{grid-template-columns:330px minmax(0,1fr);min-height:330px}.stay-gallery{width:330px;height:330px}.stay-body{min-height:330px;padding:24px}.stage-notes{grid-template-columns:1fr 250px}}@media(max-width:700px){.page{padding:14px}.intro{display:block;padding:22px}.intro h2{margin-bottom:10px;font-size:33px}.stage{margin-bottom:50px}.stage-header h1{font-size:50px}.stage-header>div{align-items:flex-start;flex-direction:column}.stay-selector{margin-top:22px}.stay-selector h2{font-size:28px}.stay-tabs{flex-wrap:nowrap;overflow-x:auto;padding-bottom:4px}.stay-tab{flex:0 0 auto}.accommodation-card{display:block;min-height:0;border-left-width:6px;border-radius:23px}.stay-gallery{width:100%;height:auto;aspect-ratio:1}.stay-body{min-height:0;padding:23px 20px}.stay-intro h3{font-size:37px}.stay-metrics>div{padding:12px 9px}.stay-metrics dd{font-size:25px}.stay-metrics .metric-date{font-size:18px}.stay-footer{align-items:flex-start;flex-direction:column}.stay-footer p{max-width:none}.booking-link{width:100%;text-align:center}.stage-notes{display:block}.reminder-card{margin-top:15px}.route-card,.reminder-card{padding:21px}.route-card h2,.reminder-card h2{font-size:27px}}@media(prefers-reduced-motion:reduce){*,*:before,*:after{scroll-behavior:auto!important;transition:none!important}}@media print{body{background:#fff}.page{max-width:none;padding:0}.rail,.intro,.stay-selector,.gallery-controls,.gallery-count,.booking-link{display:none}.page-top{display:block}.stage{display:block!important;page-break-after:always}.stage[hidden],.accommodation-card[hidden]{display:grid!important}.accommodation-card{margin-top:14px;box-shadow:none}.stage-notes{display:none}.stay-gallery{height:280px;width:280px}.stay-image:not(.is-active){display:none}}
 </style></head><body><main class="page"><div class="page-top"><aside class="rail" aria-label="详情页导航"><div class="rail-top"><p>THAILAND · 2026</p><h1>住宿与旅行攻略</h1><span>09.24 — 10.05 · 共 11 晚</span></div><ol class="rail-list">${groupDefs.map((group, index) => `<li><button class="rail-button" type="button" data-stage-target="${group.id}" aria-current="${index === 0}"><span class="rail-dot">${String(index + 1).padStart(2, '0')}</span><span class="rail-copy"><small>${group.date}</small><strong>${group.id === 'bangkok2' ? '返程曼谷' : group.city}</strong><span>${group.nights} · ${group.status}</span></span></button></li>`).join('')}</ol><div class="rail-bottom"><b>地图负责定位，详情页负责理解</b><br>四段住宿、逐日玩法、现场笔记与出发前复核都在这里</div></aside><div class="content"><section class="intro"><div><p class="section-label">STAY + FIELD GUIDE</p><h2>地图看方向，<br>这里看细节</h2></div><p>这是一份与行程地图对应的旅行展示页：四段最终住处是每个城市的基地，下面接着逐日攻略、天气替代和移动提醒。候选已经退出页面，库存、房型和条款仍以订单及出发前页面为准。</p></section>${stages}</div></div></main><script>
document.querySelectorAll('[data-gallery]').forEach((gallery)=>{const images=[...gallery.querySelectorAll('.stay-image')];let active=0;gallery.querySelectorAll('[data-gallery-step]').forEach((button)=>button.addEventListener('click',()=>{images[active].classList.remove('is-active');active=(active+Number(button.dataset.galleryStep)+images.length)%images.length;images[active].classList.add('is-active');gallery.querySelector('.gallery-count').textContent=(active+1)+' / '+images.length;}));});
document.querySelectorAll('[data-stage-target]').forEach((button)=>button.addEventListener('click',()=>{const target=document.getElementById('stage-'+button.dataset.stageTarget);target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});document.querySelectorAll('[data-stage-target]').forEach((item)=>item.setAttribute('aria-current',String(item===button)));}));
</script></body></html>`;
html = html.replace('<ol class="rail-list">', '<a class="rail-map-switch" data-page-switch="map" href="thailand-honeymoon-map.html"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18-6 3V6l6-3 6 3 6-3v15l-6 3-6-3Zm0 0V3m6 18V6"/></svg><span>看地图版</span></a><ol class="rail-list">');
html = html.replace('</head>', `<style data-mobile-stays>
:root{--coral:#b94732;--soft:#526c65;--saffron-text:#9b5710;--lagoon-text:#28736b}
body{overflow-x:hidden}.stay-heading{display:flex;align-items:end;justify-content:space-between;gap:20px;margin-bottom:16px;padding:0 6px}.stay-heading h2{margin:5px 0 0;font-family:Georgia,"Songti SC",serif;font-size:clamp(38px,5vw,58px);line-height:1}.booked-badge{display:inline-flex;align-items:center;gap:7px;padding:9px 13px;border-radius:999px;background:#d9eee8;color:var(--ink);font-size:12px;font-weight:900;white-space:nowrap}.booked-badge svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round}.stay-intro h3{font-size:clamp(30px,3vw,43px)}.stay-reason{display:block;overflow:visible;-webkit-line-clamp:unset}.rail-map-switch{display:flex;align-items:center;justify-content:center;gap:9px;width:100%;min-height:48px;margin:22px 0 8px;padding:13px 16px;border-radius:16px;background:#123f37;color:#fffaf0;font-size:16px;font-weight:900;text-decoration:none;box-shadow:0 10px 20px rgba(18,63,55,.16);transition:background .2s ease}.rail-map-switch svg{width:21px;height:21px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.rail-map-switch:hover{background:#df6348}button:focus-visible,a:focus-visible{outline:3px solid #df6348;outline-offset:3px}.gallery-controls button{min-width:48px;min-height:48px}.booking-link{min-height:48px;display:inline-flex;align-items:center;justify-content:center}.intro{align-items:end}.intro .section-label{margin-bottom:8px}.intro h2{white-space:nowrap}.stage{scroll-margin-top:24px}.guide-brief{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(250px,.65fr);gap:24px;margin-top:20px;padding:26px 30px;border:1px solid var(--line);border-radius:25px;background:rgba(255,250,240,.64)}.guide-copy h2{margin:8px 0 10px;font-family:Georgia,"Songti SC",serif;font-size:32px;line-height:1.12}.guide-copy>p:last-child{margin:0;color:var(--soft);font-size:14px;line-height:1.75}.guide-signals{display:grid;align-content:center;grid-template-columns:1fr 1fr;gap:9px;margin:0;padding:0;list-style:none}.guide-signals li{display:flex;min-height:44px;align-items:center;padding:9px 11px;border:1px solid var(--line);border-radius:13px;background:var(--card);font-size:12px;font-weight:800;line-height:1.35}.guide-signals li:before{width:7px;height:7px;flex:0 0 auto;margin-right:8px;border-radius:50%;background:var(--coral);content:""}.stage-saffron .guide-signals li:before{background:var(--saffron)}.stage-lagoon .guide-signals li:before{background:var(--lagoon)}.stage-ink .guide-signals li:before{background:var(--ink)}.stage-notes{align-items:start}.field-notes{display:grid;gap:10px;margin:0;padding:0;list-style:none}.field-notes li{position:relative;padding-left:16px;color:var(--soft);font-size:13px;line-height:1.65}.field-notes li:before{position:absolute;top:.65em;left:0;width:6px;height:6px;border-radius:50%;background:var(--coral);content:""}.reminder-summary{margin:17px 0 0!important;padding-top:15px;border-top:1px solid var(--line);color:var(--ink)!important;font-size:12px!important;font-weight:700;line-height:1.6!important}
@media(min-width:1081px){.rail{top:50vh;transform:translateY(-50%)}.content{padding-top:8px}}
@media(max-width:1080px){.page-top{display:block}.rail{position:sticky;top:0;z-index:30}.rail-list{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));overflow:visible}.rail-button{min-height:56px}.content{padding-top:28px}.stage{scroll-margin-top:210px}.guide-brief{grid-template-columns:1fr}.guide-signals{grid-template-columns:repeat(4,minmax(0,1fr))}}
@media(max-width:700px){.page{padding:0 12px calc(36px + env(safe-area-inset-bottom))}.rail{position:sticky;top:0;margin:0 -12px;padding:10px 12px 9px;border-width:0 0 1px;border-radius:0;background:rgba(244,238,223,.96);box-shadow:0 10px 24px rgba(31,61,51,.08);-webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px)}.rail-top{padding-right:96px}.rail-top p{font-size:10px}.rail-top h1{margin:4px 0 0;font-size:23px}.rail-top span{display:none}.rail-map-switch{position:absolute;top:10px;right:12px;width:auto;min-height:44px;margin:0;padding:10px 12px;border-radius:13px;font-size:13px;box-shadow:none}.rail-map-switch svg{width:18px;height:18px}.rail-list{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:5px;margin:9px 0 0;padding:0}.rail-list li{min-width:0}.rail-button{display:flex;min-height:48px;flex-direction:column;align-items:center;justify-content:center;gap:3px;padding:4px 2px;border-radius:13px;text-align:center}.rail-dot{width:22px;height:22px;border-width:1.5px;font-size:8px}.rail-copy{min-width:0}.rail-copy small{display:none}.rail-copy strong{overflow:hidden;font-family:inherit;font-size:11px;line-height:1.1;text-overflow:ellipsis;white-space:nowrap}.rail-copy span{display:none}.rail-bottom{display:none}.content{padding-top:24px}.intro{display:block;margin:0 0 38px;padding:23px 21px;border-radius:24px}.intro h2{margin:7px 0 13px;font-size:34px;line-height:1.06}.intro p:last-child{font-size:16px;line-height:1.7}.stage{margin-bottom:58px;scroll-margin-top:124px}.stay-heading{align-items:flex-start;margin-bottom:13px;padding:0 3px}.stay-heading h2{font-size:36px}.booked-badge{margin-top:1px;padding:7px 9px;font-size:11px}.booked-badge svg{width:14px;height:14px}.accommodation-card{border-top:6px solid var(--coral);border-left-width:1px;border-radius:22px}.stage-saffron .accommodation-card{border-top-color:var(--saffron)}.stage-lagoon .accommodation-card{border-top-color:var(--lagoon)}.stage-ink .accommodation-card{border-top-color:var(--ink)}.stay-gallery{aspect-ratio:16/10}.stay-body{padding:22px 18px 20px}.stay-kicker{font-size:11px}.stay-intro h3{margin-top:7px;font-size:clamp(29px,9vw,36px);line-height:1.08;letter-spacing:-.045em}.stay-area,.stay-reason{font-size:15px;line-height:1.65}.stay-reason{margin:15px 0 14px;padding-top:13px}.stay-metrics{grid-template-columns:repeat(3,minmax(0,1fr))}.stay-metrics>div{padding:12px 8px}.stay-metrics dt{font-size:10px}.stay-metrics dd{font-size:clamp(20px,6.3vw,25px);white-space:normal}.stay-metrics .metric-date{font-size:18px}.stay-metrics small{font-size:10px;line-height:1.35;text-overflow:clip;white-space:normal}.stay-footer{gap:13px}.stay-footer p{font-size:13px;line-height:1.55}.guide-brief{display:block;margin-top:14px;padding:21px 18px;border-radius:22px}.guide-copy h2{font-size:27px}.guide-copy>p:last-child{font-size:15px;line-height:1.7}.guide-signals{grid-template-columns:1fr 1fr;gap:7px;margin-top:18px}.guide-signals li{font-size:12px}.route-card,.reminder-card{padding:21px 18px}.route-card h2,.reminder-card h2{font-size:27px}.route-card li{grid-template-columns:38px 1fr;gap:11px}.route-card strong{font-size:16px}.route-card li p,.field-notes li{font-size:15px;line-height:1.65}.reminder-summary{font-size:13px!important;line-height:1.6!important}}
@media(max-width:380px){.rail-map-switch span{display:none}.rail-map-switch{width:44px;padding:10px}.rail-top{padding-right:52px}.stay-heading{display:block}.booked-badge{margin-top:9px}.stay-metrics{grid-template-columns:1fr 1fr}.stay-metrics>div:first-child{grid-column:1/-1;border-right:0;border-bottom:1px solid var(--line)}.stay-metrics>div:nth-child(2){border-right:1px solid var(--line)}}
@media(prefers-reduced-motion:reduce){*,*:before,*:after{scroll-behavior:auto!important;transition:none!important}}
.stage-saffron .stay-kicker,.stage-saffron .section-label{color:var(--saffron-text)}.stage-lagoon .stay-kicker,.stage-lagoon .section-label{color:var(--lagoon-text)}.rail-button[aria-current="true"] .rail-dot{color:#fffaf0}.rail-map-switch:hover,.booking-link:hover,.booking-link:focus-visible{background:var(--coral)}button:focus-visible,a:focus-visible{outline-color:var(--coral)}
</style></head>`);
html = html.replace('</head>', '<style data-metric-layout>.stay-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}.stay-metrics>div{padding:14px 20px}.stay-metrics .metric-date{font-size:clamp(20px,2.2vw,29px)}@media(max-width:700px){.stay-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}.stay-metrics>div{padding:12px 14px}}@media(max-width:380px){.stay-metrics>div:first-child{grid-column:auto;border-bottom:0}.stay-metrics>div:nth-child(2){border-right:0}}</style></head>');
html = html.replace('</body>', '<script data-stay-observer>const stageButtons=[...document.querySelectorAll("[data-stage-target]")];const stageObserver=new IntersectionObserver((entries)=>{const visible=entries.filter((entry)=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(!visible)return;stageButtons.forEach((button)=>button.setAttribute("aria-current",String(button.dataset.stageTarget===visible.target.dataset.stage)));},{rootMargin:"-20% 0px -60% 0px",threshold:[0,.25,.5]});document.querySelectorAll("[data-stage]").forEach((stage)=>stageObserver.observe(stage));</script></body>');
fs.writeFileSync(outputPath, html, 'utf8');
console.log(`Wrote ${outputPath}`);
