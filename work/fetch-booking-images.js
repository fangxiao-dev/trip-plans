const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const debugPort = 9237;
const outDir = 'E:/Personal/旅行/outputs/assets/booking';
const data = JSON.parse(fs.readFileSync('E:/Personal/旅行/work/trip-data.json', 'utf8'));
const defaultWanted = [
  'pattaya_best_beach_villa', 'pattaya_edge_central_walking_street', 'pattaya_holiday_inn_express_central', 'pattaya_leela_resort_spa',
  'koh_samet_larissa_private_beach', 'koh_samet_tubtim_beachfront', 'koh_samet_viking_ao_thian', 'koh_samet_samed_garden_aonoinna',
  'bkk2_true_siam_rangnam', 'bkk2_global_pratunam', 'bkk2_siam_star', 'bkk2_4m_pratunam'
];
const wanted = new Set(process.argv.slice(2).length ? process.argv.slice(2) : defaultWanted);

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function waitForDebugServer() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try { return await fetch(`http://127.0.0.1:${debugPort}/json/version`).then((response) => response.json()); } catch { await delay(300); }
  }
  throw new Error('Chrome 调试端口未启动');
}

async function connectTarget(url) {
  const response = await fetch(`http://127.0.0.1:${debugPort}/json/new?${encodeURIComponent(url)}`, { method: 'PUT' });
  const target = await response.json();
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
  let nextId = 1;
  const pending = new Map();
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      message.error ? reject(new Error(message.error.message)) : resolve(message.result);
    }
  });
  const call = (method, params = {}) => new Promise((resolve, reject) => {
    const id = nextId++;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
  return { socket, call };
}

async function evaluate(client, expression) {
  const result = await client.call('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  return result.result.value;
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const profile = path.join(outDir, '.chrome-profile');
  const chrome = spawn(chromePath, [`--remote-debugging-port=${debugPort}`, '--remote-allow-origins=*', `--user-data-dir=${profile}`, '--headless=new', '--disable-gpu', '--no-first-run', 'about:blank'], { stdio: 'ignore', detached: true });
  try {
    await waitForDebugServer();
    const records = [];
    for (const item of data.accommodation_candidates.filter((candidate) => wanted.has(candidate.id))) {
      const row = { id: item.id, name: item.name, platform: 'Booking.com 中国站', source_url: item.url, candidates: [], error: null };
      try {
        const listingPage = new URL(item.url);
        listingPage.search = '';
        const client = await connectTarget(listingPage.href);
        await delay(6000);
        await evaluate(client, `(async()=>{for(let y=0;y<Math.min(document.body.scrollHeight,6000);y+=800){scrollTo(0,y);await new Promise(r=>setTimeout(r,220));}scrollTo(0,0);return true})()`);
        await delay(1200);
        if (process.argv.includes('--inspect')) console.log(await evaluate(client, `Array.from(document.querySelectorAll('[data-testid]')).map((element)=>element.getAttribute('data-testid')).filter((value)=>/gallery|photo|image/i.test(value)).filter((value,index,values)=>values.indexOf(value)===index).join('\n')`));
        await evaluate(client, `(()=>{const image=document.querySelector('img[src*="bstatic.com/xdata/images"]'); if(image) image.click(); return Boolean(image)})()`);
        await delay(1800);
        const images = await evaluate(client, `Array.from(document.images).map((image)=>({src:image.currentSrc||image.src,alt:image.alt,width:image.naturalWidth,height:image.naturalHeight})).filter((image)=>/bstatic\\.com\\/xdata\\/images/i.test(image.src)&&image.width>250&&image.height>150)`);
        const unique = [...new Map(images.map((image) => [image.src, image])).values()].slice(0, process.argv.includes('--all') ? 60 : 18);
        for (let index = 0; index < unique.length; index += 1) {
          const source = unique[index].src;
          const response = await fetch(source);
          const body = Buffer.from(await response.arrayBuffer());
          if (!response.ok || body.length < 5000) continue;
          const filename = `${item.id}-candidate-${String(index + 1).padStart(2, '0')}.jpg`;
          fs.writeFileSync(path.join(outDir, filename), body);
          row.candidates.push({ path: `outputs/assets/booking/${filename}`, source_image_url: source, alt: unique[index].alt || '' });
        }
        client.socket.close();
        if (!row.candidates.length) row.error = '未在页面加载的官方图库中取得有效图片';
        console.log(`${item.id}: ${row.candidates.length}`);
      } catch (error) { row.error = error.message; console.log(`${item.id}: ERROR ${error.message}`); }
      records.push(row);
    }
    fs.writeFileSync(path.join(outDir, 'booking-image-candidates.json'), JSON.stringify({ updated_at: new Date().toISOString(), items: records }, null, 2), 'utf8');
  } finally {
    try { process.kill(-chrome.pid); } catch { chrome.kill(); }
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
