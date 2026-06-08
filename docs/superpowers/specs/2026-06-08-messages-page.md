# 消息列表页设计

> 2026-06-08

## 目标

新增消息列表页 `/messages`，所有对话集中展示，导航栏「消息」常驻入口。

## 变更

| 文件 | 动作 |
|------|------|
| `src/pages/Messages.jsx` | 新建 |
| `src/App.jsx` | 加 ProtectedRoute 路由 |
| `src/components/Nav.jsx` | 「对话」→「消息」，始终显示 + badge，去 `/messages` |

## Messages 页面

- 搜索框（本地过滤姓名）
- 对话列表：头像 + 姓名 + 最后消息 + 时间
- 点击 → `/chat/:matchId`
- 空状态：引导去广场/匹配
- 加载态：try/catch/finally 保护

## 数据

复用 `getUserMatches()`，返回 `{ matchId, partner, lastMessage, lastTime }`。
