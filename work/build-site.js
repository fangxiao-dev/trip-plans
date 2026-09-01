const path = require('path');
const { execFileSync } = require('child_process');

// 站点总构建入口。新增模块时在 BUILDERS 末尾追加它的构建脚本路径。
// 落地页放在最前面:它拥有 outputs/index.html,各模块只写自己的路由目录。
const BUILDERS = [
  path.join(__dirname, 'homepage', 'build-homepage.js'),
  path.join(__dirname, 'modules', 'honeymoon', 'build-trip-spa.js'),
  path.join(__dirname, 'modules', 'changsha2608', 'build-changsha2608.js'),
  path.join(__dirname, 'modules', 'fuessen2609', 'build-fuessen2609.js')
];

for (const builder of BUILDERS) {
  execFileSync(process.execPath, [builder], {
    cwd: path.resolve(__dirname, '..'),
    stdio: 'inherit'
  });
}

console.log('Site build complete.');
