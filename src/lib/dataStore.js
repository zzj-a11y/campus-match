// ============================================================
// 数据层 - Supabase 后端
// 所有函数签名与 mockStore.js 一致，页面无需改动调用逻辑
// ============================================================

import { supabase } from "./supabase";

// ---- 辅助 ----

function formatTime(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  const now = new Date();
  const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) {
    return d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
  } else if (diffDays === 1) {
    return `昨天 ${d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`;
  } else if (diffDays < 7) {
    const days = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
    return `${days[d.getDay()]} ${d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`;
  } else {
    return `${d.getMonth() + 1}/${d.getDate()} ${d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`;
  }
}

function currentUserId() {
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
    .select("name, college, grade, skills, goal, wechat, role")
    .eq("user_id", session.user.id)
    .maybeSingle();

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
    wechat: profile?.wechat || "",
    role: profile?.role || null,
  };
}

export async function registerUser({ skills, goal, college, grade, wechat }) {
  // 优先用 Supabase session（最可靠），fallback 到 localStorage
  const { data: { session } } = await supabase.auth.getSession();
  const uid = session?.user?.id || currentUserId();
  if (!uid) throw new Error("未登录，请先注册账号");

  // upsert：profile 存在就更新，不存在就创建（防止 DB trigger 未触发）
  const { data, error } = await supabase
    .from("profiles")
    .upsert({ user_id: uid, skills, goal, college, grade, wechat: wechat || null }, { onConflict: "user_id" })
    .select("name, college, grade, skills, goal, wechat")
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("保存资料失败，请重试");

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
  if (!userId) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("name, college, grade, skills, goal, wechat")
    .eq("user_id", userId)
    .maybeSingle();

  if (!profile) return null;
  const displayName = profile.name || profile.college || "?";
  return {
    id: userId,
    name: displayName,
    avatar: displayName[0] || "?",
    college: profile.college || "",
    grade: profile.grade || "",
    skills: profile.skills || [],
    goal: profile.goal || "",
    wechat: profile.wechat || "",
  };
}

export async function signUpLocal(_email, _password, _name) {
  throw new Error("signUpLocal 已废弃，请使用 useAuth().signUp");
}

export async function signInLocal(_email, _password) {
  throw new Error("signInLocal 已废弃，请使用 useAuth().signIn");
}

export function signOutLocal() {
  setCurrentUserId(null);
  swipedLocal.clear();
}

// ---- 本地状态：已划用户 ----

const swipedLocal = new Set();

// ---- 匹配 ----

// 获取所有用户（不过滤已划/已匹配）
export async function getAllUsers() {
  const user = await getCurrentUser();
  if (!user) return [];

  const { data: allProfiles } = await supabase
    .from("profiles")
    .select("user_id, name, college, grade, skills, goal");

  if (!allProfiles) return [];

  return allProfiles
    .filter((p) => p.user_id !== user.id)
    .map((p) => ({
      id: p.user_id,
      name: p.name,
      avatar: (p.name || "?")[0],
      college: p.college || "",
      grade: p.grade || "",
      skills: p.skills || [],
      goal: p.goal || "",
    }));
}

export async function getCandidates() {
  try {
  const user = await getCurrentUser();
  if (!user) return [];

  const userSkills = user.skills || [];
  const userGoal = user.goal;
  const userCollege = user.college;

  const { data: myMatches, error: mmError } = await supabase
    .from("matches")
    .select("user_a, user_b, status")
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`);

  if (mmError) { console.error("getCandidates matches error:", mmError); return []; }

  const excludeIds = new Set([user.id]);
  if (myMatches) {
    for (const m of myMatches) {
      const other = m.user_a === user.id ? m.user_b : m.user_a;
      if (m.status === "pending" || m.status === "matched") excludeIds.add(other);
    }
  }
  swipedLocal.forEach((id) => excludeIds.add(id));

  const { data: allProfiles, error: apError } = await supabase
    .from("profiles")
    .select("user_id, name, college, grade, skills, goal");

  if (apError) { console.error("getCandidates profiles error:", apError); return []; }
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
  } catch (e) { console.error("getCandidates crash:", e); return []; }
}

export async function swipeRight(userId) {
  const user = await getCurrentUser();
  if (!user) return null;

  swipedLocal.add(userId);

  const { data: existing } = await supabase
    .from("matches")
    .select("id, user_a, user_b")
    .eq("user_a", userId)
    .eq("user_b", user.id)
    .eq("status", "pending")
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("matches")
      .update({ status: "matched" })
      .eq("id", existing.id);

    if (error) throw error;

    const targetUser = await getUserById(userId);

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

  const { data: newMatch, error } = await supabase
    .from("matches")
    .insert({ user_a: user.id, user_b: userId, status: "pending" })
    .select("id, user_a, user_b, status")
    .maybeSingle();

  if (error) throw error;
  if (!newMatch) throw new Error("操作失败，请重试");

  return { match: newMatch, targetUser: null, isPending: true };
}

export async function swipeLeft(userId) {
  swipedLocal.add(userId);
}

// ---- 删除匹配/对话 ----
export async function deleteMatch(matchId) {
  const { error } = await supabase
    .from("matches")
    .delete()
    .eq("id", matchId);
  if (error) throw error;
}

// ---- 对话 ----

export async function getMatchPartner(matchId, currentUserId) {
  const { data: match } = await supabase
    .from("matches")
    .select("user_a, user_b")
    .eq("id", matchId)
    .maybeSingle();

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
    .maybeSingle();

  if (error) throw error;
  if (!msg) throw new Error("发送失败，请重试");

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
  try {
  const user = await getCurrentUser();
  if (!user) return [];

  const { data: matches, error: mError } = await supabase
    .from("matches")
    .select("id, user_a, user_b")
    .eq("status", "matched")
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`);

  if (mError) { console.error("getUserMatches error:", mError); return []; }
  if (!matches) return [];

  const result = [];
  for (const m of matches) {
    const partnerId = m.user_a === user.id ? m.user_b : m.user_a;
    const partner = await getUserById(partnerId);

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
  } catch (e) { console.error("getUserMatches crash:", e); return []; }
}

