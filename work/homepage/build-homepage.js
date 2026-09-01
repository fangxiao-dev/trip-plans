const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const dataPath = path.join(__dirname, 'site-data.json');
const outputPath = path.join(root, 'outputs', 'index.html');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const ACCENTS = {
  pink:   { paper: '#ffd1df', ink: '#681a38', soft: '#81445b', tag: '#ed5f91' },
  orange: { paper: '#ffd9bd', ink: '#713418', soft: '#81543c', tag: '#dc6b3e' },
  blue:   { paper: '#d6e4ff', ink: '#193f7b', soft: '#49678e', tag: '#3f7ce0' },
  green:  { paper: '#d5f0dd', ink: '#205838', soft: '#4b725b', tag: '#4aa66c' }
};

const TRAVEL_ACCENTS = {
  us: ACCENTS.pink,
  'solo-trips': ACCENTS.blue,
  trips: ACCENTS.green
};

const TRAVEL_ICONS = {
  us: '<svg class="tag-icon tag-icon-heart" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/></svg>',
  'solo-trips': '<svg class="tag-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="8" cy="5" r="2"/><path d="M8 7.5v6l-3 6.5M8 13.5l4 6.5M8 9l4 2"/><rect x="13" y="8" width="5" height="8" rx="2"/><path d="M13 10h-2"/></svg>',
  trips: '<svg class="tag-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 11 9-7 9 7v9h-6v-6H9v6H3Z"/></svg>'
};

const ARROW = '<svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const WELCOME_ICON = '<svg class="welcome-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l1.35 4.15L17.5 8.5l-4.15 1.35L12 14l-1.35-4.15L6.5 8.5l4.15-1.35L12 3Z"/><path d="M18.5 14l.75 2.25L21.5 17l-2.25.75L18.5 20l-.75-2.25L15.5 17l2.25-.75L18.5 14Z"/></svg>';

const REGIONS = [
  { id: 'travel', title: '旅行' },
  { id: 'tools', title: '小工具' },
  { id: 'blog', title: '博客' }
];

const escapeHtml = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const accentOf = (section) => {
  const accent = TRAVEL_ACCENTS[section.id] || ACCENTS[section.accent];
  if (!accent) throw new Error(`site-data.json 使用了未定义的分区主色:${section.accent}`);
  return accent;
};

function renderTagline({ tagline, taglineHighlight }) {
  const lines = tagline.split('\n').map(escapeHtml);
  if (!taglineHighlight) return lines.join('<br>');
  const target = escapeHtml(taglineHighlight);
  let highlighted = false;
  return lines.map((line) => {
    if (highlighted || !line.includes(target)) return line;
    highlighted = true;
    return line.replace(target, `<mark>${target}</mark>`);
  }).join('<br>');
}

function renderEntryCard(section, entry, index) {
  const accent = accentOf(section);
  const icon = TRAVEL_ICONS[section.id] || '';
  const paper = section.region === 'travel' ? '#fffaf2' : accent.paper;
  const date = entry.date ? `<span class="card-date">${escapeHtml(entry.date)}</span>` : '';
  return `      <a class="archive-card" href="${escapeHtml(entry.href)}" style="--i:${index};--paper:${paper};--card-ink:${accent.ink};--card-soft:${accent.soft};--tag:${accent.tag}">
        <span class="card-head"><span class="card-section">${icon}<span>${escapeHtml(section.title)}</span></span></span>
        <span class="card-body"><h3>${escapeHtml(entry.title)}</h3><p>${escapeHtml(entry.desc)}</p></span>
        <span class="card-foot">${date}<span class="card-open" aria-hidden="true">${ARROW}</span></span>
      </a>`;
}

function renderEmptyCard(section, index) {
  return `      <article class="archive-card card-empty" style="--i:${index}">
        <span class="empty-copy">${escapeHtml(section.emptyText)}</span>
      </article>`;
}

