# 界面美化 - 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended). Each task MUST invoke `design-taste-frontend` skill for visual review before commit.

**Goal:** 全站提升视觉密度和层次感——纹理背景、Bento Grid、暖色点缀、插画装饰

**Architecture:** 增量美化——不改数据/路由/逻辑，只改 CSS 结构和页面 JSX。全局主题变量统一在 `index.css`，页面各自改布局和装饰

**Tech Stack:** React 19 + Tailwind v4 + CSS custom properties + SVG inline

**Design Doc:** `docs/superpowers/specs/2026-06-08-visual-polish-design.md`

**Required Skill:** `design-taste-frontend` — 每完成一个 task 后调用该 skill 审查视觉效果

---

## 文件变更总览

| 文件 | 改动类型 |
|------|---------|
| `src/index.css` | 全局主题升级 |
| `src/pages/Home.jsx` | 重构 Hero + Bento + 标签云 |
| `src/pages/Match.jsx` | 匹配小贴士侧栏 |
| `src/pages/Chat.jsx` | 双色气泡 + 状态标签 |
| `src/pages/Project.jsx` | 任务色带 + 间距 |
| `src/pages/Square.jsx` | 三列 Grid + sticky 筛选 |
| `src/pages/Login.jsx` | 背景装饰 |
| `src/pages/Register.jsx` | 背景装饰 + 步骤名 |

---

### Task 1: 全局主题升级 (`src/index.css`)

**File:** Modify `src/index.css`

- [ ] **Step 1: 更新阴影变量 + 新增暖色 accent**

将 `--shadow-card` 和 `--shadow-card-hover` 加深，并新增暖色变量。

```css
@theme {
  /* ---- Accent: Teal（保持不变）---- */
  --color-accent-50: #f0fdfa;
  ... （不变）

  /* ---- Warm Accent: Amber（新增）---- */
  --color-warm-50: #fff7ed;
  --color-warm-100: #ffedd5;
  --color-warm-200: #fed7aa;
  --color-warm-500: #f97316;
  --color-warm-600: #ea580c;

  /* ---- Fonts（不变）---- */
  ...

  /* ---- Shadows: 加深 ---- */
  --shadow-card: 0 2px 8px rgba(28, 25, 23, 0.06);
  --shadow-card-hover: 0 6px 24px rgba(28, 25, 23, 0.10);
  --shadow-match-card: 0 8px 32px rgba(28, 25, 23, 0.12);
}
```

Edit: Replace `--shadow-card` and `--shadow-card-hover` values.

- [ ] **Step 2: 添加背景纹理 + 顶部光晕**

在 `html` 样式后添加 `body::before` 伪元素实现微点阵纹理 + 顶部 Teal 渐变光晕。

```css
body {
  margin: 0;
  min-height: 100dvh;
  position: relative;
}

/* 顶部淡 Teal 渐变光晕 */
body::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  /* 顶部光晕 */
  background:
    radial-gradient(ellipse 80% 200px at 50% 0%, #f0fdfa 0%, transparent 100%),
    /* 微点阵纹理 */
    radial-gradient(circle, #d6d3d1 0.5px, transparent 0.5px);
  background-size: 100% 100%, 18px 18px;
  opacity: 0.5;
}
```

- [ ] **Step 3: 添加全局卡片 hover 上浮效果**

```css
/* 全局卡片 hover 微上浮 */
a[class*="rounded"]:hover,
div[class*="rounded"]:hover {
  /* 仅对可交互卡片生效，避免影响纯展示元素 */
}
```

Better approach: 在需要 hover 效果的卡片上统一加 `.card-hover` 工具类。

```css
.card-hover {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.card-hover:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-card-hover);
}
```

- [ ] **Step 4: 添加 section 分割线工具类**

```css
.section-divider {
  position: relative;
}
.section-divider::after {
  content: "";
  display: block;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, #e7e5e4 30%, #e7e5e4 70%, transparent 100%);
  margin-top: 4rem;
}
```