// ---- 项目 ----

export async function createProject(matchId, targetUserName) {
  const user = await getCurrentUser();
  if (!user) throw new Error("未登录");

  const { data: match } = await supabase
    .from("matches")
    .select("user_a, user_b")
    .eq("id", matchId)
    .maybeSingle();

  if (!match) throw new Error("匹配不存在");

  const targetUserId = match.user_a === user.id ? match.user_b : match.user_a;

  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      name: `${user.name} 和 ${targetUserName} 的项目`,
      created_by: user.id,
      match_id: matchId,
    })
    .select("id")
    .maybeSingle();

  if (error) throw error;
  if (!project) throw new Error("创建项目失败，请重试");

  const { error: pmError } = await supabase.from("project_members").insert([
    { project_id: project.id, user_id: user.id, role: "owner" },
    { project_id: project.id, user_id: targetUserId, role: "member" },
  ]);
  if (pmError) throw new Error(pmError.message.includes("row-level security")
    ? "权限不足：请联系管理员添加项目成员插入策略"
    : `添加项目成员失败：${pmError.message}`);

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
    .maybeSingle();

  if (!project) return null;

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
    .maybeSingle();

  if (error) throw error;
  if (!task) throw new Error("更新失败，请重试");

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
    .maybeSingle();

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
  if (error || !list) return [];

  let result = list.map((r) => ({
    id: r.id,
    title: r.title,
    skills: r.skills || [],
    college: r.college || "",
    authorId: r.author_id,
    time: r.created_at ? timeAgo(r.created_at) : "",
    urgent: r.urgent || false,
  }));

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
    .maybeSingle();

  if (error) throw error;
  if (!item) throw new Error("发布失败，请重试");

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

// ---- Realtime 订阅：招募广场 ----

export async function deleteRecruitment(postId) {
  const { error } = await supabase
    .from("recruitments")
    .delete()
    .eq("id", postId);

  if (error) throw error;
}

export function subscribeRecruitments(onNewPost) {
  const channel = supabase
    .channel("recruitments:public")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "recruitments" },
      (payload) => {
        onNewPost({
          id: payload.new.id,
          title: payload.new.title,
          skills: payload.new.skills || [],
          college: payload.new.college || "",
          authorId: payload.new.author_id,
          time: "刚刚",
          urgent: payload.new.urgent || false,
        });
      }
    )
    .subscribe();

  return {
    unsubscribe: () => supabase.removeChannel(channel),
  };
}

// ---- 招募广场 → 直接联系发帖人 ----

export async function contactAuthor(authorId) {
  const user = await getCurrentUser();
  if (!user) throw new Error("请先登录");

  // 检查是否已有 match（两个 .eq() 替代复杂 .or(and())）
  const { data: m1 } = await supabase
    .from("matches")
    .select("id")
    .eq("user_a", user.id)
    .eq("user_b", authorId)
    .maybeSingle();
  if (m1) return m1.id;

  const { data: m2 } = await supabase
    .from("matches")
    .select("id")
    .eq("user_a", authorId)
    .eq("user_b", user.id)
    .maybeSingle();
  if (m2) return m2.id;

  // 创建新 match（直接 matched，跳过 pending）
  const { data: newMatch, error } = await supabase
    .from("matches")
    .insert({ user_a: user.id, user_b: authorId, status: "matched" })
    .select("id")
    .maybeSingle();

  if (error) throw error;
  if (!newMatch) throw new Error("发起联系失败");

  // 发系统消息
  await supabase.from("messages").insert({
    match_id: newMatch.id,
    sender_id: user.id,
    content: "你好！我看到你在招募广场的帖子，想联系你组队",
  });

  return newMatch.id;
}
