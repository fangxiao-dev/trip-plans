# 仓库约定

这是一个个人站点仓库:一个落地页 + 若干互相独立的模块。
蜜月旅行攻略是第一个模块,不是整个站点——不要把它的规则当作全站规则。

## 项目与发布

- 无框架静态站点;所有界面文案默认使用简体中文。
- 根路径 `/` 是个人主页落地页。不要为它加重定向。
- 现有公开路由:
  - `/` —— 落地页
  - `/ing/honeymoon-with-liv/` 与 `/ing/honeymoon-with-liv/details/` —— 蜜月模块
- 构建入口是 `node work/build-site.js`,输出目录是 `outputs/`。
  构建命令写在 `vercel.json` 的 `buildCommand`,不要改到 Vercel 后台去配。
- Vercel 项目使用 `Other` 框架预设,Output Directory 为 `outputs`。`main` 的推送触发 Production 部署。
- 除非用户明确要求,不要主动创建额外的 Vercel/CloudBase 部署。

## 目录约定

```
work/
  build-site.js            总构建入口,按顺序调用下面各个构建脚本
  homepage/                落地页(拥有 outputs/index.html)
    build-homepage.js
    site-data.json         模块与条目注册表
  modules/<name>/          各模块,自带构建脚本、数据和 AGENTS.md
outputs/                   构建产物,不要只改这里的 HTML
docs/                      设计文档与规格
```

- 每个能独立构建出一组页面的东西是一个 `work/modules/<name>/` 目录。
  落地页上的"分区"只是展示层分组,不构成目录层级。
- 落地页拥有 `outputs/index.html`;模块只写自己的路由目录,不要碰根产物。
- 模块专属的规则写在该模块自己的 `AGENTS.md` 里,不要堆进本文件。

### 新增一个模块

1. 建 `work/modules/<name>/`,放构建脚本与数据。
2. 在 `work/build-site.js` 的 `BUILDERS` 末尾登记它的构建脚本。
3. 在 `work/homepage/site-data.json` 对应分区的 `entries` 里加一条(`title` / `desc` / `href`)。
4. 若该模块有受保护行为或专属验证清单,补一份 `work/modules/<name>/AGENTS.md`。

## 落地页视觉约定

- 亮色大留白作中性容器,每个分区一个主色;子页面允许有自己的视觉风格,不强求全站统一。
- 分区主色定义在 `work/homepage/build-homepage.js` 的 `ACCENTS`,
  `site-data.json` 只引用色名。新增分区时在 `ACCENTS` 加一项。
- 派生色(空态文字、虚线边框、悬停阴影)在构建期算成 `rgba()` 输出。
  **不要改用 `color-mix()`** ——它在旧引擎里会让整条声明失效并回退到继承色,
  边框会和文字一起变成深墨色。
- 卡片正文与空态文案对所在底色的对比度不得低于 4.5:1。
  虚线边框是装饰可以淡,空态文案是内容必须可读,两者用不同强度。
- 首屏内容不得依赖 JavaScript 才可见。`.reveal` 只由脚本加给首屏之外的分区,
  并带兜底定时器;脚本不执行时页面应完整呈现。
- 图标用内联 SVG,不用 emoji。动画尊重 `prefers-reduced-motion`。

## 修改与验证

- 优先小范围、可读性优先的 CSS 修改,避免为一次性需求引入框架或复杂抽象。
- 发布前运行:
  - 所有改动过的构建脚本的 `node --check`
  - `node work/build-site.js`
  - `git diff --check`
- 只改落地页时,蜜月页的两个产物应当逐字节不变;若有变化说明动到了不该动的地方。
- 落地页改动至少验证:三个分区渲染、蜜月卡片跳转、375px 无横向溢出、键盘焦点可见。
- 若需要检查线上状态,验证 `/` 与两个蜜月路由均返回成功响应。

## Git 与本地环境

- 开始修改前检查 `git status --short`;工作区存在无关改动时,不要自动暂存、丢弃或覆盖。
- 提交时使用显式路径,不使用盲目的 `git add .`;生成页面与其源脚本应在同一主题提交中。
- `.vercel/`、`.env*`、浏览器 profile 和本地截图均为本地状态,禁止提交。
- Windows PowerShell 中优先用 `git grep -n -F` 搜索已跟踪文件;
  需要包含未跟踪文件时使用 `Get-ChildItem ... | Select-String -SimpleMatch`。不要默认调用 `rg.exe`。
