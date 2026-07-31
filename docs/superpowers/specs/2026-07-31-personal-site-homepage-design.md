# 个人主页改造设计

日期:2026-07-31

## 背景

当前仓库是一个无框架静态站点,只承载一个内容:泰国蜜月行程攻略(地图页 + 住宿详情页)。
根路径 `/` 通过 `vercel.json` 的 308 永久重定向指向蜜月地图页,`AGENTS.md` 也完全围绕蜜月模块书写。

目标是把仓库升级为**个人工具站**:一个自用的站点,进入后是一个视觉完整的落地页,向下滚动展示三个模块。
蜜月攻略从"站点的全部"降级为"情侣模块下的第一个条目"。

三个模块:

1. **我和 Liv** —— 旅行、日常之类的内容
2. **小工具** —— 自己写的小工具,写完挂上来自用
3. **博客** —— 自己写的文字

## 本次范围

**做**:落地页 + 结构改造。

- 漂亮的 `/` 落地页(Hero + 下滑三个模块分区)
- 情侣区放蜜月攻略卡片,指向现有页面
- 工具区、博客区渲染空态占位
- `work/` 目录重构为 homepage + modules 结构
- 新增总构建入口 `work/build-site.js`
- `AGENTS.md` 拆分为根通用约定 + 模块专属约定
- `vercel.json` 去掉根重定向

**不做**(留待后续各自单独一轮):

- 具体小工具的实现
- 博客正文与 Markdown 渲染管道
- `/tools/`、`/blog/` 这两个模块首页(本次它们只是落地页上的空态分区,没有实际路由)

## 路由

保留 `/ing/` 前缀作为已有内容区,蜜月页路径**原封不动**,新模块以后平行开顶层前缀。
这样零重定向,不引入任何旧链接失效风险。

```
/                                   落地页(本次新建)
/ing/honeymoon-with-liv/            蜜月地图页(不变)
/ing/honeymoon-with-liv/details/    住宿详情页(不变)
/tools/                             小工具(未来)
/blog/                              博客(未来)
```

## 目录与构建结构

```
work/
  build-site.js                    # 新增:总构建入口
  homepage/
    build-homepage.js              # 新增:生成 outputs/index.html
    site-data.json                 # 新增:模块与条目注册表
  modules/
    honeymoon/
      AGENTS.md                    # 新增:蜜月模块专属约定
      build-trip-spa.js            # 从 work/ 迁入
      legacy/
        build-trip-map.js          # 从 work/legacy/ 迁入
        build-unified-board.js     # 从 work/legacy/ 迁入
      trip-data.json               # 从 work/ 迁入
      fetch-booking-images.js      # 从 work/ 迁入
      research-log.md              # 从 work/ 迁入
      source-itinerary.png         # 从 work/ 迁入
      trip-map-coordinate-audit.json
docs/
  thailand-honeymoon-workspace-design.md   # 从 outputs/ 迁出(它是文档,不是构建产物)
```

`outputs/` 的产物结构不变,只是 `outputs/index.html` 从重定向桩页变成真实落地页。

### 设计理由

**为什么 `modules/honeymoon/` 是平的,而不是 `modules/us/honeymoon/`。**
路由方案里蜜月页保持在 `/ing/honeymoon-with-liv/`,没有嵌套在情侣模块命名空间下。
目录跟着路由走保持一致:每个能独立构建出一组页面的东西是一个 module 目录,
而落地页上的"三个分区"只是展示层的分组,不是目录层级。以后加工具就是 `work/modules/<tool>/`。

**为什么用 `site-data.json` 而不是手写 HTML。**
仓库已经有 `trip-data.json` 这个"数据 + 生成脚本"的模式,落地页沿用它。
以后加一个工具或一篇博客,改 JSON 加一条即可,不用动模板。

### 迁移坑

`work/legacy/build-trip-map.js` 里 `root = path.resolve(__dirname, '..', '..')`,
并据此引用 `.agents/skills/trip-map-builder/assets/template.html`。
目录下沉一层后相对层数必须改成 `'..', '..', '..'`,否则模板路径解析错误。
`build-unified-board.js` 同理需要核对。

`.agents/` 是 skill 目录,本次不动。

## 落地页规格

视觉方案:**亮色留白 + 彩色分区**(三版 Hero 对比后选定)。
白底大留白作为中性容器,三个模块各自一个主色。
选它的理由:三个模块调性差得很远(情侣旅行 / 开发工具 / 博客文字),
中性底子 + 分区主色比强行统一成一种风格更能包住风格差异很大的子页面;
以后加新模块只要给一个新主色,不用重新设计。

单页纵向滚动,一个 HTML 文件,无框架、无 JS 依赖(纯 CSS,滚动不需要脚本)。

```
Hero          三色小方块 + 大标题(局部高亮衬底)+ 一句话副标题
─ 分区 1      ● 粉  我和 Liv     → 蜜月攻略卡片(唯一实条目)+ 一张空态卡
─ 分区 2      ● 蓝  小工具        → 空态:"还没有工具,敬请期待"
─ 分区 3      ● 绿  博客          → 空态:"还没有文章"
```

### 分区配色