- [ ] **Step 5: 调用 `design-taste-frontend` skill 审查 + 构建验证**

Run: `cd c:/Users/25381/Desktop/校园智搭方案/campus-match && ./node_modules/.bin/vite build 2>&1`

Expected: `✓ built in X.XXs`

---

### Task 2: 首页重构 (`src/pages/Home.jsx`)

**File:** Modify `src/pages/Home.jsx`

- [ ] **Step 1: Hero 区 — 左侧加 SVG 插画 + 收紧间距**

在 Hero 标题上方加一个小型校园场景 SVG 插画（书本 + 抽象人形剪影），收紧垂直 padding。

```jsx
{/* Hero */}
<section className="max-w-[1280px] mx-auto px-6 pt-16 pb-8">
  <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 items-center">
    <div>
      {/* 小插画 */}
      <div className="mb-5">
        <svg width="56" height="40" viewBox="0 0 56 40" fill="none" className="opacity-80">
          <rect x="2" y="10" width="16" height="22" rx="3" fill="#ccfbf1" stroke="#0d9488" strokeWidth="1.2"/>
          <rect x="6" y="14" width="8" height="2" rx="1" fill="#0d9488" opacity="0.5"/>
          <rect x="6" y="18" width="8" height="2" rx="1" fill="#0d9488" opacity="0.3"/>
          <rect x="6" y="22" width="5" height="2" rx="1" fill="#0d9488" opacity="0.2"/>
          <circle cx="36" cy="18" r="10" fill="#ffedd5" stroke="#f97316" strokeWidth="1"/>
          <circle cx="34" cy="16" r="2" fill="#f97316"/>
          <circle cx="39" cy="16" r="2" fill="#f97316"/>
          <path d="M33 23 Q36 27 40 23" stroke="#f97316" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
        </svg>
      </div>
      <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#1c1917] leading-[1.08] tracking-tight">
        不止是搭子，<br/>更是你的<br/>学业成长合伙人
      </h1>
      ...（后续内容不变）
```

- [ ] **Step 2: 功能卡片 — Bento Grid 重构**

将 3 张等宽卡片改为 1 大 + 2 小的 Bento 布局。大卡片加 Teal 微渐变底色 + CTA 按钮，所有卡片加 `card-hover` class。

```jsx
{/* Feature Bento */}
<section className="max-w-[1280px] mx-auto px-6 py-16 section-divider">
  <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4">
    {/* 大卡片：智能匹配 */}
    <Link to="/register" className="card-hover group block rounded-2xl border border-accent-200 bg-gradient-to-br from-accent-50 to-white p-8 no-underline md:row-span-2 flex flex-col justify-between">
      <div>
        <div className="w-12 h-12 rounded-xl bg-accent-100 flex items-center justify-center text-accent-600">
          <Users size={26} weight="duotone" />
        </div>
        <h3 className="mt-5 font-display text-2xl font-bold text-[#1c1917]">智能匹配</h3>
        <p className="mt-2 text-base text-[#78716c] leading-relaxed">填标签 30 秒，算法推荐最合适的队友。技能交集 + 同学院 + 同目标，三重加权精准匹配</p>
      </div>
      <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white bg-accent-600 rounded-full px-5 py-2.5 group-hover:gap-3 transition-all w-fit">
        立即体验 <ArrowRight size={14} weight="bold" />
      </div>
    </Link>

    {/* 小卡片 1：即时通讯 */}
    <Link to="/match" className="card-hover group block rounded-2xl border border-[#e7e5e4] bg-white p-6 no-underline">
      <div className="w-10 h-10 rounded-xl bg-warm-100 flex items-center justify-center text-warm-500">
        <ChatCenteredDots size={22} weight="duotone" />
      </div>
      <h3 className="mt-4 font-display text-lg font-bold text-[#1c1917]">即时通讯</h3>
      <p className="mt-2 text-sm text-[#78716c] leading-relaxed">匹配成功自动建对话，无需加好友</p>
    </Link>

    {/* 小卡片 2：任务看板 */}
    <Link to="/match" className="card-hover group block rounded-2xl border border-[#e7e5e4] bg-white p-6 no-underline">
      <div className="w-10 h-10 rounded-xl bg-accent-100 flex items-center justify-center text-accent-600">
        <Kanban size={22} weight="duotone" />
      </div>
      <h3 className="mt-4 font-display text-lg font-bold text-[#1c1917]">任务看板</h3>
      <p className="mt-2 text-sm text-[#78716c] leading-relaxed">组队自动建项目，DDL 追踪不摆烂</p>
    </Link>
  </div>
</section>
```

