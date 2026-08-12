const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const dataPath = path.join(__dirname, 'site-data.json');
const outputPath = path.join(root, 'outputs', 'index.html');

const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// 分区主色:圆点 / 卡片底 / 卡片文字。新增模块时在这里加一个色名即可。
const ACCENTS = {
  pink:  { dot: '#f2789f', bg: '#fff0f4', ink: '#8a2846', band: '#ffd6e0' },
  blue:  { dot: '#4a7dd6', bg: '#eef4ff', ink: '#1f3f80', band: '#cfe0ff' },
  green: { dot: '#4d9b6a', bg: '#eef7f0', ink: '#1f5334', band: '#cfe8d6' }
};

const escapeHtml = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const accentOf = (name) => {
  const accent = ACCENTS[name];
  if (!accent) throw new Error(`site-data.json 使用了未定义的分区主色:${name}`);
  return accent;
};

// 派生色在构建期算好,直接输出 rgba()。
// 不用 color-mix():它在旧引擎里会让整条声明失效并回退到继承色,
// 边框和文字会一起变成深墨色,和设计完全不符。
const rgba = (hex, alpha) => {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) throw new Error(`分区主色必须是 6 位十六进制:${hex}`);
  const int = parseInt(m[1], 16);
  return `rgba(${(int >> 16) & 255}, ${(int >> 8) & 255}, ${int & 255}, ${alpha})`;
};

const ARROW = '<svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

function renderTagline({ tagline, taglineHighlight }) {
  const lines = tagline.split('\n').map(escapeHtml);
  if (!taglineHighlight) return lines.join('<br>');
  const target = escapeHtml(taglineHighlight);
  let done = false;
  return lines
    .map((line) => {
      if (done || !line.includes(target)) return line;
      done = true;
      return line.replace(target, `<mark>${target}</mark>`);
    })
    .join('<br>');
}

function renderEntry(entry, index) {
  const icon = entry.icon
    ? `<span class="card-icon" aria-hidden="true">${escapeHtml(entry.icon)}</span>`
    : '';
  return `        <a class="card" href="${escapeHtml(entry.href)}" style="--i:${index}">
          <span class="card-body">
            ${icon}
            <h3>${escapeHtml(entry.title)}</h3>
            <p>${escapeHtml(entry.desc)}</p>
          </span>
          <span class="card-go">打开${ARROW}</span>
        </a>`;
}

function renderEmptyCard(section, index) {
  return `        <p class="card card-empty" style="--i:${index}">${escapeHtml(section.emptyText)}</p>`;
}

function renderSection(section) {
  const cards = section.entries.map(renderEntry);
  if (section.emptyText) cards.push(renderEmptyCard(section, cards.length));
  return `      <section class="zone zone-${escapeHtml(section.accent)}" id="${escapeHtml(section.id)}" aria-labelledby="${escapeHtml(section.id)}-title">
        <div class="zone-head">
          <span class="zone-dot" aria-hidden="true"></span>
          <h2 id="${escapeHtml(section.id)}-title">${escapeHtml(section.title)}</h2>
        </div>
        <div class="zone-grid">
${cards.join('\n')}
        </div>
      </section>`;
}

function renderAccentVars() {
  return Object.entries(ACCENTS)
    .map(([name, a]) => `    .zone-${name} {
      --dot: ${a.dot};
      --card-bg: ${a.bg};
      --card-ink: ${a.ink};
      --card-soft: ${rgba(a.ink, 0.88)};
      --card-edge: ${rgba(a.ink, 0.28)};
      --card-shadow: ${rgba(a.ink, 0.22)};
      --card-border: ${rgba(a.ink, 0.12)};
    }`)
    .join('\n');
}

function renderBlobs() {
  return data.sections
    .map((section) => `<span style="background:${accentOf(section.accent).dot}"></span>`)
    .join('');
}

const heroBand = accentOf(data.sections[0].accent).band;

