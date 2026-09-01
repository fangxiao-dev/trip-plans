# 独立旅行页面模板

1. 复制本目录，将副本改名为只含小写字母、数字和连字符的路由名，例如 `fuessen2609`。
2. 填写 `trip-data.json` 中所有 `__...__` 占位符；目录名必须与 `route` 中的 slug 一致。
3. 在 `work/build-site.js` 的 `BUILDERS` 末尾登记新目录里的 `build-trip.js`。
4. 在 `work/homepage/site-data.json` 的目标分区添加页面卡片。
5. 运行 `node --check work/modules/<slug>/build-trip.js` 和 `node work/build-site.js`。

字段提示：

- 住宿未定：保留 `base.placeholder: true`，页面显示占位但不绘制住宿标记。
- 住宿已定：改为 `false`，并填写真实名称和坐标。
- 底图选择：`basemap` 填 `osm` 使用默认 OpenStreetMap，填 `topo` 使用适合山地行程的 OpenTopoMap。
- 国外导航：填写地点的 `gmap`；未填写时沿用共享渲染器的高德导航。
- 长途起终点：显示地图标记但不参与本地地图缩放和连线时，设置 `fit: false`。
- 每个地点都必须至少有一条 `notices`。

本模板目录本身不登记到总构建入口，也不生成公开页面。
