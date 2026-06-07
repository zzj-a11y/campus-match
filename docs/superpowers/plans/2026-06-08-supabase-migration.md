# Supabase 多用户互通 - 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将校园智搭数据层从 localStorage 迁移到 Supabase，实现多用户数据互通和实时聊天

**Architecture:** 方案 C — mockStore.js → dataStore.js，函数签名全保留，页面仅改 import 路径。AuthContext 对接 Supabase Auth，Chat 页面用 Supabase Realtime 替换假自动回复

**Tech Stack:** Vite + React 19, Supabase JS SDK v2, Supabase Auth + Realtime, PostgreSQL (Supabase)

**Design Doc:** `docs/superpowers/specs/2026-06-08-supabase-migration-design.md`

---

## 文件变更总览

| 文件 | 动作 |
|------|------|
| `.env` | 创建 |
| `src/lib/supabase.js` | 重写 |
| `src/lib/dataStore.js` | 创建（替代 mockStore.js） |
| `src/lib/mockStore.js` | 删除 |
| `src/context/AuthContext.jsx` | 重写 |
| `src/pages/Chat.jsx` | 修改（Realtime + import） |
| `src/pages/Match.jsx` | import 路径 |
| `src/pages/Project.jsx` | import 路径 |
| `src/pages/Square.jsx` | import 路径 |
| `src/pages/Register.jsx` | import 路径 |
| `src/components/Nav.jsx` | import 路径 |
| `sql/` | 在 Supabase SQL Editor 执行 |

---

### Task 1: 配置环境变量和 Supabase 客户端

**Files:**
- Create: `.env`
- Modify: `src/lib/supabase.js`

- [ ] **Step 1: 创建 `.env` 文件**

```env
VITE_SUPABASE_URL=https://afzcyggwduqzggujhcjr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmemN5Z2d3ZHVxemdndWpoY2pyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4NDU2MTYsImV4cCI6MjA5NjQyMTYxNn0.Jj25xNPiqCQcjyvBdKb06QHjyIBg_t8kLTBF90dhFNs
```

- [ ] **Step 2: 重写 `src/lib/supabase.js`**

```js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

- [ ] **Step 3: 验证构建能读取 env 变量**

Run: `cd c:/Users/25381/Desktop/校园智搭方案/campus-match && npm run build 2>&1`

Expected: 构建成功，无错误（dataStore 尚未创建，其他文件暂时会报错——此步仅验证 supabase.js 语法和 env 加载）

- [ ] **Step 4: 更新 `.env.example`**

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

---

### Task 2: 在 Supabase SQL Editor 执行建表脚本

**说明：** 此 task 需用户在 Supabase Dashboard 操作（或提供数据库密码后由 Claude 在终端执行）

- [ ] **Step 1: 执行 `sql/01_create_tables.sql`**

去 https://supabase.com/dashboard/project/afzcyggwduqzggujhcjr → SQL Editor → 粘贴 `sql/01_create_tables.sql` 全部内容 → Run

Expected: 返回 `Success. No rows returned.`

- [ ] **Step 2: 执行 `sql/02_add_name_column.sql`**

在 SQL Editor 中粘贴 → Run

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS name TEXT;
```

Expected: `ALTER TABLE` 成功或 `column "name" of relation "profiles" already exists`（可忽略）

- [ ] **Step 3: 执行 `sql/03_seed_users.sql`**

在 SQL Editor 中粘贴全部内容 → Run

Expected: `DO` 块执行成功，无错误

- [ ] **Step 4: 修复 profiles RLS — 允许所有人读（匹配/招募需要）**

```sql
-- 原来的策略只允许读自己的档案，匹配需要读所有人的基础信息
DROP POLICY IF EXISTS "用户可读自己的档案" ON profiles;
CREATE POLICY "所有人可读档案" ON profiles FOR SELECT USING (true);
```

Expected: `DROP POLICY` + `CREATE POLICY` 成功

- [ ] **Step 5: 启用 Realtime（在 SQL Editor 执行）**

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
```

Expected: `ALTER PUBLICATION` 成功

- [ ] **Step 6: 验证表已创建**

在 SQL Editor 执行：

```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

Expected: 返回 `profiles, matches, messages, projects, project_members, tasks, recruitments`（7 个表）

