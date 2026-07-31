# 蜜月模块约定

本文件只覆盖 `work/modules/honeymoon/` 与它产出的两个路由。
全站通用规则见仓库根目录的 `AGENTS.md`。

## 路由与产物

- 地图页 `/ing/honeymoon-with-liv/`,住宿详情页 `/ing/honeymoon-with-liv/details/`。
- 构建后的产物:
  - `outputs/ing/honeymoon-with-liv/index.html`
  - `outputs/ing/honeymoon-with-liv/details/index.html`
- 本模块**不拥有** `outputs/index.html`。那是落地页的产物,不要在这里写它。
- 不要重新引入 `honeymoon-with-live`(多一个 `e`)的公开路径,
  也不要为它保留兼容页面,除非用户明确要求。

## 构建与文件职责

- 编辑页面时,优先修改 `legacy/build-trip-map.js`、`legacy/build-unified-board.js`
  或 `build-trip-spa.js`;`outputs/` 是生成产物,不要只修改其中的 HTML。
- 地图页模板在 `.agents/skills/trip-map-builder/assets/template.html`,
  由 `legacy/build-trip-map.js` 以仓库根为基准引用。
  移动本模块目录层级时必须同步核对脚本里的 `root` / `moduleDir` 计算。
- 每次影响页面、路由或资源路径的修改后,运行 `node work/build-site.js`,并提交相关的生成产物。
- 页面间链接使用以 `/ing/honeymoon-with-liv/` 开头的绝对路径,
  避免 URL 缺少尾部 `/` 时被错误解析。
- 静态图片引用使用 `/assets/...`,不要使用相对 `outputs/assets/...` 路径。
- 构建会刷新 `trip-map-coordinate-audit.json` 的 `generated_at`;
  若只有这个时间戳变化,不要把它纳入提交。

## 视觉基调

页面是 Apple HIG 风格:系统字体栈、浅灰分组底(`#f2f2f7`)、毛玻璃、强调色 `#0071e3`。
保持这一套语言;优先小范围、可读性优先的 CSS 修改。

## 受保护行为

以下行为是这两个页面的核心功能,修改时不得破坏:

- 城市导航与日期切换
- 卡片到地图标记的联动
- 地图页与详情页的互链
- 住宿图片轮播
- 外部预订链接与导航链接

## 验证清单

- 改地图页后至少验证:城市选项、日期切换、任意卡片的"导航"弹层,以及详情链接。
- 改详情页后至少验证:地图返回链接、图片轮播、评分/取消信息布局和外部预订链接。
- 发布前运行 `node --check` 覆盖本模块所有改动过的脚本,再运行 `node work/build-site.js`。
- 未改本模块却发现这两个产物有 diff,说明改动越界了,先查原因再提交。
