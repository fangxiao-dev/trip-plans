const fs = require('fs');
const path = require('path');

// 3D 小屋生日礼物:把已导出的静态小文件原样复制到路由目录。
// .pck 与 .wasm 不在仓库里,由 site/index.html 里的脚本从 assets.shaw-is.com(R2)读取。
const root = path.resolve(__dirname, '..', '..', '..');
const sourceDir = path.join(__dirname, 'site');
const outputDir = path.join(root, 'outputs', 'ing', 'for-livs-birthday-and-our-anniversary');

fs.mkdirSync(outputDir, { recursive: true });
for (const name of fs.readdirSync(sourceDir)) {
  fs.copyFileSync(path.join(sourceDir, name), path.join(outputDir, name));
}

// 私人内容:不让搜索引擎收录。
const indexPath = path.join(outputDir, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');
if (!/name="robots"/i.test(html)) {
  html = html.replace(/<head>/i, '<head>\n\t\t<meta name="robots" content="noindex, nofollow">');
  fs.writeFileSync(indexPath, html, 'utf8');
}

console.log(`Wrote for-livs-birthday-and-our-anniversary to ${outputDir}`);