- [ ] **Step 7: 验证种子用户已入库**

在 SQL Editor 执行：

```sql
SELECT p.name, p.college, u.email FROM profiles p JOIN auth.users u ON p.user_id = u.id;
```

Expected: 返回 8 行（张同学、李同学……吴同学）

---

### Task 3: 重写 AuthContext

**Files:**
- Modify: `src/context/AuthContext.jsx`

- [ ] **Step 1: 重写 AuthContext.jsx**

用 Supabase Auth 替换 mockStore 的 signUpLocal/signInLocal/signOutLocal/getCurrentUser：

```jsx
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 启动时从 Supabase session 恢复
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // 监听 auth 状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadProfile(session.user);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadProfile(authUser) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("name, college, grade, skills, goal")
      .eq("user_id", authUser.id)
      .single();

    setUser({
      id: authUser.id,
      email: authUser.email,
      name: profile?.name || authUser.email?.split("@")[0] || "",
      avatar: (profile?.name || authUser.email || "?")[0],
      college: profile?.college || "",
      grade: profile?.grade || "",
      skills: profile?.skills || [],
      goal: profile?.goal || "",
    });
    setLoading(false);
  }

  // 注册：Supabase Auth signUp + profiles INSERT
  const signUp = useCallback(async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    if (!data.user) throw new Error("注册失败，请重试");

    // 创建 profiles 行（name 是对外展示名）
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({ user_id: data.user.id, name });

    if (profileError) throw profileError;

    // 直接加载 profile（signUp 后已是登录态）
    await loadProfile(data.user);
    return { id: data.user.id, email, name, skills: [], goal: "", college: "", grade: "" };
  }, []);

  // 登录
  const signIn = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    await loadProfile(data.user);
    return true;
  }, []);

  // 登出
  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const value = { user, session: user ? {} : null, loading, signUp, signIn, signOut };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth 必须在 AuthProvider 内部使用");
  return context;
}
```

- [ ] **Step 2: 安装 Supabase JS SDK**

Run: `cd c:/Users/25381/Desktop/校园智搭方案/campus-match && npm install @supabase/supabase-js 2>&1`

Expected: 已安装（package.json 中已有 `@supabase/supabase-js: ^2.107.0`），输出 `up to date`

- [ ] **Step 3: 验证构建**

Run: `cd c:/Users/25381/Desktop/校园智搭方案/campus-match && npm run build 2>&1`

Expected: 构建报错（mockStore 相关 import 尚未更新，属预期行为），但 AuthContext 相关无报错

---

### Task 4: 创建 dataStore.js（核心）

**Files:**
- Create: `src/lib/dataStore.js`
- Delete: `src/lib/mockStore.js`（在 Task 6 所有 import 更新后执行）

- [ ] **Step 1: 创建 dataStore.js**

这是整个迁移的核心——保留 mockStore.js 全部 21 个导出函数签名，内部改用 Supabase：