注意：需要更新 `features` 数据或直接在 JSX 中内联渲染（删掉旧的 `features.map()`）。

- [ ] **Step 3: 新增技能标签云 Section**

在 Steps 和 Stats 之间插入热门技能标签云。

```jsx
{/* 热门技能标签云 */}
<section className="max-w-[1280px] mx-auto px-6 py-12 section-divider">
  <h2 className="font-display text-xl font-bold text-[#1c1917] text-center">平台热门技能</h2>
  <p className="mt-1 text-sm text-[#78716c] text-center">大家都在找这些技能的队友</p>
  <div className="mt-6 flex flex-wrap justify-center gap-3">
    {["Python", "数据分析", "Figma", "JavaScript", "Java", "PPT", "机器学习", "UI设计", "写作", "英语", "MySQL", "PS"].map((skill, i) => (
      <span
        key={skill}
        className={`px-4 py-2 text-sm font-medium rounded-full transition-all hover:scale-110 cursor-default ${
          i % 3 === 0
            ? "bg-warm-100 text-warm-600 text-base px-5 py-2.5"
            : i % 3 === 1
            ? "bg-accent-100 text-accent-700"
            : "bg-warm-100 text-warm-600"
        }`}
        style={{ fontSize: `${0.8 + Math.random() * 0.35}rem` }}
      >
        {skill}
      </span>
    ))}
  </div>
</section>
```

- [ ] **Step 4: CTA 区加纹理 overlay**

CTA section 背景改为 `bg-accent-600` + CSS 纹理叠加。

```jsx
<section className="max-w-[1280px] mx-auto px-6 pb-20">
  <div className="rounded-2xl relative overflow-hidden p-10 sm:p-14 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6" style={{ background: "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)" }}>
    {/* 纹理 overlay */}
    <div className="absolute inset-0 opacity-10" style={{
      backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
      backgroundSize: "20px 20px"
    }} />
    <div className="relative z-10">
      <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">准备好找到你的搭子了吗？</h2>
      <p className="mt-2 text-accent-100">免费使用，无需任何费用</p>
    </div>
    <Link to="/register" className="... relative z-10">30 秒开始 <ArrowRight size={18} weight="bold" /></Link>
  </div>
</section>
```

- [ ] **Step 5: 调用 `design-taste-frontend` skill 审查首页视觉效果**

- [ ] **Step 6: 构建验证**

Run: `cd c:/Users/25381/Desktop/校园智搭方案/campus-match && ./node_modules/.bin/vite build 2>&1`

---

### Task 3: 匹配页 — 匹配小贴士侧栏 (`src/pages/Match.jsx`)

**File:** Modify `src/pages/Match.jsx`

- [ ] **Step 1: 添加桌面端侧栏**

在卡片区左侧（`hidden lg:block`）加一个小贴士面板。面板内容：随机一句匹配建议 + 简单装饰。

