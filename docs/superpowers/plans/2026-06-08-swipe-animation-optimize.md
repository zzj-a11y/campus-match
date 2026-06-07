# 卡片滑动动画优化 - 实施计划

> Single-file: Match.jsx only. 4 changes.

**Goal:** 每次滑动从 5-6 次 React 渲染降到 1 次

**Architecture:** exitX/exitDir 从 useState 迁移到 useMotionValue，退出动画命令式执行，React 只在卡片切换时介入

---

### Task 1: Match.jsx 动画层迁移

**File:** Modify `src/pages/Match.jsx`

- [ ] **Step 1: 替换 useState → useMotionValue**

删除 `useState` 的 exitX, exitDir，新增 motion values:
```js
const [matchResult, setMatchResult] = useState(null);
const [showMatchPopup, setShowMatchPopup] = useState(false);
const [myMatches, setMyMatches] = useState([]);
// ↓ 删除这两行
// const [exitX, setExitX] = useState(0);
// const [exitDir, setExitDir] = useState(null);
// ↓ 新增 motion values
const exitX = useMotionValue(0);
const exitRotate = useMotionValue(0);
```

- [ ] **Step 2: 重写 handleSwipe — 命令式飞出 + 延迟卡片切换**

```js
const handleSwipe = async (direction) => {
  if (!current || showMatchPopup) return;

  // 命令式飞出动画（零 React 渲染）
  const targetX = direction === "right" ? 400 : -400;
  exitX.set(targetX);
  exitRotate.set(direction === "right" ? 15 : -15);
  
  // 数据操作并行
  if (direction === "right") {
    const result = await swipeRight(current.id);
    if (result && result.targetUser) {
      setMatchResult(result);
      setTimeout(() => setShowMatchPopup(true), 350);
    }
  } else {
    await swipeLeft(current.id);
  }

  // 飞出完成后切换卡片（唯一一次 setState）
  setTimeout(() => {
    setIndex((i) => i + 1);
    exitX.set(0);
    exitRotate.set(0);
    dragX.set(0);
  }, 250);
};
```

- [ ] **Step 3: 卡片加 will-change**

在 motion.div 的 className 加：
```jsx
className="absolute inset-0 will-change-transform"
```

- [ ] **Step 4: 修正 exit 动画 — 引用 motion values**

```jsx
exit={{
  x: exitX,
  opacity: 0,
  rotate: exitRotate,
  transition: { duration: 0.2, ease: "easeOut" },
}}
```

- [ ] **Step 5: 键盘 handler 用 ref 防抖**

```js
const handleSwipeRef = useRef(handleSwipe);
handleSwipeRef.current = handleSwipe;

useEffect(() => {
  const onKey = (e) => {
    if (showMatchPopup || loading) return;
    if (e.key === "ArrowLeft") handleSwipeRef.current("left");
    if (e.key === "ArrowRight") handleSwipeRef.current("right");
  };
  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}, [showMatchPopup, loading]); // 不再依赖 index
```

- [ ] **Step 6: 构建 + 提交**

```bash
npm run build && git add -A && git commit -m "perf: swipe animation — motion values replace React state, 5-6 renders → 1" && git push origin main
```