```js
// ============================================================
// 数据层 - Supabase 后端
// 所有函数签名与 mockStore.js 一致，页面无需改动调用逻辑
// ============================================================

import { supabase } from "./supabase";

// ---- 辅助 ----

function formatTime(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  return d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
}

function currentUserId() {
  // 从 localStorage 读取缓存的 userId（auth 恢复时写入）
  return localStorage.getItem("campus_current_user");
}

function setCurrentUserId(id) {
  if (id) localStorage.setItem("campus_current_user", id);
  else localStorage.removeItem("campus_current_user");
}

// ---- Auth / 用户 ----

export async function getCurrentUser() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, college, grade, skills, goal")
    .eq("user_id", session.user.id)
    .single();

  setCurrentUserId(session.user.id);

  return {
    id: session.user.id,
    email: session.user.email,
    name: profile?.name || session.user.email?.split("@")[0] || "",
    avatar: (profile?.name || session.user.email || "?")[0],
    college: profile?.college || "",
    grade: profile?.grade || "",
    skills: profile?.skills || [],
    goal: profile?.goal || "",
  };
}

export async function registerUser({ skills, goal, college, grade }) {
  const uid = currentUserId();
  if (!uid) throw new Error("未登录");

  const { data, error } = await supabase
    .from("profiles")
    .update({ skills, goal, college, grade })
    .eq("user_id", uid)
    .select("name, college, grade, skills, goal")
    .single();

  if (error) throw error;

  return {
    id: uid,
    name: data.name,
    avatar: data.name[0],
    college: data.college,
    grade: data.grade,
    skills: data.skills,
    goal: data.goal,
  };
}

export async function getUserById(userId) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("name, college, grade, skills, goal")
    .eq("user_id", userId)
    .single();

  if (!profile) return null;
  return {
    id: userId,
    name: profile.name,
    avatar: profile.name[0],
    college: profile.college || "",
    grade: profile.grade || "",
    skills: profile.skills || [],
    goal: profile.goal || "",
  };
}

// signUpLocal / signInLocal / signOutLocal 不再需要
// 注册/登录/登出已在 AuthContext 中通过 Supabase Auth 实现
// 但保留空壳避免兼容性问题（如有直接调用者）

export async function signUpLocal(_email, _password, _name) {
  throw new Error("signUpLocal 已废弃，请使用 useAuth().signUp");
}

export async function signInLocal(_email, _password) {
  throw new Error("signInLocal 已废弃，请使用 useAuth().signIn");
}

export function signOutLocal() {
  setCurrentUserId(null);
}

// ---- 本地状态：已划用户（不持久化到数据库，仅用于当前会话） ----

const swipedLocal = new Set();

// ---- 匹配 ----

export async function getCandidates() {
  const user = await getCurrentUser();
  if (!user) return [];

  const userSkills = user.skills || [];
  const userGoal = user.goal;
  const userCollege = user.college;

  // 获取所有已匹配或 pending 的对方 userId
  const { data: myMatches } = await supabase
    .from("matches")
    .select("user_a, user_b, status")
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`);

  const excludeIds = new Set([user.id]);
  if (myMatches) {
    for (const m of myMatches) {
      const other = m.user_a === user.id ? m.user_b : m.user_a;
      // pending 和 matched 都不再出现在候选人里
      if (m.status === "pending" || m.status === "matched") excludeIds.add(other);
    }
  }
  // 本地已划也排除
  swipedLocal.forEach((id) => excludeIds.add(id));

  // 查所有非排除用户
  const { data: allProfiles } = await supabase
    .from("profiles")
    .select("user_id, name, college, grade, skills, goal");

  if (!allProfiles) return [];

  const candidates = allProfiles
    .filter((p) => !excludeIds.has(p.user_id))
    .map((p) => {
      const pSkills = p.skills || [];
      const sharedSkills = pSkills.filter((s) => userSkills.includes(s));
      let score = sharedSkills.length * 25;
      if (p.college === userCollege) score += 20;
      if (p.goal === userGoal) score += 15;
      score = Math.min(score, 98);

      const reasonParts = [];
      if (sharedSkills.length > 0) {
        reasonParts.push(`你们都有 ${sharedSkills.slice(0, 2).join("、")} 标签`);
      }
      if (p.college === userCollege) reasonParts.push("同学院优先推荐");
      if (p.goal === userGoal) reasonParts.push("目标一致");
      if (reasonParts.length === 0) reasonParts.push("技能互补，可能适合组队");

      return {
        id: p.user_id,
        name: p.name,
        avatar: p.name[0],
        college: p.college,
        grade: p.grade,
        skills: pSkills,
        goal: p.goal,
        matchRate: score + Math.floor(Math.random() * 5),
        reason: reasonParts.join("，"),
      };
    });

  candidates.sort((a, b) => b.matchRate - a.matchRate);
  return candidates;
}