```jsx
{/* 顶部区域：侧栏 + 卡片区 */}
<div className="flex gap-6">
  {/* 匹配小贴士侧栏（仅桌面端） */}
  <div className="hidden lg:block w-[200px] flex-shrink-0">
    <div className="sticky top-24 rounded-2xl border border-[#e7e5e4] bg-white p-5 shadow-[0_2px_8px_rgba(28,25,23,0.04)]">
      <div className="text-xs font-semibold text-[#78716c] uppercase tracking-wider mb-3">💡 匹配小贴士</div>
      <p className="text-sm text-[#1c1917] leading-relaxed">
        同学院同学的匹配度更高哦，不妨先多看看本院的小伙伴
      </p>
      <div className="mt-4 pt-4 border-t border-[#e7e5e4]">
        <div className="text-xs text-[#78716c]">
          已匹配 <span className="font-bold text-accent-600">{myMatches.length}</span> 位队友
        </div>
      </div>
    </div>
  </div>

  {/* 卡片主体区域（保持不变） */}
  <div className="flex-1 max-w-[480px] mx-auto">
    {/* 原有的 card area + buttons */}
    ...
  </div>
</div>
```

注意：需要调整页面布局结构。当前 Match 最外层是 `max-w-[480px] mx-auto`，需要改成 flex 容器。

- [ ] **Step 2: 调用 `design-taste-frontend` 审查侧栏视觉**

- [ ] **Step 3: 构建验证**

---

### Task 4: 对话页 — 双色气泡 + 状态标签 (`src/pages/Chat.jsx`)

**File:** Modify `src/pages/Chat.jsx`

- [ ] **Step 1: 对方消息双色气泡**

对方消息气泡（`sender === "other"`）根据消息序号交替使用 Teal 灰底和暖色底。

```jsx
{messages.map((m, idx) => {
  const isMe = m.sender === "me";
  // 对方消息每 3-4 条随机一条用暖色
  const otherBubbleClass = !isMe && (idx % 4 === 2)
    ? "bg-warm-50 text-[#1c1917] rounded-bl-md"
    : "bg-[#e7e5e4] text-[#1c1917] rounded-bl-md";

  return (
    <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
      <div className={`msg-enter max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
        isMe ? "bg-accent-600 text-white rounded-br-md" : otherBubbleClass
      }`}>
        {m.text}
        <div className={`text-[11px] mt-1 ${isMe ? "text-accent-200" : "text-[#a8a29e]"}`}>{m.time}</div>
      </div>
    </div>
  );
})}
```

- [ ] **Step 2: 顶部信息栏加在线状态 + 学院标签**

```jsx
<div className="flex items-center gap-3">
  <Link to="/match" className="text-[#78716c] hover:text-[#1c1917] transition-colors">
    <ArrowLeft size={22} />
  </Link>
  <div className="w-10 h-10 rounded-full bg-accent-100 flex items-center justify-center text-accent-700 font-bold relative">
    {partner.avatar}
    {/* 在线小绿点 */}
    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white" />
  </div>
  <div>
    <div className="font-semibold text-[#1c1917]">{partner.name}</div>
    <div className="flex items-center gap-2 text-xs text-[#78716c]">
      <span>在线</span>
      {partner.college && (
        <>
          <span className="text-[#d6d3d1]">·</span>
          <span className="bg-accent-100 text-accent-700 px-2 py-0.5 rounded-full text-[11px] font-medium">{partner.college}</span>
        </>
      )}
    </div>
  </div>
</div>
```

- [ ] **Step 3: 调用 `design-taste-frontend` 审查**

- [ ] **Step 4: 构建验证**

---

### Task 5: 看板页 — 任务色带 + 间距 (`src/pages/Project.jsx`)

**File:** Modify `src/pages/Project.jsx`

- [ ] **Step 1: 三列间距收紧**

将 Kanban 三列的外层 grid gap 从 `gap-6` 改为 `gap-4`。

```jsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
```

- [ ] **Step 2: 任务卡片左侧加状态色带**

在 `TaskCard` 组件中，给卡片左侧加 3px 色带。