| 分区 | 圆点 | 卡片底 | 卡片文字 |
|---|---|---|---|
| 我和 Liv | `#f2789f` | `#fff0f4` | `#8a2846` |
| 小工具 | `#4a7dd6` | `#eef4ff` | `#1f3f80` |
| 博客 | `#4d9b6a` | `#eef7f0` | `#1f5334` |

### 文案

- Hero 大标题:我的**自留地**。旅行、工具、和想法。(「自留地」带粉色高亮衬底)
- 副标题:一个自己用的小站 —— 想到什么就做点什么挂上来。
- 情侣分区标题:我和 Liv

### 交互与适配

- **空态**不是失败状态,是"位置已经留好了"。虚线描边 + 当前分区主色降透明度,
  和实条目视觉同族,不用灰色死板占位。
- 卡片 `minmax(300px, 1fr)` 自动换列。
- 移动端 Hero 字号从 66px 降到约 40px,内边距从 56px 降到 24px。

### 数据契约

`work/homepage/site-data.json`:

```json
{
  "profile": {
    "name": "Xiao",
    "tagline": "我的自留地。旅行、工具、和想法。",
    "intro": "一个自己用的小站 —— 想到什么就做点什么挂上来。"
  },
  "sections": [
    {
      "id": "us",
      "title": "我和 Liv",
      "accent": "pink",
      "entries": [
        {
          "title": "泰国蜜月行程地图",
          "desc": "曼谷 / 芭提雅 / 沙美岛,12 天逐日地图与住宿详情。",
          "href": "/ing/honeymoon-with-liv/"
        }
      ]
    },
    {
      "id": "tools",
      "title": "小工具",
      "accent": "blue",
      "entries": [],
      "emptyText": "还没有工具,敬请期待"
    },
    {
      "id": "blog",
      "title": "博客",
      "accent": "green",
      "entries": [],
      "emptyText": "还没有文章"
    }
  ]
}
```

`entries` 为空则自动渲染空态卡,非空则渲染条目卡——模板里不需要写分支判断。

`profile.name` 不在 Hero 里直接显示(方案 C 的 Hero 只有大标题和副标题),
它用于页面 `<title>` 和 `<meta name="author">`。

## AGENTS.md 拆分

### 根 `AGENTS.md`

重写为面向整个个人站的通用约定,四节:

- **项目与发布**:无框架静态站;界面文案简体中文;`/` 是落地页;
  构建入口 `node work/build-site.js`,输出 `outputs/`;`main` 推送触发 Vercel Production。
- **目录约定**:`work/homepage/` 是落地页,`work/modules/<name>/` 是各模块;
  新增模块的步骤(建目录 → 写构建脚本 → 在 `build-site.js` 注册 →
  在 `site-data.json` 加条目 → 按需写模块 AGENTS.md)。
- **视觉基调**:落地页三色分区规则;子页面允许有自己的风格,不强求统一。
- **Git 与本地环境**:原文照搬(显式路径提交、`.vercel`/`.env*`/浏览器 profile 不提交、
  Windows 下用 `git grep -n -F`)。

### `work/modules/honeymoon/AGENTS.md`

承接原文里蜜月专属的内容:

- 构建与文件职责(改哪些源脚本、构建后提交哪些产物)
- 受保护行为(城市导航、日期切换、卡片到地图标记联动、地图/详情互链、
  住宿图片轮播、外部预订/导航链接)
- 地图页与详情页各自的验证清单
- `honeymoon-with-live`(多一个 `e`)拼写禁令
- `trip-map-coordinate-audit.json` 的 `generated_at` 若为唯一变化则不入提交

### 顺带修正两处与代码不符的表述

- 「保持现有的旅行杂志视觉风格」→ 实际是 Apple HIG 风
  (系统字体、浅灰分组底 `#f2f2f7`、毛玻璃、强调色 `#0071e3`),按实际改写。
- 构建产物清单要说明 `outputs/index.html` 现在是真实落地页,不再是重定向桩页。

## 发布配置

`vercel.json` 去掉根重定向,并把构建命令收进版本控制:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "node work/build-site.js"
}
```

把 `buildCommand` 写进 `vercel.json` 而非留在 Vercel 后台,省掉一次手工改配置,
也让构建入口的变更跟着代码走。Output Directory 仍是 `outputs`,后台设置不变。

## 验证

1. `node --check` 过所有构建脚本
2. `node work/build-site.js` 成功,产出 `outputs/index.html` + 两个蜜月页
3. **蜜月页两个路由的产物 diff 为空**
4. 本地起静态服务器,验证落地页三个分区渲染正常、蜜月卡片跳转正确、
   移动端宽度不横向溢出
5. `git diff --check`

第 3 条是这次改造最关键的安全网:目录搬家 + 构建入口重写之后,
蜜月页的 HTML 应该一个字节都不变。如果变了,说明迁移过程中动到了不该动的东西。

### 缓存陷阱

`/` 当前是 **308 永久重定向**,浏览器会长期缓存。
改完之后本机访问 `/` 可能仍直接跳转到蜜月页——需要清缓存或用无痕窗口验证。
这不是构建出错。
