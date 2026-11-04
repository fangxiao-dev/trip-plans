# 生日礼物(3D 小屋)模块约定

- 本模块只拥有 `/ing/for-livs-birthday-and-our-anniversary/` 与 `outputs/ing/for-livs-birthday-and-our-anniversary/`。
- 内容是私人礼物:不要在 `work/homepage/site-data.json` 加首页卡片,不要加入 sitemap,页面保持 `noindex`。
- `site/` 是 3D 小屋项目 `scripts/Package-Web.ps1 -AssetBase ...` 的输出(小文件);`site/index.html` 里的脚本把 `.pck` / `.wasm` 请求改到 `https://assets.shaw-is.com/<随机前缀>/`(Cloudflare R2 桶 `shaw-is-3dhome`)。
- 更新游戏版本时:在 3d-home 重新导出并打包,上传新的 `.pck`/`.wasm` 到 R2 新前缀(旧前缀可留着直到确认),再用新输出替换 `site/`,不要手改 `site/index.html` 里的地址。
- R2 跨域只允许 shaw-is.com;不要把 R2 地址写进任何公开页面。
- 修改本模块时,其他模块的源码和 HTML 产物必须保持不变。
