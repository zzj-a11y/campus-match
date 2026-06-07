# 校园智搭 - Supabase 迁移设计文档

> 2026-06-08 | 状态：设计完成，待实施

## 目标

将数据层从 localStorage 迁移到 Supabase，实现真正的多用户数据互通。保持所有页面和组件零改动或仅改 import 路径。

---

## 一、架构变更

```
迁移前：页面组件 → mockStore.js → localStorage
                     AuthContext.jsx ↗

迁移后：页面组件 → dataStore.js → Supabase (Postgres)
                     AuthContext.jsx → Supabase Auth
```

**Supabase 项目信息**：
- URL：`https://afzcyggwduqzggujhcjr.supabase.co`
- Region：默认（创建时选定）

---

## 二、文件变更清单

| 文件 | 动作 | 说明 |
|------|------|------|
| `.env` | **新增** | `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` |
| `src/lib/supabase.js` | **重写** | `createClient(url, anonKey)` 真实客户端 |
| `src/lib/mockStore.js` | **重命名为** `src/lib/dataStore.js` | 函数签名不变，localStorage → Supabase 查询 |
| `src/context/AuthContext.jsx` | **重写** | Supabase Auth 替换 signUpLocal/signInLocal |
| `src/pages/Chat.jsx` | **小改** | subscribeMessages 改为 Supabase Realtime |
| `src/pages/Login.jsx` | **import 路径** | `mockStore` → `dataStore` |
| `src/pages/Register.jsx` | **import 路径** | `mockStore` → `dataStore` |
| `src/pages/Match.jsx` | **import 路径** | `mockStore` → `dataStore` |
| `src/pages/Project.jsx` | **import 路径** | `mockStore` → `dataStore` |
| `src/pages/Square.jsx` | **import 路径** | `mockStore` → `dataStore` |
| `sql/` | **在 Supabase SQL Editor 中执行** | 3 个 SQL 文件 |

**不变的文件**：路由、组件、样式、ProtectedRoute —— 全部零改动。

---

## 三、数据库设计

### 3.1 表结构（已在 sql/ 中定义）

```
auth.users (Supabase 内置)
  └── profiles (1:1)
       ├── name, college, grade, skills[], goal
       └── RLS: 每人读写自己的档案

matches
  ├── user_a, user_b → auth.users
  ├── status: 'pending' | 'matched'
  └── RLS: 双方可见

messages
  ├── match_id → matches
  ├── sender_id → auth.users
  ├── content
  └── RLS: 匹配双方可读写
  └── Realtime: ALTER PUBLICATION supabase_realtime ADD TABLE messages;

projects
  ├── name, created_by → auth.users
  ├── match_id → matches
  └── RLS: 项目成员可读

project_members
  ├── project_id, user_id
  └── UNIQUE(project_id, user_id)

tasks
  ├── project_id → projects
  ├── title, status ('todo' | 'in_progress' | 'done')
  ├── assignee, due_date
  └── RLS: 项目成员可操作

recruitments
  ├── title, skills[], college
  ├── author_id → auth.users
  └── RLS: 全员可读，认证用户可发布，作者可删
```

### 3.2 种子数据（8 人）

执行 `sql/03_seed_users.sql`，8 个预设用户写入 `auth.users` + `profiles`，密码统一 `123456`：

张同学、李同学、王同学、赵同学、刘同学、陈同学、周同学、吴同学

---

## 四、认证流程

### 4.1 注册（Register 页，4 步向导不变）

1. 用户填写姓名 + 邮箱 + 密码
2. `supabase.auth.signUp({ email, password })` → 自动登录
3. `profiles` INSERT `{ user_id, name }`
4. 返回向导第 2/3/4 步（选技能、目标、学院）
5. `registerUser()` → `profiles` UPDATE `{ skills, goal, college, grade }`

### 4.2 登录（Login 页）

1. `supabase.auth.signInWithPassword({ email, password })`
2. 从 `profiles` 查询 `{ skills, college, goal }`
3. 有资料 → 跳 `/match`；无资料 → 跳 `/register`

### 4.3 登录态保持

1. App 启动 → `supabase.auth.getSession()` 恢复 JWT
2. 有 session → 查 profiles 补全 user 对象 → AuthContext
3. 无 session → 显示首页

### 4.4 AuthContext 对外接口不变

```js
{ user, session, loading, signUp, signIn, signOut }
```

---

## 五、实时聊天

### 5.1 发送消息

`sendMessage()` → `supabase.from('messages').insert({ match_id, sender_id, content })`

### 5.2 接收消息

`subscribeMessages()` → Supabase Realtime channel：

```js
supabase.channel('messages:' + matchId)
  .on('INSERT', { event: '*', schema: 'public', table: 'messages' },
    (payload) => {
      if (payload.new.sender_id !== currentUserId) {
        callback({ id: payload.new.id, sender: 'other', text: payload.new.content, time: payload.new.sent_at })
      }
    }
  )
  .subscribe()
```

### 5.3 自动回复移除

`setTimeout` 模拟自动回复的代码删除——真实多用户互动不需要假回复。

---

## 六、dataStore 函数映射

所有函数签名不变，import 路径从 `mockStore` 改为 `dataStore`：

| 函数 | Supabase 实现 |
|------|-------------|
| `getCurrentUser()` | `supabase.auth.getSession()` + `profiles` 查询 |
| `signUpLocal()` | `supabase.auth.signUp()` |
| `signInLocal()` | `supabase.auth.signInWithPassword()` |
| `signOutLocal()` | `supabase.auth.signOut()` |
| `registerUser()` | `profiles` UPDATE |
| `getUserById()` | `profiles` SELECT |
| `getCandidates()` | `profiles` SELECT（排除自己和已划用户） |
| `swipeRight()` | `matches` INSERT/UPDATE（检查双向匹配） |
| `swipeLeft()` | 本地 Set 记录（不持久化到数据库） |
| `getConversation()` | `messages` SELECT |
| `sendMessage()` | `messages` INSERT |
| `subscribeMessages()` | Supabase Realtime channel |
| `getUserMatches()` | `matches` + `profiles` JOIN |
| `createProject()` | `projects` INSERT + `tasks` INSERT ×2 |
| `getProject()` | `projects` + `task` SELECT |
| `updateTask()` | `tasks` UPDATE |
| `addTask()` | `tasks` INSERT |
| `getRecruitments()` | `recruitments` SELECT + skills 过滤 |
| `addRecruitment()` | `recruitments` INSERT |

---

## 七、部署

- Render Static Site 从 GitHub 自动部署
- 构建命令：`npm install && npm run build`
- 发布目录：`dist`
- `.env` 变量（VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY）需在 Render 环境变量中配置