```jsx
function TaskCard({ task, onDragStart }) {
  const isDone = task.status === "done";
  const statusColor = task.status === "done"
    ? "#0d9488"
    : task.status === "in_progress"
    ? "#f97316"
    : "#d6d3d1";

  return (
    <motion.div
      layout
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      className={`kanban-card rounded-xl border mb-3 bg-white transition-all hover:shadow-[0_2px_8px_rgba(28,25,23,0.06)] flex ${
        isDone ? "border-[#e7e5e4] opacity-70" : "border-[#e7e5e4]"
      }`}
    >
      {/* 状态色带 */}
      <div className="w-[3px] flex-shrink-0 rounded-l-xl" style={{ backgroundColor: statusColor }} />
      <div className="p-3.5 flex-1">
        <div className={`text-sm font-medium ${isDone ? "text-[#a8a29e] line-through" : "text-[#1c1917]"}`}>
          {task.title}
        </div>
        <div className="mt-2 flex items-center gap-3 text-xs text-[#78716c]">
          <span className="inline-flex items-center gap-1"><User size={12} />{task.assignee}</span>
          <span className="inline-flex items-center gap-1"><Calendar size={12} />{task.due}</span>
        </div>
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 3: 调用 `design-taste-frontend` 审查**

- [ ] **Step 4: 构建验证**

---

### Task 6: 招募广场 — 三列 Grid + Sticky 筛选 (`src/pages/Square.jsx`)

**File:** Modify `src/pages/Square.jsx`

- [ ] **Step 1: 筛选栏 sticky 定位 + pill 形状**

```jsx
{/* 筛选栏 sticky */}
<div className="sticky top-16 z-30 bg-[#fafaf9]/90 backdrop-blur-sm -mx-6 px-6 py-3 border-b border-[#e7e5e4]">
  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
    {/* College 筛选 */}
    <select className="... rounded-full px-4 py-2 text-sm">
      ...
    </select>
    {/* Skill 筛选 */}
    <select className="... rounded-full px-4 py-2 text-sm">
      ...
    </select>
    {/* 搜索 */}
    <div className="relative flex-1 min-w-[200px]">
      <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a8a29e]" />
      <input className="w-full pl-9 pr-4 py-2 rounded-full ..." />
    </div>
    {/* 发布按钮 */}
    <button className="... rounded-full">发布招募</button>
  </div>
</div>
```

- [ ] **Step 2: 卡片三列 Grid（桌面端）**

```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
```

- [ ] **Step 3: 帖子加状态图标**

```jsx
{/* 在招募卡片标题旁 */}
<div className="flex items-center gap-2">
  <h3 className="font-semibold text-[#1c1917]">{r.title}</h3>
  {r.urgent && <span className="text-sm">🔥</span>}
  {r.time === "刚刚" && <span className="text-xs bg-accent-100 text-accent-700 px-1.5 py-0.5 rounded">🆕</span>}
</div>
```

- [ ] **Step 4: 调用 `design-taste-frontend` 审查**

- [ ] **Step 5: 构建验证**

---

### Task 7: 登录/注册 — 背景装饰 + 步骤名 (`Login.jsx` / `Register.jsx`)

**Files:** Modify `src/pages/Login.jsx`, `src/pages/Register.jsx`

- [ ] **Step 1: Login — 表单左右加 CSS 几何装饰**

在 Login 的表单容器外层加装饰性背景：

```jsx
<div className="max-w-[480px] mx-auto px-6 py-16 relative">
  {/* 背景装饰 */}
  <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
    backgroundImage: "radial-gradient(circle, #0d9488 1px, transparent 1px)",
    backgroundSize: "24px 24px"
  }} />
  <div className="relative z-10">
    <h1 className="font-display text-2xl font-bold...">登录校园智搭</h1>
    ...（form 不变）
  </div>
