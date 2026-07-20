const fs = require('fs');
const path = require('path');

const root = 'E:/Personal/旅行';
const dataPath = path.join(root, 'work/trip-data.json');
const outputPath = path.join(root, 'outputs/index.html');
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
    routeTitle: '把代表性留住，不把行程塞满',
    route: [['抵达后，吃一顿就近的晚饭', '安顿、洗澡、早点睡，把第一晚留给适应节奏。'], ['老城与河边', 'Saint Louis → Saphan Taksin → 河船；大皇宫、卧佛寺为主，郑王庙视体力加入。'], ['乍都乍 + Ari', 'Chatuchak 逛到觉得够就离开，再去 Ari 喝咖啡或吃晚饭；雨天改 Siam 室内商圈。'], ['Lumphini / Siam 松弛日', '公园、Siam 或 Chit Lom 三选二；傍晚回 Sathorn 按摩和晚餐。']],
    reminder: 'Saint Louis BTS 是城市移动入口；老城河船、周末市场动线和具体交通时刻均待出发前确认。'
  },
  {
    id: 'pattaya', staySegmentId: 'stay_pattaya', city: '芭提雅', date: '09.28 — 09.30', nights: '2晚', status: '近海轻过渡', accent: 'saffron', primary: 'pattaya_best_beach_villa',
    candidateIds: ['pattaya_best_beach_villa', 'pattaya_edge_central_walking_street', 'pattaya_holiday_inn_express_central', 'pattaya_leela_resort_spa'],
    tabNames: ['Best Beach Villa', 'EDGE Central', 'Holiday Inn Express', 'The Leela'],
    subtitle: '两晚过渡 · 靠海，方便吃饭和走走',
    routeTitle: '海边走走，晚上再出门',
    route: [['抵达后，海滩日落与附近晚餐', 'Best Beach Villa → Pattaya Beach → Central Marina / Terminal 21；不折返 Walking Street。'], ['真理寺主景点日', '真理寺更顺路；回酒店或 Terminal 21 午餐，下午海滩/泳池休息。老虎园只作为替换项，不与北南两端硬串。'], ['离开前，留出转岛余量', '慢早餐、收好行李，提前确认酒店到班佩的接送/集合点，不把船班卡死。']],
    reminder: 'Best Beach Villa 靠海和市中心北侧；真理寺、老虎园取舍、转班佩交通和具体班次均待出发前确认。'
  },
  {
    id: 'samet', staySegmentId: 'stay_koh_samet', city: '沙美岛', date: '09.30 — 10.04', nights: '4晚', status: '海景慢住', accent: 'lagoon', primary: 'koh_samet_larissa_private_beach',
    candidateIds: ['koh_samet_larissa_private_beach', 'koh_samet_tubtim_beachfront', 'koh_samet_viking_ao_thian', 'koh_samet_samed_garden_aonoinna'],
    tabNames: ['Larissa Samed Resort', 'Tubtim Resort', 'Viking Holiday Resort', 'Samed Garden Resort'],
    subtitle: '海边与酒店是主菜 · 天气和体力可互换',
    routeTitle: '不安排任务，把海岛过成停留',
    route: [['入住日，只做第一眼的海', 'Larissa 入住后先去私属小海滩或 Sai Kaew Beach，看日落并在主街吃饭。'], ['酒店周边慢休闲', '私属小海滩浅浮潜/看海 → Sai Kaew Beach → 按摩、咖啡和晚餐；不需要租车。'], ['只租一天摩托环岛', 'Ao Wong Duean → Ao Thian → Ao Wai → Laem Toei → Ao Prao 日落；18:00 前回酒店。'], ['天气触发日', '晴天再从 Na Dan 主码头参加跳岛/浮潜；雨天就留在 Larissa 和 Sai Kaew 周边。']],
    reminder: 'Larissa 位置已适配；船票、码头接送、摩托、跳岛和天气敏感活动均标为出发前确认。'
  },
  {
    id: 'bangkok2', staySegmentId: 'stay_bangkok_2', city: '返程前的曼谷', date: '10.04 — 10.05', nights: '1晚', status: '机场快线缓冲', accent: 'ink', primary: 'bkk2_true_siam_rangnam',
    candidateIds: ['bkk2_true_siam_rangnam', 'bkk2_global_pratunam', 'bkk2_siam_star', 'bkk2_4m_pratunam'],
    tabNames: ['True Siam Rangnam', 'Global Hotel Pratunam', 'Siam Star Hotel', '4M Pratunam Hotel'],
    subtitle: '一晚缓冲 · 次日从 BKK 返程',
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
  group.candidateIds = [selectedId, ...group.candidateIds.filter((id) => id !== selectedId)];
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
function priceOf(candidate) { return candidate.price?.board_display?.displayed_total ?? candidate.price?.displayed_total ?? candidate.price?.current_total ?? '待复核'; }
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
function card(candidate, group, index) {
  const photos = getPhotos(candidate);
  const candidateId = `stay-${group.id}-${index}`;
  const metricPrice = priceOf(candidate);
  const rating = candidate.rating ?? candidate.review_score ?? '待复核';
  const review = candidate.review_count ? `${candidate.review_count.toLocaleString('zh-CN')} 条评价` : '评分详情待复核';
  const cancellation = cancellationText(candidate.price?.cancellation || candidate.cancellation);
  const cancellationMetricText = cancellationMetric(candidate.price?.cancellation || candidate.cancellation);
  const reason = candidate.fit || candidate.note || '以位置、房型和当前价格为基础保留；预订前再核对库存与条款。';
  const note = candidate.tradeoff || '预订前确认实际房型、含税价格与最终取消条件。';
  const images = photos.map((photo, photoIndex) => `<img class="stay-image${photoIndex ? '' : ' is-active'}" src="${escapeHtml(assetPath(photo.path))}" alt="${escapeHtml(candidate.name)} · ${escapeHtml(photo.label)}" loading="lazy">`).join('');
  const controls = photos.length > 1 ? `<div class="gallery-controls"><button type="button" data-gallery-step="-1" aria-label="上一张图片">←</button><button type="button" data-gallery-step="1" aria-label="下一张图片">→</button></div><span class="gallery-count" aria-live="polite">1 / ${photos.length}</span>` : '';
  return `<article class="accommodation-card" id="${candidateId}" role="tabpanel" aria-labelledby="tab-${candidateId}" data-panel="${group.id}"${index ? ' hidden' : ''}><div class="stay-gallery" data-gallery><div class="stay-images">${images}</div>${controls}</div><div class="stay-body"><div class="stay-intro"><p class="stay-kicker">${escapeHtml(candidate.area || group.city)}</p><h3>${escapeHtml(candidate.name)}</h3><p class="stay-area">${escapeHtml(candidate.room_summary || candidate.property_type || '具体房型以预订页为准')}</p></div><p class="stay-reason"><strong>为什么留着：</strong>${escapeHtml(reason)}</p><dl class="stay-metrics"><div><dt>${group.nights}总价</dt><dd>${metricPrice === '待复核' ? metricPrice : `¥${metricPrice}`}</dd><small>2位成人 · 人民币</small></div><div><dt>评分</dt><dd>${escapeHtml(rating)}</dd><small>${escapeHtml(review)}</small></div><div><dt>取消提示</dt><dd class="metric-date">${escapeHtml(cancellationMetricText)}</dd><small>${escapeHtml(cancellation)}</small></div></dl><footer class="stay-footer"><p>${escapeHtml(note)}</p><a class="booking-link" href="${escapeHtml(candidate.url)}" target="_blank" rel="noreferrer">${bookingLabel(candidate)} <span aria-hidden="true">↗</span></a></footer></div></article>`;
}
function stage(group) {
  const candidates = group.candidateIds.map((id) => byId.get(id)).filter(Boolean);
  const tabs = candidates.map((candidate, index) => `<button class="stay-tab${index === 0 ? ' is-primary' : ''}" type="button" role="tab" id="tab-stay-${group.id}-${index}" aria-controls="stay-${group.id}-${index}" aria-selected="${index === 0}" tabindex="${index === 0 ? 0 : -1}" data-tab="${group.id}" data-index="${index}">${index === 0 ? '首选 · ' : ''}${escapeHtml(index === 0 ? candidate.name : (group.tabNames[index] || candidate.name))}</button>`).join('');
  const cards = candidates.map((candidate, index) => card(candidate, group, index)).join('');
  const route = group.route.map(([title, detail], index) => `<li><span>${String(index + 1).padStart(2, '0')}</span><div><strong>${escapeHtml(title)}</strong><p>${escapeHtml(detail)}</p></div></li>`).join('');
  return `<section class="stage stage-${group.accent}" id="stage-${group.id}" data-stage="${group.id}"><header class="stage-header"><p>${escapeHtml(group.date)} · ${escapeHtml(group.nights)}</p><h1>${escapeHtml(group.city)}</h1><div><span>${escapeHtml(group.subtitle)}</span><b>住宿已确定 · 出发前复核</b></div></header><section class="stay-selector" aria-label="${escapeHtml(group.city)}住宿选项"><h2>${escapeHtml(group.city)} · 住宿选项</h2><div class="stay-tabs" role="tablist" aria-label="${escapeHtml(group.city)}住宿选项">${tabs}</div></section><div class="stay-panels">${cards}</div><div class="stage-notes"><section class="route-card"><p class="section-label">这段怎么玩</p><h2>${escapeHtml(group.routeTitle)}</h2><ol>${route}</ol></section><aside class="reminder-card"><p class="section-label">选择标准</p><h2>${escapeHtml(group.status)}</h2><p>${escapeHtml(group.reminder)}</p></aside></div></section>`;
}

updateData();
const stages = groupDefs.map(stage).join('');
let html = `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light"><title>泰国蜜月 · 住宿与行程</title><style>
:root{--paper:#f4eedf;--card:#fffaf0;--ink:#123f37;--soft:#59756d;--line:rgba(18,63,55,.18);--coral:#df6348;--saffron:#d99137;--lagoon:#5ca9a0;--shadow:0 18px 40px rgba(31,61,51,.10)}*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;color:var(--ink);background:repeating-linear-gradient(0deg,rgba(18,63,55,.028) 0 1px,transparent 1px 5px),var(--paper);font-family:"Microsoft YaHei","Noto Sans CJK SC",sans-serif}button,a{font:inherit}.page{max-width:1640px;margin:auto;padding:30px 36px 64px}.page-top{display:grid;grid-template-columns:310px 1fr;gap:48px;align-items:start}.rail{position:sticky;top:24px;padding:28px 25px;border:1px solid var(--line);border-radius:34px;background:rgba(255,250,240,.82);box-shadow:var(--shadow)}.rail-top p{margin:0;color:var(--coral);font-size:12px;font-weight:800;letter-spacing:.1em}.rail-top h1{margin:9px 0 4px;font-family:Georgia,"Songti SC",serif;font-size:34px;line-height:1}.rail-top span{color:var(--soft);font-size:13px}.rail-list{position:relative;display:grid;gap:11px;margin:27px 0 25px;padding:0;list-style:none}.rail-list:before{position:absolute;left:20px;top:23px;bottom:23px;width:1px;background:var(--line);content:""}.rail-button{position:relative;z-index:1;display:grid;grid-template-columns:42px 1fr;gap:11px;width:100%;padding:10px;border:0;border-radius:19px;color:var(--ink);background:transparent;text-align:left;cursor:pointer}.rail-button:hover,.rail-button:focus-visible{outline:0;background:rgba(18,63,55,.07)}.rail-button[aria-current="true"]{color:var(--card);background:var(--ink);box-shadow:0 10px 22px rgba(18,63,55,.18)}.rail-dot{display:grid;width:42px;height:42px;place-items:center;border:2px solid var(--ink);border-radius:50%;color:var(--ink);background:var(--paper);font-size:11px;font-weight:900}.rail-button[aria-current="true"] .rail-dot{border-color:var(--card);color:var(--ink);background:var(--coral)}.rail-button:nth-child(2) .rail-dot{background:#f3c466}.rail-button:nth-child(3) .rail-dot{background:#9ed6d0}.rail-copy small{display:block;color:var(--coral);font-size:11px;font-weight:800;letter-spacing:.05em}.rail-button[aria-current="true"] small,.rail-button[aria-current="true"] span{color:#f7dfd4}.rail-copy strong{display:block;margin:2px 0;font-family:Georgia,"Songti SC",serif;font-size:20px;line-height:1.1}.rail-copy span{display:block;color:var(--soft);font-size:12px}.rail-bottom{padding-top:18px;border-top:1px solid var(--line);color:var(--soft);font-size:12px}.rail-bottom b{color:var(--ink)}.content{min-width:0}.intro{display:flex;justify-content:space-between;gap:30px;margin:8px 0 43px;padding:28px 34px;border:1px solid rgba(223,99,72,.34);border-radius:30px;background:rgba(255,250,240,.72)}.intro p{max-width:670px;margin:0;color:var(--soft);font-size:15px;line-height:1.8}.intro h2{margin:0;font-family:Georgia,"Songti SC",serif;font-size:42px;line-height:1.04}.stage{scroll-margin-top:22px;margin-bottom:74px}.stage[hidden]{display:none}.stage-header{padding:0 7px 19px;border-bottom:1px solid var(--line)}.stage-header>p{margin:0 0 6px;color:var(--coral);font-size:12px;font-weight:900;letter-spacing:.14em}.stage-header h1{margin:0;font-family:Georgia,"Songti SC",serif;font-size:clamp(46px,6vw,74px);line-height:.98;letter-spacing:-.07em}.stage-header>div{display:flex;justify-content:space-between;align-items:center;gap:16px;margin-top:10px;color:var(--soft);font-size:15px}.stage-header b{padding:8px 13px;border-radius:99px;background:#d9eee8;color:var(--ink);font-size:12px}.stay-selector{margin:28px 0 18px}.stay-selector h2{margin:0 0 13px;font-family:Georgia,"Songti SC",serif;font-size:32px;letter-spacing:-.04em}.stay-tabs{display:flex;flex-wrap:wrap;gap:9px}.stay-tab{padding:10px 16px;border:1px solid var(--line);border-radius:999px;color:var(--soft);background:rgba(255,250,240,.72);font-size:13px;font-weight:800;cursor:pointer;transition:transform .18s ease,background .18s ease,color .18s ease}.stay-tab:hover,.stay-tab:focus-visible{outline:0;transform:translateY(-2px);border-color:var(--ink);color:var(--ink)}.stay-tab[aria-selected="true"]{color:var(--card);border-color:var(--ink);background:var(--ink)}.stay-tab.is-primary[aria-selected="true"]{border-color:var(--coral);background:var(--coral)}.accommodation-card{display:grid;grid-template-columns:372px minmax(0,1fr);min-height:372px;overflow:hidden;border:1px solid var(--line);border-left:8px solid var(--coral);border-radius:28px;background:var(--card);box-shadow:var(--shadow)}.stage-saffron .accommodation-card{border-left-color:var(--saffron)}.stage-lagoon .accommodation-card{border-left-color:var(--lagoon)}.stage-ink .accommodation-card{border-left-color:var(--ink)}.stay-gallery{position:relative;width:372px;height:372px;overflow:hidden;background:#dbe5df}.stay-images,.stay-image{position:absolute;inset:0;width:100%;height:100%}.stay-image{object-fit:cover;opacity:0;transition:opacity .25s ease,transform .3s ease}.stay-image.is-active{opacity:1}.stay-gallery:hover .stay-image.is-active{transform:scale(1.035)}.gallery-controls{position:absolute;right:16px;bottom:16px;left:16px;z-index:2;display:flex;justify-content:space-between;pointer-events:none}.gallery-controls button{width:45px;height:45px;border:1px solid rgba(255,250,240,.85);border-radius:50%;color:var(--card);background:rgba(18,63,55,.78);font-size:21px;cursor:pointer;pointer-events:auto}.gallery-controls button:hover,.gallery-controls button:focus-visible{outline:0;background:var(--coral)}.gallery-count{position:absolute;top:15px;right:15px;z-index:2;padding:6px 10px;border-radius:99px;color:var(--card);background:rgba(18,63,55,.78);font-size:11px;font-weight:800}.stay-body{display:flex;min-width:0;min-height:372px;flex-direction:column;padding:30px 34px 25px}.stay-kicker{margin:0;color:var(--coral);font-size:11px;font-weight:900;letter-spacing:.12em}.stage-saffron .stay-kicker{color:var(--saffron)}.stage-lagoon .stay-kicker{color:#2a8077}.stay-intro h3{margin:8px 0 5px;font-family:Georgia,"Songti SC",serif;font-size:clamp(34px,3.7vw,53px);line-height:1.02;letter-spacing:-.055em}.stay-area{margin:0;color:var(--soft);font-size:13px;line-height:1.55}.stay-reason{display:-webkit-box;overflow:hidden;margin:16px 0 13px;padding-top:14px;border-top:1px solid var(--line);-webkit-box-orient:vertical;-webkit-line-clamp:2;color:var(--soft);font-size:13px;line-height:1.55}.stay-reason strong{color:var(--ink)}.stay-metrics{display:grid;grid-template-columns:repeat(3,1fr);margin:0;border:1px solid var(--line)}.stay-metrics>div{min-width:0;padding:13px 17px;border-right:1px solid var(--line)}.stay-metrics>div:last-child{border-right:0}.stay-metrics dt{margin-bottom:4px;color:var(--soft);font-size:11px;font-weight:800}.stay-metrics dd{overflow:hidden;margin:0;color:var(--coral);font-family:Georgia,"Songti SC",serif;font-size:31px;font-weight:800;line-height:1;text-overflow:ellipsis;white-space:nowrap}.stay-metrics .metric-date{font-size:23px}.stay-metrics small{display:block;overflow:hidden;margin-top:5px;color:var(--soft);font-size:11px;text-overflow:ellipsis;white-space:nowrap}.stay-footer{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-top:auto;padding-top:14px}.stay-footer p{display:-webkit-box;max-width:54%;overflow:hidden;margin:0;color:var(--soft);-webkit-box-orient:vertical;-webkit-line-clamp:2;font-size:12px;line-height:1.5}.booking-link{flex:0 0 auto;padding:12px 16px;border-radius:13px;color:var(--card);background:var(--ink);font-size:13px;font-weight:900;text-decoration:none}.booking-link:hover,.booking-link:focus-visible{outline:0;background:var(--coral)}.stage-notes{display:grid;grid-template-columns:minmax(0,1fr) 290px;gap:20px;margin-top:20px}.route-card,.reminder-card{border:1px solid var(--line);border-radius:25px;background:rgba(255,250,240,.64)}.route-card{padding:25px 30px}.section-label{margin:0;color:var(--coral);font-size:11px;font-weight:900;letter-spacing:.12em}.route-card h2,.reminder-card h2{margin:8px 0 15px;font-family:Georgia,"Songti SC",serif;font-size:32px;line-height:1.12}.route-card ol{margin:0;padding:0;list-style:none}.route-card li{display:grid;grid-template-columns:42px 1fr;gap:14px;padding:13px 0;border-top:1px solid var(--line)}.route-card li span{display:grid;width:36px;height:36px;place-items:center;border-radius:50%;color:var(--card);background:var(--ink);font-size:11px;font-weight:900}.route-card strong{font-size:14px}.route-card li p{margin:4px 0 0;color:var(--soft);font-size:13px;line-height:1.55}.reminder-card{padding:25px}.reminder-card p:last-child{margin:0;color:var(--soft);font-size:13px;line-height:1.75}.stage-saffron .section-label{color:var(--saffron)}.stage-lagoon .section-label{color:#2a8077}@media(max-width:1080px){.page{padding:20px}.page-top{grid-template-columns:1fr}.rail{position:static;display:block;padding:17px 18px;border-radius:24px}.rail-list{display:flex;overflow-x:auto;gap:7px;margin:15px -3px;padding:3px}.rail-list:before{display:none}.rail-button{flex:0 0 215px;grid-template-columns:34px 1fr;padding:9px}.rail-dot{width:34px;height:34px}.rail-bottom{display:none}.intro{margin-bottom:34px}.accommodation-card{grid-template-columns:330px minmax(0,1fr);min-height:330px}.stay-gallery{width:330px;height:330px}.stay-body{min-height:330px;padding:24px}.stage-notes{grid-template-columns:1fr 250px}}@media(max-width:700px){.page{padding:14px}.intro{display:block;padding:22px}.intro h2{margin-bottom:10px;font-size:33px}.stage{margin-bottom:50px}.stage-header h1{font-size:50px}.stage-header>div{align-items:flex-start;flex-direction:column}.stay-selector{margin-top:22px}.stay-selector h2{font-size:28px}.stay-tabs{flex-wrap:nowrap;overflow-x:auto;padding-bottom:4px}.stay-tab{flex:0 0 auto}.accommodation-card{display:block;min-height:0;border-left-width:6px;border-radius:23px}.stay-gallery{width:100%;height:auto;aspect-ratio:1}.stay-body{min-height:0;padding:23px 20px}.stay-intro h3{font-size:37px}.stay-metrics>div{padding:12px 9px}.stay-metrics dd{font-size:25px}.stay-metrics .metric-date{font-size:18px}.stay-footer{align-items:flex-start;flex-direction:column}.stay-footer p{max-width:none}.booking-link{width:100%;text-align:center}.stage-notes{display:block}.reminder-card{margin-top:15px}.route-card,.reminder-card{padding:21px}.route-card h2,.reminder-card h2{font-size:27px}}@media(prefers-reduced-motion:reduce){*,*:before,*:after{scroll-behavior:auto!important;transition:none!important}}@media print{body{background:#fff}.page{max-width:none;padding:0}.rail,.intro,.stay-selector,.gallery-controls,.gallery-count,.booking-link{display:none}.page-top{display:block}.stage{display:block!important;page-break-after:always}.stage[hidden],.accommodation-card[hidden]{display:grid!important}.accommodation-card{margin-top:14px;box-shadow:none}.stage-notes{display:none}.stay-gallery{height:280px;width:280px}.stay-image:not(.is-active){display:none}}
 </style></head><body><main class="page"><div class="page-top"><aside class="rail" aria-label="行程导航"><div class="rail-top"><p>泰国蜜月 · 2026</p><h1>慢慢走，好好住</h1><span>4段停留 · 11晚</span></div><ol class="rail-list">${groupDefs.map((group, index) => `<li><button class="rail-button" type="button" data-stage-target="${group.id}" aria-current="${index === 0}"><span class="rail-dot">${String(index + 1).padStart(2, '0')}</span><span class="rail-copy"><small>${group.date}</small><strong>${group.city} · ${group.nights}</strong><span>${group.status}</span></span></button></li>`).join('')}</ol><div class="rail-bottom"><b>✓ 四段住宿均已确定</b><br>交通、船票、天气活动待出发前复核</div></aside><div class="content"><section class="intro"><h2>把住宿看成<br>旅程的一部分</h2><p>四段住宿已经确定，页面展示首选与参考候选。交通班次、船票、库存、取消条件和天气敏感活动均以出发前复核为准。</p></section>${stages}</div></div></main><script>
document.querySelectorAll('[data-tab]').forEach((tab)=>{tab.addEventListener('click',()=>{const group=tab.dataset.tab;const index=Number(tab.dataset.index);document.querySelectorAll('[data-tab="'+group+'"]').forEach((item)=>{item.setAttribute('aria-selected',String(item===tab));item.tabIndex=item===tab?0:-1;});document.querySelectorAll('[data-panel="'+group+'"]').forEach((panel,panelIndex)=>panel.hidden=panelIndex!==index);});tab.addEventListener('keydown',(event)=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;const tabs=[...document.querySelectorAll('[data-tab="'+tab.dataset.tab+'"]')];let target=tabs.indexOf(tab);if(event.key==='ArrowLeft')target=(target-1+tabs.length)%tabs.length;if(event.key==='ArrowRight')target=(target+1)%tabs.length;if(event.key==='Home')target=0;if(event.key==='End')target=tabs.length-1;event.preventDefault();tabs[target].focus();tabs[target].click();});});
document.querySelectorAll('[data-gallery]').forEach((gallery)=>{const images=[...gallery.querySelectorAll('.stay-image')];let active=0;gallery.querySelectorAll('[data-gallery-step]').forEach((button)=>button.addEventListener('click',()=>{images[active].classList.remove('is-active');active=(active+Number(button.dataset.galleryStep)+images.length)%images.length;images[active].classList.add('is-active');gallery.querySelector('.gallery-count').textContent=(active+1)+' / '+images.length;}));});
document.querySelectorAll('[data-stage-target]').forEach((button)=>button.addEventListener('click',()=>{const target=document.getElementById('stage-'+button.dataset.stageTarget);target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});document.querySelectorAll('[data-stage-target]').forEach((item)=>item.setAttribute('aria-current',String(item===button)));}));
</script></body></html>`;
html = html.replace('泰国蜜月 · 2026', '我们这次住哪儿');
html = html.replace('慢慢走，好好住', '曼谷');
html = html.replace('把住宿看成<br>旅程的一部分', '');
html = html.replace('4段停留 · 11晚', '09.24 — 09.28 · 温馨城市基地');
html = html.replace('<ol class="rail-list">', '<a class="rail-map-switch" data-page-switch="map" href="thailand-honeymoon-map.html">🗺️ 看行程地图</a><ol class="rail-list">');
html = html.replace('</head>', '<style>body{overflow-x:hidden}.accommodation-card[hidden]{display:none}.stay-intro h3{display:-webkit-box;overflow:hidden;max-height:2.08em;-webkit-box-orient:vertical;-webkit-line-clamp:2;font-size:clamp(30px,3vw,43px)}.intro,.stage-header{display:none}.rail-map-switch{display:flex;align-items:center;justify-content:center;width:100%;margin:22px 0 8px;padding:15px 18px;border-radius:16px;background:#123f37;color:#fffaf0;font-size:17px;font-weight:900;text-decoration:none;box-shadow:0 10px 20px rgba(18,63,55,.16)}.rail-map-switch:hover{background:#df6348}@media(min-width:1081px){.rail{top:50vh;transform:translateY(-50%)}.content{padding-top:8px}.stay-selector{margin-top:0}}@media(max-width:700px){.rail-list li{flex:0 0 215px}.stay-intro h3{font-size:34px}.rail-map-switch{width:auto;margin:0 0 12px}}@media print{.accommodation-card[hidden]{display:none!important}}</style></head>');
html = html.replace('</body>', '<script data-personal-board>const railTitle=document.querySelector(".rail-top h1");const railKicker=document.querySelector(".rail-top p");const railMeta=document.querySelector(".rail-top span");function updateRail(button){const copy=button.querySelector(".rail-copy");if(!copy)return;railKicker.textContent="我们这次住哪儿";railTitle.textContent=copy.querySelector("strong")?.textContent.split(" · ")[0]||"曼谷";railMeta.textContent=[copy.querySelector("small")?.textContent,copy.querySelector("span")?.textContent].filter(Boolean).join(" · ");}document.querySelectorAll("[data-stage-target]").forEach((button)=>button.addEventListener("click",()=>updateRail(button)));updateRail(document.querySelector("[data-stage-target]"));</script></body>');
fs.writeFileSync(outputPath, html, 'utf8');
console.log(`Wrote ${outputPath}`);