function renderRegions() {
  let cardIndex = 0;
  return REGIONS.map((region) => {
    const sections = data.sections.filter((section) => section.region === region.id);
    const cards = [];
    sections.forEach((section) => section.entries.forEach((entry) => cards.push({ type: 'entry', section, entry })));
    sections.forEach((section) => {
      if (section.emptyText) cards.push({ type: 'empty', section });
    });
    const content = cards.map((card) => {
      const html = card.type === 'entry'
        ? renderEntryCard(card.section, card.entry, cardIndex)
        : renderEmptyCard(card.section, cardIndex);
      cardIndex += 1;
      return html;
    }).join('\n');
    return `    <section class="module-region" aria-labelledby="region-${region.id}">
      <header class="region-head"><h2 id="region-${region.id}">${region.title}</h2><span>${String(cards.length).padStart(2, '0')}</span></header>
      <div class="region-grid">
${content}
      </div>
    </section>`;
  }).join('\n');
}

const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(data.profile.name)} · 自留地</title>
  <meta name="description" content="${escapeHtml(data.profile.intro)}">
  <meta name="author" content="${escapeHtml(data.profile.name)}">
  <meta name="theme-color" content="#182238">
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body, h1, h2, h3, p { margin: 0; }

    :root {
      --page: #182238;
      --page-deep: #0c1424;
      --ink: #fbf5e9;
      --ink-soft: #c7cfde;
      --accent: #ffd06f;
      --line: rgba(255,255,255,.23);
      --gutter: clamp(20px, 5vw, 64px);
      --maxw: 1240px;
      --ease: cubic-bezier(.22,.8,.3,1);
    }

    body {
      min-width: 320px;
      color: var(--ink);
      background: var(--page);
      font-family: "Avenir Next", "PingFang SC", "Microsoft YaHei", sans-serif;
      -webkit-font-smoothing: antialiased;
      line-height: 1.6;
    }

    a { color: inherit; }
    a, button { touch-action: manipulation; }
    :focus-visible { outline: 3px solid var(--accent); outline-offset: 5px; }
    .skip-link { position: fixed; left: 16px; top: 16px; z-index: 100; padding: 10px 14px; color: var(--page); background: var(--accent); border-radius: 8px; transform: translateY(-160%); }
    .skip-link:focus { transform: none; }
    .shell { max-width: var(--maxw); margin: 0 auto; padding: 0 var(--gutter); }

    .masthead { display: flex; align-items: center; justify-content: space-between; gap: 24px; padding: 28px 0; border-bottom: 1px solid var(--line); }
    .masthead strong, .masthead span { font: 800 11px/1.2 ui-monospace, "SFMono-Regular", Consolas, monospace; letter-spacing: .13em; text-transform: uppercase; }
    .masthead strong { color: var(--accent); }
    .masthead span { color: var(--ink-soft); text-align: right; }

    .hero { display: grid; grid-template-columns: minmax(0, 1.12fr) minmax(360px, .88fr); gap: clamp(34px, 6vw, 80px); align-items: center; padding: clamp(56px, 7vw, 88px) 0 clamp(64px, 8vw, 96px); }
    .eyebrow { margin-bottom: 24px; color: var(--accent); font: 800 11px/1.2 ui-monospace, "SFMono-Regular", Consolas, monospace; letter-spacing: .13em; }
    .hero h1 { font-size: clamp(54px, 7vw, 92px); font-weight: 900; line-height: .96; letter-spacing: -.065em; white-space: nowrap; }
    .hero h1 mark { color: var(--accent); background: none; }
    .intro { min-height: 44px; display: inline-flex; align-items: center; gap: 10px; margin-top: 28px; color: var(--ink-soft); font-size: clamp(17px, 1.8vw, 20px); line-height: 1.5; }
    .welcome-icon { width: 24px; height: 24px; color: var(--accent); flex: none; }

    .passport { position: relative; overflow: hidden; min-height: 360px; padding: 34px; color: var(--page); background: #ffd66b; border-radius: 24px; box-shadow: 18px 18px 0 var(--page-deep); transform: rotate(2.5deg); }
    .passport::after { content: "XIAO"; position: absolute; right: 20px; bottom: -10px; color: rgba(24,34,56,.14); font: 900 clamp(72px, 10vw, 118px)/1 Impact, "Arial Black", sans-serif; letter-spacing: -.04em; }
    .passport-label { display: block; font: 900 11px/1.2 ui-monospace, "SFMono-Regular", Consolas, monospace; letter-spacing: .13em; }
    .passport-title { max-width: 12ch; margin-top: 92px; font-size: clamp(34px, 4.1vw, 50px); font-weight: 900; line-height: 1.02; letter-spacing: -.05em; }
    .passport-dots { display: flex; gap: 8px; margin-top: 26px; }
    .passport-dots i { width: 13px; height: 13px; border-radius: 50%; }
    .passport-dots i:nth-child(1) { background: #d76a43; }
    .passport-dots i:nth-child(2) { background: #4a7dd6; }
    .passport-dots i:nth-child(3) { background: #f2789f; }
    .passport-dots i:nth-child(4) { background: #e3ad3e; }
    .passport-dots i:nth-child(5) { background: #4d9b6a; }

    .module-region { padding: 40px 0 48px; border-top: 1px solid var(--line); }
    .module-region:last-child { padding-bottom: clamp(72px, 9vw, 104px); }
    .region-head { display: flex; align-items: baseline; justify-content: space-between; gap: 24px; margin-bottom: 22px; }
    .region-head h2 { font-size: clamp(25px, 3vw, 34px); line-height: 1; letter-spacing: -.035em; }
    .region-head span { color: var(--ink-soft); font: 800 11px/1 ui-monospace, "SFMono-Regular", Consolas, monospace; }
    .region-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
    .archive-card { aspect-ratio: 1.12 / 1; min-height: 230px; padding: 20px; display: flex; flex-direction: column; color: #263149; background: linear-gradient(145deg, #fffdf8, var(--paper)); border: 1px solid rgba(24,34,56,.16); border-radius: 18px; text-decoration: none; box-shadow: inset 0 1px 0 rgba(255,255,255,.95), 7px 7px 0 var(--tag); transition: transform .22s var(--ease), box-shadow .22s var(--ease); animation: rise .5s var(--ease) backwards; animation-delay: calc(var(--i) * 55ms); }
    .card-head { padding-bottom: 14px; border-bottom: 2px dashed var(--tag); }
    .card-section { display: inline-flex; align-items: center; gap: 7px; color: var(--tag); font-size: 14px; font-weight: 800; }
    .tag-icon { width: 16px; height: 16px; flex: none; }
    .card-body { margin: auto 0; }
    .card-body h3, .card-body p { display: -webkit-box; overflow: hidden; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
    .card-body h3 { margin-bottom: 9px; color: var(--tag); font-size: clamp(19px, 1.8vw, 23px); line-height: 1.16; letter-spacing: -.025em; }
    .card-body p { min-height: 3.1em; color: #526078; font-size: 13px; line-height: 1.55; }
    .card-foot { min-height: 42px; display: flex; align-items: end; justify-content: space-between; gap: 16px; }
    .card-date { color: #263149; font-family: inherit; font-size: 13px; font-weight: 700; line-height: 1.2; letter-spacing: 0; font-variant-numeric: tabular-nums; }
    .card-open { width: 42px; height: 42px; display: grid; place-items: center; flex: none; color: var(--tag); border: 2px solid currentColor; border-radius: 12px; transition: color .2s var(--ease), background .2s var(--ease), transform .2s var(--ease); }
    .arrow { width: 18px; height: 18px; }
    .archive-card:hover { transform: translate(-3px, -3px); box-shadow: inset 0 1px 0 rgba(255,255,255,.95), 10px 10px 0 var(--tag); }
    .archive-card:hover .card-open { color: #fff; background: var(--tag); transform: rotate(-5deg); }
    .archive-card:active { transform: translate(3px, 3px); box-shadow: inset 0 1px 0 rgba(255,255,255,.95), 3px 3px 0 var(--tag); }

    .card-empty { --tag: var(--page-deep); color: var(--ink); background: linear-gradient(145deg, #2b3957, #202d48); border-color: #44536f; box-shadow: inset 0 1px 0 rgba(255,255,255,.08), 7px 7px 0 var(--page-deep); }
    .card-empty:hover { transform: none; box-shadow: inset 0 1px 0 rgba(255,255,255,.08), 7px 7px 0 var(--page-deep); }
    .empty-copy { margin: auto; color: #d6ddeb; font-size: 16px; line-height: 1.55; text-align: center; }

    footer { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px 24px; padding: 28px 0 44px; color: var(--ink-soft); border-top: 1px solid var(--line); font-size: 13px; }
    footer a { min-height: 44px; display: inline-flex; align-items: center; text-underline-offset: 4px; }
    footer a:hover { color: var(--ink); }

    @keyframes rise { from { opacity: 0; transform: translateY(14px); } }

    @media (max-width: 1080px) {
      .hero { grid-template-columns: 1fr; }
      .passport { width: min(100%, 600px); }
      .region-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
      .archive-card { min-height: 250px; }
    }

    @media (max-width: 680px) {
      .masthead span { display: none; }
      .hero { padding-top: 72px; }
      .hero h1 { white-space: normal; }
      .passport { min-height: 290px; padding: 28px; box-shadow: 10px 10px 0 var(--page-deep); transform: rotate(1.5deg); }
      .passport-title { margin-top: 58px; }
      .module-region { padding: 28px 0 34px; }
      .region-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
      .archive-card { aspect-ratio: auto; min-height: 210px; padding: 12px; border-radius: 15px; }
      .card-head { padding-bottom: 8px; }
      .card-section { gap: 5px; font-size: 11px; }
      .tag-icon { width: 14px; height: 14px; }
      .card-body { margin: 12px 0 10px; }
      .card-body h3 { margin-bottom: 0; font-size: 15px; line-height: 1.16; }
      .card-body p { margin-top: 7px; font-size: 11px; line-height: 1.45; }
      .card-foot { min-height: 34px; margin-top: auto; gap: 7px; }
      .card-date { font-size: 11px; white-space: nowrap; }
      .card-open { width: 34px; height: 34px; border-radius: 10px; }
      .arrow { width: 16px; height: 16px; }
      .archive-card { box-shadow: inset 0 1px 0 rgba(255,255,255,.95), 4px 4px 0 var(--tag); }
      .archive-card:hover { transform: none; box-shadow: inset 0 1px 0 rgba(255,255,255,.95), 4px 4px 0 var(--tag); }
      .archive-card:active { transform: translate(2px, 2px); box-shadow: inset 0 1px 0 rgba(255,255,255,.95), 2px 2px 0 var(--tag); }
      .card-empty, .card-empty:hover { box-shadow: inset 0 1px 0 rgba(255,255,255,.08), 4px 4px 0 var(--page-deep); }
      .empty-copy { margin: auto; font-size: 13px; }
      footer { align-items: start; flex-direction: column; }
    }

    @media (max-width: 520px) {
      .archive-card { min-height: 190px; }
      .card-body h3 { font-size: 14px; }
      .card-body p { font-size: 10.5px; }
    }

    @media (prefers-reduced-motion: reduce) {
      html { scroll-behavior: auto; }
      *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
    }
  </style>
</head>
<body>
  <a class="skip-link" href="#archive">跳到内容</a>
  <div class="shell">
    <header class="masthead">
      <strong>Private archive / ${escapeHtml(data.profile.name)}</strong>
      <span>旅行、工具、和想法<br>持续更新</span>
    </header>

    <section class="hero" aria-labelledby="page-title">
      <div>
        <p class="eyebrow">WELCOME / ${new Date().getFullYear()}</p>
        <h1 id="page-title">${renderTagline(data.profile)}</h1>
        <p class="intro">${WELCOME_ICON}<span>${escapeHtml(data.profile.intro)}</span></p>
      </div>
      <div class="passport" aria-hidden="true">
        <span class="passport-label">PERSONAL ROUTE DOCUMENT</span>
        <p class="passport-title">旅行、工具、<br>和想法。</p>
        <span class="passport-dots"><i></i><i></i><i></i><i></i><i></i></span>
      </div>
    </section>

    <main id="archive">
${renderRegions()}
    </main>

    <footer>
      <span>© ${new Date().getFullYear()} ${escapeHtml(data.profile.name)}</span>
${data.profile.email ? `      <a href="mailto:${escapeHtml(data.profile.email)}">${escapeHtml(data.profile.email)}</a>` : ''}
    </footer>
  </div>
</body>
</html>
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, html, 'utf8');
console.log(`Wrote homepage to ${outputPath}`);