</div>
```

- [ ] **Step 2: Register — 背景装饰 + 步骤名**

同样加背景装饰。另外在步骤进度条上方加步骤名称：

```jsx
{/* 步骤名 */}
<div className="text-center mb-6">
  <span className="text-sm font-medium text-accent-600">
    {!user && step === 0 && "创建账号"}
    {step === 1 && "选择技能"}
    {step === 2 && "确定目标"}
    {step === 3 && "学院年级"}
  </span>
</div>

{/* 进度条（不变） */}
<div className="flex items-center gap-2 mb-10">...</div>
```

- [ ] **Step 3: Login 种子用户提示美化**

将种子用户提示 card 改成更美观的样式：

```jsx
<div className="mt-8 p-5 rounded-2xl bg-gradient-to-br from-accent-50 to-warm-50 border border-accent-100">
  <p className="text-sm text-[#78716c] leading-relaxed">
    <span className="font-semibold text-accent-700">💡 快速体验</span><br/>
    用种子账号 <span className="font-mono text-accent-600 bg-white px-2 py-0.5 rounded border border-accent-200">zhang@campus.edu</span><br/>
    密码 <span className="font-mono text-accent-600">123456</span>
  </p>
</div>
```

- [ ] **Step 4: 调用 `design-taste-frontend` 审查两个页面**

- [ ] **Step 5: 构建验证**

---

### Task 8: 空状态与收尾

**Files:** 各处空状态渲染

- [ ] **Step 1: 空状态统一加小图标/插画**

在各页面空状态文字上方加 emoji 或简单 SVG icon（用 Phosphor 图标）：

| 页面 | 空状态 | 图标 |
|------|--------|------|
| Match「无候选人」 | `<Heart size={32} weight="fill" />` | 已有 ✅ |
| Chat「无消息」 | `<ChatCenteredDots size={28} />` | 已有提示文字 |
| Project「无任务」 | `<Kanban size={28} />` | 新增 |
| Square「无招募」 | `<MagnifyingGlass size={28} />` | 新增 |

各页面已有部分空状态处理，确认覆盖后无需大改。

- [ ] **Step 2: 全量构建 + `design-taste-frontend` 全局审查**

Run: `cd c:/Users/25381/Desktop/校园智搭方案/campus-match && ./node_modules/.bin/vite build 2>&1`

Expected: `✓ built in X.XXs`

- [ ] **Step 3: Commit + Push**

```bash
cd c:/Users/25381/Desktop/校园智搭方案/campus-match
git add -A
git commit -m "feat: visual polish — texture bg, bento grid, warm accents, illustrations

- Global: deeper shadows, body dot texture, teal gradient glow, warm amber accent
- Home: hero SVG illustration, bento card grid, skill tag cloud, CTA texture
- Match: matching tips sidebar (desktop)
- Chat: dual-color bubbles, online indicator, college chip
- Project: kanban column tighter, task status color bands
- Square: 3-column grid, sticky filter bar, status icons
- Login/Register: CSS geometry decoration, step names"
git push origin main
```

---

### Task 9: 设计验证

- [ ] **Step 1: 启动 dev server 肉眼检查**

Run: `cd c:/Users/25381/Desktop/校园智搭方案/campus-match && npm run dev`

打开 http://localhost:5173，检查所有 7 个页面。

- [ ] **Step 2: 对照设计文档逐项检查**

| 检查项 | 查看页面 |
|--------|---------|
| 背景纹理 + 光晕 | 任一页面 |
| 卡片阴影 + hover | 首页 / 匹配 |
| 暖色标签 | 首页标签云 / 聊天气泡 |
| Hero 插画 | 首页 |
| Bento Grid | 首页 |
| 小贴士侧栏 | 匹配（桌面端） |
| 双色气泡 | 聊天 |
| 任务色带 | 看板 |
| 三列 + sticky | 广场 |
| 背景装饰 | 登录 / 注册 |