const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(data.profile.name)} · 自留地</title>
  <meta name="description" content="${escapeHtml(data.profile.intro)}">
  <meta name="author" content="${escapeHtml(data.profile.name)}">
  <meta name="theme-color" content="#ffffff">
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body, h1, h2, h3, p { margin: 0; }

    :root {
      --ink:        #141414;
      --ink-soft:   #5f5f63;
      --page:       #ffffff;
      --hero-band:  ${heroBand};
      --gutter:     clamp(24px, 6vw, 56px);
      --maxw:       1100px;
      --ease:       cubic-bezier(.22, .8, .3, 1);
    }

${renderAccentVars()}

    html { scroll-behavior: smooth; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI",
                   "PingFang SC", "Microsoft YaHei", sans-serif;
      background: var(--page);
      color: var(--ink);
      -webkit-font-smoothing: antialiased;
      line-height: 1.6;
    }

    :focus-visible {
      outline: 2.5px solid var(--dot, #4a7dd6);
      outline-offset: 4px;
      border-radius: 6px;
    }

    .wrap { max-width: var(--maxw); margin: 0 auto; padding: 0 var(--gutter); }

    /* ---------- Hero ---------- */
    .hero {
      min-height: min(88vh, 760px);
      min-height: min(88svh, 760px);
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: clamp(72px, 14vh, 128px) 0 clamp(48px, 9vh, 88px);
    }
    .blobs { display: flex; gap: 8px; margin-bottom: clamp(22px, 4vh, 32px); }
    .blobs span {
      width: clamp(26px, 6vw, 34px);
      aspect-ratio: 1;
      border-radius: 32%;
      display: block;
    }
    .hero h1 {
      font-size: clamp(38px, 7.4vw, 66px);
      font-weight: 800;
      letter-spacing: -.035em;
      line-height: 1.08;
      max-width: 15ch;
      margin-bottom: clamp(16px, 3vh, 24px);
    }
    .hero h1 mark {
      background: linear-gradient(180deg, transparent 62%, var(--hero-band) 62%);
      color: inherit;
      padding: 0 .04em;
    }
    .hero .intro {
      font-size: clamp(16px, 2.2vw, 18px);
      color: var(--ink-soft);
      max-width: 34ch;
    }

    /* ---------- Zones ---------- */
    .zone { padding-top: clamp(56px, 9vh, 76px); }
    main > .zone:last-of-type { padding-bottom: clamp(56px, 9vh, 76px); }

    .zone-head { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
    .zone-dot { width: 12px; height: 12px; border-radius: 4px; background: var(--dot); flex: none; }
    .zone-head h2 {
      font-size: 15px;
      font-weight: 700;
      letter-spacing: .1em;
      text-transform: uppercase;
    }

    .zone-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(min(300px, 100%), 1fr));
      gap: 18px;
    }

    /* 卡片本底是中性白,颜色只出现在图标徽章、边框和"打开"箭头上——
       避免整块纯色底,分区之间靠色块跳动而不是靠色块铺满区分。 */
    .card {
      border-radius: 20px;
      padding: 24px;
      min-height: 158px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 16px;
      background: var(--page);
      border: 1.5px solid var(--card-border);
      color: var(--ink);
      text-decoration: none;
      cursor: pointer;
      transition: transform .25s var(--ease), box-shadow .25s var(--ease), border-color .25s var(--ease);
    }
    .card-icon {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      background: var(--card-bg);
      margin-bottom: 12px;
    }
    .card h3 {
      font-size: clamp(19px, 2.6vw, 21px);
      font-weight: 700;
      letter-spacing: -.01em;
      margin-bottom: 8px;
    }
    .card p { font-size: 15px; line-height: 1.65; color: var(--ink-soft); }
    .card-go {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      font-weight: 600;
      color: var(--card-ink);
    }
    .arrow { width: 16px; height: 16px; transition: transform .25s var(--ease); }

    @media (hover: hover) {
      .card:hover { transform: translateY(-3px); border-color: var(--card-edge); box-shadow: 0 12px 28px -12px var(--card-shadow); }
      .card:hover .arrow { transform: translateX(3px); }
    }
    .card:active { transform: translateY(-1px); }

    /* 虚线边框是装饰,可以淡;空态文案是内容,必须可读。两者用不同强度。 */
    .card-empty {
      background: none;
      border: 1.5px dashed var(--card-edge);
      color: var(--card-soft);
      align-items: center;
      justify-content: center;
      text-align: center;
      font-size: 15px;
      cursor: default;
    }

    /* ---------- Footer ---------- */
    footer {
      border-top: 1px solid #ededf0;
      margin-top: clamp(48px, 8vh, 72px);
      padding: 28px 0 40px;
      font-size: 13px;
      color: var(--ink-soft);
      display: flex;
      flex-wrap: wrap;
      gap: 8px 20px;
      align-items: center;
      justify-content: space-between;
    }
    footer a {
      color: inherit;
      text-decoration-color: #c9c9ce;
      text-underline-offset: 3px;
      min-height: 24px;
      display: inline-flex;
      align-items: center;
    }
    @media (hover: hover) {
      footer a:hover { color: var(--ink); text-decoration-color: currentColor; }
    }

    /* ---------- 入场动画 ----------
       Hero 在首屏,用纯 CSS 入场,永不依赖 JS 才可见。
       .reveal 只由脚本加给首屏之外的分区,脚本不跑就什么都不隐藏。 */
    .hero > * { animation: rise .6s var(--ease) backwards; }
    .hero .blobs { animation-delay: .05s; }
    .hero h1    { animation-delay: .13s; }
    .hero .intro { animation-delay: .21s; }

    .reveal { opacity: 0; transform: translateY(18px); }
    .reveal.in {
      opacity: 1;
      transform: none;
      transition: opacity .55s var(--ease), transform .55s var(--ease);
    }
    .zone:not(.reveal) .card,
    .zone.in .card {
      animation: rise .5s var(--ease) backwards;
      animation-delay: calc(var(--i, 0) * 70ms + 90ms);
    }
    @keyframes rise {
      from { opacity: 0; transform: translateY(14px); }
      to   { opacity: 1; transform: none; }
    }

    @media (prefers-reduced-motion: reduce) {
      html { scroll-behavior: auto; }
      *, *::before, *::after {
        animation-duration: .01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: .01ms !important;
      }
      .reveal { opacity: 1; transform: none; }
    }
  </style>
