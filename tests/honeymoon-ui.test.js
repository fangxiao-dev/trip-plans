const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { after, before, test } = require('node:test');
const { chromium } = require('playwright');

const outputRoot = path.resolve(__dirname, '..', 'outputs');
let browser;
let server;
let baseUrl;

function serveOutputs(request, response) {
  const pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
  const relativePath = pathname.replace(/^\/+/, '');
  let filePath = path.resolve(outputRoot, relativePath);

  if (!filePath.startsWith(outputRoot)) {
    response.writeHead(403).end('Forbidden');
    return;
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  if (!fs.existsSync(filePath)) {
    response.writeHead(404).end('Not found');
    return;
  }

  const contentTypes = {
    '.html': 'text/html; charset=utf-8',
    '.jpg': 'image/jpeg',
    '.png': 'image/png',
    '.svg': 'image/svg+xml'
  };
  response.writeHead(200, { 'Content-Type': contentTypes[path.extname(filePath)] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(response);
}

async function clickGroupAndDay(page, groupName, dayLabel) {
  await page.getByRole('tab', { name: groupName, exact: true }).click();
  await page.getByRole('tab', { name: new RegExp(`^${dayLabel.replace('.', '\\.')}`) }).click();
}

async function expectNoHorizontalOverflow(page) {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth
  }));
  assert.ok(
    dimensions.scrollWidth <= dimensions.clientWidth,
    `页面横向溢出：${dimensions.scrollWidth}px > ${dimensions.clientWidth}px`
  );
}

before(async () => {
  server = http.createServer(serveOutputs);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({ headless: true });
});

after(async () => {
  await browser?.close();
  await new Promise((resolve) => server?.close(resolve));
});

test('蜜月地图按已确认方案展示并保持交互可用', async () => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto(`${baseUrl}/ing/honeymoon-with-liv/`, { waitUntil: 'domcontentloaded' });

  await clickGroupAndDay(page, '曼谷', '09.27');
  await assert.doesNotReject(() => page.getByRole('heading', { name: 'ICONSIAM', exact: true }).waitFor());
  assert.equal(await page.getByRole('heading', { name: '伦披尼公园 Lumphini Park', exact: true }).count(), 0);

  const optionalSection = page.locator('.section-label', { hasText: '备选' }).locator('xpath=following-sibling::*[1]');
  await assert.doesNotReject(() => optionalSection.getByRole('heading', { name: 'Siam / Chit Lom', exact: true }).waitFor());

  const rajadamnern = page.locator('.route-item', { hasText: 'Rajadamnern Stadium' });
  assert.equal(await rajadamnern.getByRole('link', { name: '导航' }).count(), 1);
  assert.equal(
    await rajadamnern.getByRole('link', { name: '预约' }).getAttribute('href'),
    'https://www.ticketmelon.com/raj/kiatpetch-27sep26'
  );
  await rajadamnern.locator('.route-card').click();
  await assert.doesNotReject(() => rajadamnern.waitFor({ state: 'visible' }));
  assert.match(await rajadamnern.getAttribute('class'), /is-active/);

  await clickGroupAndDay(page, '芭提雅', '09.28');
  await assert.doesNotReject(() => page.getByRole('heading', { name: 'Wong Amat Beach（COSI入口）', exact: true }).waitFor());
  assert.equal(await page.getByRole('heading', { name: 'Pattaya Beach', exact: true }).count(), 0);

  const pattayaMainSection = page.locator('.section-label', { hasText: '当天行程' }).locator('xpath=following-sibling::*[1]');
  const pattayaOptionalSection = page.locator('.section-label', { hasText: '备选' }).locator('xpath=following-sibling::*[1]');
  const mainNames = await pattayaMainSection.locator('.route-name').allInnerTexts();
  const optionalNames = await pattayaOptionalSection.locator('.route-name').allInnerTexts();
  assert.ok(mainNames.indexOf("Tiffany's Show Pattaya") > mainNames.indexOf('Wong Amat Beach（COSI入口）'));
  assert.deepEqual(optionalNames.slice(0, 2), ['Alcazar Show Pattaya', 'Terminal 21 Pattaya']);

  for (const [name, reserveUrl] of [
    ["Tiffany's Show Pattaya", 'https://www.tiffany-show.co.th/booking'],
    ['Alcazar Show Pattaya', 'https://www.alcazarthailand.com/']
  ]) {
    const showCard = page.locator('.route-item', { hasText: name });
    assert.equal(await showCard.getByRole('link', { name: '导航' }).count(), 1);
    assert.equal(await showCard.getByRole('link', { name: '预约' }).getAttribute('href'), reserveUrl);
  }

  await clickGroupAndDay(page, '芭提雅', '09.29');
  await assert.doesNotReject(() => page.getByRole('heading', { name: 'Wong Amat Beach（COSI入口）', exact: true }).waitFor());

  await clickGroupAndDay(page, '沙美岛', '09.30');
  await assert.doesNotReject(() => page.getByRole('heading', { name: 'Sai Kaew Beach（度假村入口）', exact: true }).waitFor());

  await clickGroupAndDay(page, '沙美岛', '10.02');
  await assert.doesNotReject(() => page.getByRole('heading', { name: '10月2日', exact: true }).waitFor());
  assert.match(await page.locator('.day-title-row p').innerText(), /报团游，细节待定/);
  assert.equal(await page.locator('.route-item').count(), 1, '10月2日只应显示住宿基地，不虚构团游地点');
  assert.equal(await page.getByRole('heading', { name: 'Ao Wong Duean', exact: true }).count(), 0);

  await clickGroupAndDay(page, '沙美岛', '10.03');
  for (const stop of ['Ao Wong Duean', 'Ao Thian', 'Ao Wai', 'Ao Prao']) {
    await assert.doesNotReject(() => page.getByRole('heading', { name: stop, exact: true }).waitFor());
  }
  assert.equal(await page.getByRole('heading', { name: 'Na Dan Pier', exact: true }).count(), 0);

  await page.getByRole('link', { name: '详情' }).click();
  await page.waitForURL('**/ing/honeymoon-with-liv/details/');
  await assert.doesNotReject(() => page.getByText('ICONSIAM + Rajadamnern', { exact: true }).waitFor());
  await assert.doesNotReject(() => page.getByText("Tiffany's 晚间主选", { exact: true }).waitFor());
  await assert.doesNotReject(() => page.getByText('10月2日报团游', { exact: true }).first().waitFor());
  await page.getByRole('link', { name: '看地图版' }).click();
  await page.waitForURL('**/ing/honeymoon-with-liv/');

  await context.close();
});

test('蜜月地图在375px下各改动日期均无横向溢出', async () => {
  const context = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await page.goto(`${baseUrl}/ing/honeymoon-with-liv/`, { waitUntil: 'domcontentloaded' });

  for (const [group, day] of [
    ['曼谷', '09.27'],
    ['芭提雅', '09.28'],
    ['芭提雅', '09.29'],
    ['沙美岛', '09.30'],
    ['沙美岛', '10.02'],
    ['沙美岛', '10.03']
  ]) {
    await clickGroupAndDay(page, group, day);
    await expectNoHorizontalOverflow(page);
  }

  await context.close();
});
