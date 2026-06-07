# 校园智搭 - 界面美化设计文档

> 2026-06-08 | 状态：设计完成，待实施

## 目标

全站提升视觉密度和层次感，解决「太空」问题。方向：**A（纹理层次）+ C（内容密度）**。

---

## 一、全局主题升级（影响所有页面）

### 1.1 背景纹理

`body` 背景从纯色 `#fafaf9` 升级为：

- 底层：保持 `#fafaf9`
- 叠加：CSS 微点阵纹理（`repeating-linear-gradient` 或 `radial-gradient` 实现透明网点）
- 页面顶部：淡 Teal 渐变光晕 `linear-gradient(180deg, #f0fdfa 0%, transparent 300px)`

### 1.2 卡片阴影

在 `index.css` 中更新阴影变量：

| 状态 | 旧值 | 新值 |
|------|------|------|
| `--shadow-card` | `0 1px 3px rgba(28,25,23,0.06)` | `0 2px 8px rgba(28,25,23,0.06)` |
| `--shadow-card-hover` | `0 4px 16px rgba(28,25,23,0.08)` | `0 6px 24px rgba(28,25,23,0.10)` |

全局卡片 hover 加 `translateY(-2px)` 过渡。

### 1.3 暖色点缀

新增一组琥珀/珊瑚色 accent，用于标签、badge、匹配度等：

```css
--color-warm-50: #fff7ed;
--color-warm-100: #ffedd5;
--color-warm-500: #f97316;
--color-warm-600: #ea580c;
```

**使用场景**：技能标签、匹配度数字、紧急标记、「热门」badge。

### 1.4 区块分割线

每个 `<section>` 之间加细微渐变分隔——用淡色渐变线或装饰元素，替代纯空白间隔。

---

## 二、首页（Home.jsx）

### 2.1 Hero 区

- 左侧文字区上方加小型 **SVG/CSS 插画**（简约校园场景：书本剪影 + 抽象人物轮廓），放置于标题左上角
- Hero 卡片右侧增加淡色装饰圆环光晕背景
- `py-20` → `py-12`（稍收紧垂直空间）

### 2.2 Bento Grid 功能卡片

`feature` 区域从等宽网格改为 **不对称 Bento 布局**：

```
┌──────────────┬──────┐
│ 智能匹配      │ 即时通讯│
│ (大卡片 2倍高) │      │
│ + CTA 按钮   ├──────┤
│              │ 任务看板│
└──────────────┴──────┘
```

- 大卡片加 Teal 微渐变底色（`bg-accent-50/50`）
- 所有卡片 hover → `shadow-card-hover` + `translateY(-2px)`

### 2.3 热门技能标签云

在 Steps 和 Stats 之间新增 **技能标签云** section：

```html
<h2>平台热门技能</h2>
<div> 一排随机标签（Python、数据分析、Figma、JavaScript…）</div>
```

标签样式：暖色 accent 底 + 轻微随机大小变化、hover 缩放。

### 2.4 CTA 区

保持结构，背景从纯色 `bg-accent-600` 改为带 CSS pattern overlay 的 Teal 区（半透明网点叠加）。

---

## 三、匹配页（Match.jsx）

- 卡片左侧（桌面端 `hidden lg:block`）加「匹配小贴士」侧栏面板——静态文案轮播如 "同学院匹配度更高哦"
- 背景卡片内容已在上一轮修复（显示头像 + 名字 + 技能），本次保留

---

## 四、对话页（Chat.jsx）

- 对方消息气泡**双色交替**：默认 Teal 系 `bg-[#e7e5e4]`，每 3-5 条随机出现一条浅琥珀气泡 `bg-warm-100`
- 顶部信息栏加：对方在线状态小绿点 + 学院标签 chip

---

## 五、项目看板页（Project.jsx）

- 三列间距从 `gap-6` → `gap-4`（稍紧凑）
- 每张任务卡片**左侧加 3px 色带**：`todo`=灰 `#d6d3d1`、`in_progress`=琥珀 `#f97316`、`done`=Teal `#0d9488`

---

## 六、招募广场（Square.jsx）

- 桌面端卡片从双列 → **三列** grid
- 紧急帖加 🔥 icon / 新帖加 🆕 icon
- 筛选栏加 sticky 定位 + pill 形状

---

## 七、登录/注册（Login.jsx / Register.jsx）

- 表单区域左右加微妙的 CSS 几何装饰（`radial-gradient` 圆点背景）
- Register 步骤进度条上方加步骤名文字：`1·账号 → 2·技能 → 3·目标 → 4·学院`

---

## 八、空状态插图

各页面空状态（无候选、无匹配、无消息、无招募）用 **CSS/SVG 小插画**替代纯文字——校园场景简约插画风格（与 Hero 小插图一致）。

---

## 变更文件清单

| 文件 | 改动范围 |
|------|---------|
| `src/index.css` | 全局主题变量、背景纹理、阴影、暖色 accent、section 分割线 |
| `src/pages/Home.jsx` | Hero 插图、Bento Grid 重构、技能标签云、CTA 纹理 |
| `src/pages/Match.jsx` | 匹配小贴士侧栏 |
| `src/pages/Chat.jsx` | 消息气泡双色、在线状态 + 学院标签 |
| `src/pages/Project.jsx` | 列间距收紧、任务卡片色带 |
| `src/pages/Square.jsx` | 三列 grid、sticky 筛选、帖子状态 icon |
| `src/pages/Login.jsx` | 背景装饰 + 种子用户提示样化 |
| `src/pages/Register.jsx` | 背景装饰、步骤名文字 |