</head>
<body>
  <div class="wrap">
    <header class="hero">
      <div class="blobs" aria-hidden="true">${renderBlobs()}</div>
      <h1>${renderTagline(data.profile)}</h1>
      <p class="intro">${escapeHtml(data.profile.intro)}</p>
    </header>

    <main>
${data.sections.map(renderSection).join('\n\n')}
    </main>

    <footer>
      <span>© ${new Date().getFullYear()} ${escapeHtml(data.profile.name)}</span>
${data.profile.email ? `      <a href="mailto:${escapeHtml(data.profile.email)}">${escapeHtml(data.profile.email)}</a>` : ''}
    </footer>
  </div>

  <script>
    (function () {
      var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced || !('IntersectionObserver' in window)) return;

      // 只隐藏首屏之外的分区:首屏内容任何情况下都直接可见。
      var hidden = [].filter.call(document.querySelectorAll('.zone'), function (el) {
        return el.getBoundingClientRect().top > window.innerHeight * 0.9;
      });
      if (!hidden.length) return;

      hidden.forEach(function (el) { el.classList.add('reveal'); });

      function show(el) { el.classList.add('in'); }

      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          show(entry.target);
          io.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -12% 0px', threshold: .1 });
      hidden.forEach(function (el) { io.observe(el); });

      // 兜底:IO 若因任何原因没有触发,页面也不会停在空白状态。
      setTimeout(function () {
        io.disconnect();
        hidden.forEach(show);
      }, 2500);
    })();
  </script>
</body>
</html>
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, html, 'utf8');
console.log(`Wrote homepage to ${outputPath}`);