export async function swipeRight(userId) {
  const user = await getCurrentUser();
  if (!user) return null;

  swipedLocal.add(userId);

  // 检查对方是否已对我右滑（pending match where user_a = userId AND user_b = me）
  const { data: existing } = await supabase
    .from("matches")
    .select("id, user_a, user_b")
    .eq("user_a", userId)
    .eq("user_b", user.id)
    .eq("status", "pending")
    .maybeSingle();

  if (existing) {
    // 双向匹配！更新 status
    const { error } = await supabase
      .from("matches")
      .update({ status: "matched" })
      .eq("id", existing.id);

    if (error) throw error;

    // 获取对方信息
    const targetUser = await getUserById(userId);

    // 发系统消息
    await supabase.from("messages").insert({
      match_id: existing.id,
      sender_id: user.id,
      content: "你们成功匹配了！现在可以开始对话，一起组队吧",
    });

    return {
      match: { id: existing.id, user_a: existing.user_a, user_b: existing.user_b, status: "matched" },
      targetUser: targetUser || { id: userId, name: "队友", avatar: "队", college: "" },
    };
  }

  // 单向右滑：插入 pending
  const { data: newMatch, error } = await supabase
    .from("matches")
    .insert({ user_a: user.id, user_b: userId, status: "pending" })
    .select("id, user_a, user_b, status")
    .single();

  if (error) throw error;

  return { match: newMatch, targetUser: null, isPending: true };
}

export async function swipeLeft(userId) {
  swipedLocal.add(userId);
}

// ---- 对话 ----

export async function getMatchPartner(matchId, currentUserId) {
  const { data: match } = await supabase
    .from("matches")
    .select("user_a, user_b")
    .eq("id", matchId)
    .single();

  if (!match) return null;
  const partnerId = match.user_a === currentUserId ? match.user_b : match.user_a;

  const partner = await getUserById(partnerId);
  return partner || { name: "队友", avatar: "队" };
}

export async function getConversation(matchId) {
  const user = await getCurrentUser();
  const { data: msgs } = await supabase
    .from("messages")
    .select("id, sender_id, content, sent_at")
    .eq("match_id", matchId)
    .order("sent_at", { ascending: true });

  if (!msgs) return [];

  return msgs.map((m) => ({
    id: m.id,
    sender: m.sender_id === user?.id ? "me" : "other",
    text: m.content,
    time: formatTime(m.sent_at),
  }));
}

export async function sendMessage(matchId, text) {
  const user = await getCurrentUser();
  if (!user) throw new Error("未登录");

  const { data: msg, error } = await supabase
    .from("messages")
    .insert({ match_id: matchId, sender_id: user.id, content: text })
    .select("id, sent_at")
    .single();

  if (error) throw error;

  return {
    id: msg.id,
    sender: "me",
    text,
    time: formatTime(msg.sent_at),
  };
}

// ---- Realtime 订阅 ----

export function subscribeMessages(matchId, currentUserId, onNewMessage) {
  const channel = supabase
    .channel(`messages:${matchId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages", filter: `match_id=eq.${matchId}` },
      (payload) => {
        // 不推送自己的消息（页面已即时显示）
        if (payload.new.sender_id !== currentUserId) {
          onNewMessage({
            id: payload.new.id,
            sender: "other",
            text: payload.new.content,
            time: formatTime(payload.new.sent_at),
          });
        }
      }
    )
    .subscribe();

  return {
    unsubscribe: () => supabase.removeChannel(channel),
  };
}

// ---- 匹配列表 ----

export async function getUserMatches() {
  const user = await getCurrentUser();
  if (!user) return [];

  const { data: matches } = await supabase
    .from("matches")
    .select("id, user_a, user_b")
    .eq("status", "matched")
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`);

  if (!matches) return [];

  const result = [];
  for (const m of matches) {
    const partnerId = m.user_a === user.id ? m.user_b : m.user_a;
    const partner = await getUserById(partnerId);

    // 获取最后一条消息
    const { data: lastMsgs } = await supabase
      .from("messages")
      .select("content, sent_at")
      .eq("match_id", m.id)
      .order("sent_at", { ascending: false })
      .limit(1);

    const lastMsg = lastMsgs?.[0];

    result.push({
      matchId: m.id,
      partner: partner || { id: partnerId, name: "队友", avatar: "队" },
      lastMessage: lastMsg ? lastMsg.content : "",
      lastTime: lastMsg ? formatTime(lastMsg.sent_at) : "",
    });
  }

  return result;
}

// ---- 项目 ----

