# Füssen 2609 模块约定

- 本模块只拥有 `/ing/fuessen2609/` 与 `outputs/ing/fuessen2609/index.html`。
- 住宿已确认为 `my Hostel Füssen`；使用真实地址与坐标绘制住宿标记，但不展示预算、候选或预订按钮。
- `trip-data.json` 只记录本次 2026 年 9 月 8—10 日行程，不写入旅行人格记忆。
- 日期敏感的铁路、公交、天气与缆车状态只写复核提醒，不承诺实时状态。
- 复用 `work/shared/trip-map/render-trip-map.js`，不要复制或单独分叉地图模板。
- 修改本模块时，蜜月源码、两个蜜月 HTML 产物和长沙行程数据必须保持不变。
