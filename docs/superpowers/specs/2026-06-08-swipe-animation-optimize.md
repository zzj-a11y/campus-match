# 匹配卡片滑动动画优化

> 2026-06-08 | 仅改 Match.jsx 一个文件

## 问题

每张卡片滑动触发 5-6 次 React 重渲染（setExitDir → setExitX → setIndex → setExitX(0) → setExitDir(null)），导致掉帧。

## 方案 B：动画层迁移

### 核心变化

| 项目 | 旧 | 新 |
|------|----|----|
| exitX | `useState(0)` | `useMotionValue(0)` |
| exitDir | `useState(null)` | `useMotionValue("")` |
| exitRotate | 无 | `useMotionValue(0)` |
| 退出动画 | `exit={{ x: exitX }}` | `handleSwipe` 中 `animate(dragX, ±400)` 命令式 |
| index 切换时机 | 300ms setTimeout | 退出动画完成后 250ms |
| 硬件加速 | 无 | `will-change: transform` |

### 4 个具体改动

1. exitX/exitDir 从 useState → useMotionValue，动画过程中零 React 渲染
2. 退出动画改为命令式 `animate()`，Motion 内部完成全部飞出
3. 背景卡片延迟交换：飞出完成 → setIndex → 新卡入场
4. 卡片加 `will-change: transform` 提 GPU 合成层

### 改后 swipe 流程

```
handleSwipe("right")
  → dragX.set(400) via animate （Motion 内部，零 React 渲染）
  → 250ms 飞完
  → setIndex(i+1) （唯一一次 setState）
  → dragX.set(0), exitX.set(0)
  → AnimatePresence 处理新卡入场
```

### 不改

- useMotionValue + useTransform 链
- AnimatePresence 入场
- 背景卡片结构
- 匹配弹窗
- 按钮 UI