export async function createProject(matchId, targetUserName) {
  const user = await getCurrentUser();
  if (!user) throw new Error("未登录");

  const { data: match } = await supabase
    .from("matches")
    .select("user_a, user_b")
    .eq("id", matchId)
    .single();

  if (!match) throw new Error("匹配不存在");

  const targetUserId = match.user_a === user.id ? match.user_b : match.user_a;

  // 插入项目
  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      name: `${user.name} 和 ${targetUserName} 的项目`,
      created_by: user.id,
      match_id: matchId,
    })
    .select("id")
    .single();

  if (error) throw error;

  // 插入项目成员
  await supabase.from("project_members").insert([
    { project_id: project.id, user_id: user.id, role: "owner" },
    { project_id: project.id, user_id: targetUserId, role: "member" },
  ]);

  // 插入默认任务
  const { data: tasks } = await supabase
    .from("tasks")
    .insert([
      { project_id: project.id, title: "确定项目方向和目标", status: "todo", assignee: "未分配", due_date: "待定" },
      { project_id: project.id, title: "分工认领任务", status: "todo", assignee: "未分配", due_date: "待定" },
    ])
    .select("id, title, status, assignee, due_date");

  return {
    id: project.id,
    name: `${user.name} 和 ${targetUserName} 的项目`,
    created_by: user.id,
    match_id: matchId,
    members: [
      { id: user.id, name: user.name },
      { id: targetUserId, name: targetUserName },
    ],
    tasks: (tasks || []).map((t) => ({
      id: t.id,
      title: t.title,
      assignee: t.assignee || "未分配",
      due: t.due_date || "待定",
      status: t.status,
    })),
  };
}

export async function getProject(projectId) {
  const { data: project } = await supabase
    .from("projects")
    .select("id, name, created_by, match_id")
    .eq("id", projectId)
    .single();

  if (!project) return null;

  // 获取成员
  const { data: members } = await supabase
    .from("project_members")
    .select("user_id")
    .eq("project_id", projectId);

  const memberProfiles = [];
  if (members) {
    for (const m of members) {
      const p = await getUserById(m.user_id);
      if (p) memberProfiles.push(p);
    }
  }

  // 获取任务
  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, title, status, assignee, due_date")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  return {
    ...project,
    members: memberProfiles.map((p) => ({ id: p.id, name: p.name })),
    tasks: (tasks || []).map((t) => ({
      id: t.id,
      title: t.title,
      assignee: t.assignee || "未分配",
      due: t.due_date || "待定",
      status: t.status,
    })),
  };
}

export async function updateTask(projectId, taskId, updates) {
  const updateData = {};
  if (updates.status) updateData.status = updates.status;
  if (updates.title) updateData.title = updates.title;
  if (updates.assignee) updateData.assignee = updates.assignee;

  const { data: task, error } = await supabase
    .from("tasks")
    .update(updateData)
    .eq("id", taskId)
    .eq("project_id", projectId)
    .select("id, title, status, assignee, due_date")
    .single();

  if (error) throw error;

  return {
    id: task.id,
    title: task.title,
    assignee: task.assignee || "未分配",
    due: task.due_date || "待定",
    status: task.status,
  };
}

export async function addTask(projectId, title) {
  const { data: task, error } = await supabase
    .from("tasks")
    .insert({ project_id: projectId, title, status: "todo", assignee: "未分配", due_date: "待定" })
    .select("id, title, status, assignee, due_date")
    .single();

  if (error) throw error;

  return {
    id: task.id,
    title: task.title,
    assignee: task.assignee || "未分配",
    due: task.due_date || "待定",
    status: task.status,
  };
}

// ---- 招募广场 ----

function timeAgo(timestamp) {
  const diff = Date.now() - new Date(timestamp).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "刚刚";
  if (hours < 24) return `${hours} 小时前`;
  return `${Math.floor(hours / 24)} 天前`;
}

export async function getRecruitments(filters = {}) {
  let query = supabase.from("recruitments").select("id, title, skills, college, author_id, urgent, created_at");

  if (filters.college && filters.college !== "全部学院") {
    query = query.eq("college", filters.college);
  }

  const { data: list, error } = await query.order("created_at", { ascending: false });
  if (error) return [];

  let result = list.map((r) => ({
    id: r.id,
    title: r.title,
    skills: r.skills || [],
    college: r.college || "",
    authorId: r.author_id,
    time: r.created_at ? timeAgo(r.created_at) : "",
    urgent: r.urgent || false,
  }));

  // 客户端过滤 skills（GIN 索引加速未来可用 .contains）
  if (filters.skill && filters.skill !== "全部技能") {
    result = result.filter((r) => r.skills.includes(filters.skill));
  }

  return result;
}

export async function addRecruitment({ title, skills, college }) {
  const user = await getCurrentUser();
  if (!user) throw new Error("未登录");

  const { data: item, error } = await supabase
    .from("recruitments")
    .insert({
      title,
      skills,
      college: college || user.college || "",
      author_id: user.id,
      urgent: false,
    })
    .select("id, title, skills, college, author_id, urgent, created_at")
    .single();

  if (error) throw error;

  return {
    id: item.id,
    title: item.title,
    skills: item.skills,
    college: item.college,
    authorId: item.author_id,
    time: "刚刚",
    urgent: false,
  };
}
```

- [ ] **Step 2: 验证 dataStore.js 语法**

Run: `cd c:/Users/25381/Desktop/校园智搭方案/campus-match && node -e "require('./src/lib/dataStore.js')" 2>&1 || npx vite build --mode development 2>&1 | head -20`

由于是 ESM 模块，不能用 `node -e` 直接检查。改为验证构建：

Run: `cd c:/Users/25381/Desktop/校园智搭方案/campus-match && npx vite build 2>&1`

Expected: 构建报错指向 mockStore import（尚未更新），dataStore 本身的语法无错误

---

### Task 5: 更新 Chat.jsx — import 路径 + 移除自动回复逻辑

**Files:**
- Modify: `src/pages/Chat.jsx`

- [ ] **Step 1: 修改 Chat.jsx 的 import**

将第 4-11 行的 import 从 `mockStore` 改为 `dataStore`：

```jsx
import {
  getCurrentUser,
  getConversation,
  sendMessage,
  createProject,
  subscribeMessages,
  getMatchPartner,
} from "../lib/dataStore";
```

- [ ] **Step 2: 验证 Chat.jsx 不再有自动回复依赖**

Chat.jsx 的 `handleSend` 函数中，`sendMessage` 返回后手动 `setMessages` 追加自己发的消息——这是正确行为。dataStore 的 `sendMessage` 不再触发 setTimeout 假回复，对方消息由 Realtime subscription 推送。代码逻辑无需改动。

Run: `cd c:/Users/25381/Desktop/校园智搭方案/campus-match && npx vite build 2>&1 | grep -i "error\|success" || npx vite build 2>&1 | tail -10`

Expected: Chat.jsx 构建无报错

---

### Task 6: 更新所有剩余文件的 import 路径 + 删除 mockStore.js

**Files:**
- Modify: `src/pages/Match.jsx:5`
- Modify: `src/pages/Project.jsx:5`
- Modify: `src/pages/Square.jsx:4`
- Modify: `src/pages/Register.jsx:5`
- Modify: `src/components/Nav.jsx:5`
- Modify: `src/context/AuthContext.jsx:2`
- Delete: `src/lib/mockStore.js`

- [ ] **Step 1: Match.jsx — 改 import 路径（第 5 行）**

Old:
```js
import { getCurrentUser, getCandidates, swipeRight, swipeLeft, getUserMatches } from "../lib/mockStore";
```
New:
```js
import { getCurrentUser, getCandidates, swipeRight, swipeLeft, getUserMatches } from "../lib/dataStore";
```

- [ ] **Step 2: Project.jsx — 改 import 路径（第 5 行）**

Old:
```js
import { getCurrentUser, getProject, updateTask, addTask } from "../lib/mockStore";
```
New:
```js
import { getCurrentUser, getProject, updateTask, addTask } from "../lib/dataStore";
```

- [ ] **Step 3: Square.jsx — 改 import 路径（第 4 行）**

Old:
```js
import { getRecruitments, addRecruitment } from "../lib/mockStore";
```
New:
```js
import { getRecruitments, addRecruitment } from "../lib/dataStore";
```

- [ ] **Step 4: Register.jsx — 改 import 路径（第 5 行）**

Old:
```js
import { registerUser } from "../lib/mockStore";
```
New:
```js
import { registerUser } from "../lib/dataStore";
```

- [ ] **Step 5: Nav.jsx — 改 import 路径（第 5 行）**

Old:
```js
import { getUserMatches } from "../lib/mockStore";
```
New:
```js
import { getUserMatches } from "../lib/dataStore";
```

- [ ] **Step 6: AuthContext.jsx — 移除 mockStore import（第 2 行）**

删除：
```js
import { signUpLocal, signInLocal, signOutLocal, getCurrentUser } from "../lib/mockStore";
```

AuthContext 已在 Task 3 中重写，不再需要 mockStore。

- [ ] **Step 7: 删除 mockStore.js**

```bash
rm "c:/Users/25381/Desktop/校园智搭方案/campus-match/src/lib/mockStore.js"
```

- [ ] **Step 8: 全量构建验证**

Run: `cd c:/Users/25381/Desktop/校园智搭方案/campus-match && npm run build 2>&1`

Expected: `✓ built in X.XXs` — 构建成功，无任何错误

- [ ] **Step 9: 确认无遗漏的 mockStore 引用**

Run: `cd c:/Users/25381/Desktop/校园智搭方案/campus-match && grep -r "mockStore" src/ 2>&1 || echo "No mockStore references found"`

Expected: `No mockStore references found`（0 结果）

---

### Task 7: 本地启动验证

**Files:** 无新建/修改

- [ ] **Step 1: 启动开发服务器**

Run: `cd c:/Users/25381/Desktop/校园智搭方案/campus-match && npm run dev 2>&1`

- [ ] **Step 2: 验证注册流程**

打开 http://localhost:5173 → 点击「立即注册」→ 填写姓名/邮箱/密码 → 选技能 → 选目标 → 选学院

Expected: 注册成功，跳转 `/match`。去 Supabase Dashboard → Table Editor → `profiles` 表确认有新增行

- [ ] **Step 3: 验证种子用户登录**

退出登录 → 用 `zhang@campus.edu` / `123456` 登录

Expected: 登录成功，跳转 match 页，看到其他候选用户

- [ ] **Step 4: 验证匹配流程**

右滑一个用户 → 切换到另一个浏览器 tab 用另一个种子账号登录 → 右滑回来 → 确认双向匹配弹窗 + 对话建立

Expected: 匹配弹窗显示，`matches` 表有 `matched` 记录

- [ ] **Step 5: 验证实时聊天**

在匹配对话框发消息 → 切换到对方账号查看

Expected: 消息即时出现在对方对话框（Realtime 推送）

---

### Task 8: 配置 Render 环境变量 + 最终部署

- [ ] **Step 1: 在 Render Dashboard 添加环境变量**

去 https://dashboard.render.com → 选择 campus-match Static Site → Environment → 添加：

| Key | Value |
|-----|-------|
| `VITE_SUPABASE_URL` | `https://afzcyggwduqzggujhcjr.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmemN5Z2d3ZHVxemdndWpoY2pyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4NDU2MTYsImV4cCI6MjA5NjQyMTYxNn0.Jj25xNPiqCQcjyvBdKb06QHjyIBg_t8kLTBF90dhFNs` |

- [ ] **Step 2: 触发 Render 重新部署**

Push 到 GitHub main 分支 → Render 自动重新构建

```bash
cd c:/Users/25381/Desktop/校园智搭方案/campus-match && git add -A && git commit -m "feat: migrate from localStorage to Supabase for multi-user data sharing" && git push origin main
```

- [ ] **Step 3: 验证线上访问**

打开 Render URL（如 `https://campus-match.onrender.com`）

Expected: 首页正常加载 → 注册 → 登录 → 匹配 → 聊天 → 看板 → 招募广场全流程可用

- [ ] **Step 4: 更新项目完成进度文档**

更新 `项目完成进度.md` 第四章部署历程，记录 Supabase 迁移完成

---

### Task 9: 清理与收尾

- [ ] **Step 1: 确认 `.gitignore` 包含 `.env`**

Run: `cd c:/Users/25381/Desktop/校园智搭方案/campus-match && grep ".env" .gitignore 2>&1`

Expected: `.env` 被 gitignore（防止泄露 Supabase key）

- [ ] **Step 2: 最终 commit**

```bash
cd c:/Users/25381/Desktop/校园智搭方案/campus-match && git status && git add -A && git commit -m "chore: finalize Supabase migration, update docs"
```
