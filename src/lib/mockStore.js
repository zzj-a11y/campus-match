// ============================================================
// 数据层 - Supabase 真实调用
// 所有函数签名与旧 mockStore 相同，但改为异步
// ============================================================

import { supabase } from "./supabase";

// ---- 会话级内存（仅用于当前session的滑卡记录） ----
const swipedUserIds = new Set();

// ---- 辅助函数 ----
function formatTime() {
  return new Date().toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ---- Auth / 用户 ----

export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return {
    id: user.id,
    email: user.email,
    name: profile?.name || user.email?.split("@")[0] || "我",
    avatar: (profile?.name || user.email?.split("@")[0] || "我")[0],
    college: profile?.college || "",
    grade: profile?.grade || "",
    skills: profile?.skills || [],
    goal: profile?.goal || "",
  };
}

export async function registerUser({ skills, goal, college, grade }) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("未登录");

  const name = user.email?.split("@")[0] || "同学";

  const { error } = await supabase.from("profiles").upsert({
    user_id: user.id,
    name,
    college,
    grade,
    skills,
    goal,
    updated_at: new Date().toISOString(),
  });

  if (error) throw error;

  return { id: user.id, name, avatar: name[0], college, grade, skills, goal };
}

export async function getUserById(userId) {
  // 先查 profiles
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (profile) {
    return {
      id: userId,
      name: profile.name || "同学",
      avatar: (profile.name || "同")[0],
      college: profile.college || "",
      grade: profile.grade || "",
      skills: profile.skills || [],
      goal: profile.goal || "",
    };
  }

  return null;
}

// ---- 匹配 ----

export async function getCandidates() {
  const user = await getCurrentUser();
  if (!user) return [];

  const userSkills = user.skills || [];
  const userGoal = user.goal;
  const userCollege = user.college;

  // 从 Supabase 查询其他用户的 profile
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .neq("user_id", user.id);

  const realCandidates = (profiles || [])
    .filter((p) => !swipedUserIds.has(p.user_id))
    .map((p) => {
      const pSkills = p.skills || [];
      const sharedSkills = pSkills.filter((s) => userSkills.includes(s));
      let score = sharedSkills.length * 25;
      if (p.college === userCollege) score += 20;
      if (p.goal === userGoal) score += 15;
      score = Math.min(score, 98);

      const reasonParts = [];
      if (sharedSkills.length > 0) {
        reasonParts.push(
          `你们都有 ${sharedSkills.slice(0, 2).join("、")} 标签`
        );
      }
      if (p.college === userCollege) reasonParts.push("同学院优先推荐");
      if (p.goal === userGoal) reasonParts.push("目标一致");
      if (reasonParts.length === 0) reasonParts.push("技能互补，可能适合组队");

      return {
        id: p.user_id,
        name: p.name || "同学",
        avatar: (p.name || "同")[0],
        college: p.college,
        grade: p.grade,
        skills: pSkills,
        goal: p.goal,
        matchRate: score + Math.floor(Math.random() * 5),
        reason: reasonParts.join("，"),
      };
    });

  // 按匹配度降序
  realCandidates.sort((a, b) => b.matchRate - a.matchRate);

  return realCandidates;
}

export async function swipeRight(userId) {
  const user = await getCurrentUser();
  if (!user) return null;

  swipedUserIds.add(userId);

  // 检查对方是否已经对我右滑（pending → 变 matched）
  const { data: existing } = await supabase
    .from("matches")
    .select("*")
    .eq("user_a", userId)
    .eq("user_b", user.id)
    .eq("status", "pending")
    .maybeSingle();

  if (existing) {
    // 双向匹配！
    await supabase
      .from("matches")
      .update({ status: "matched" })
      .eq("id", existing.id);

    const targetUser = await getUserById(userId);

    // 发送系统消息
    await supabase.from("messages").insert({
      match_id: existing.id,
      sender_id: user.id,
      content: "你们成功匹配了！现在可以开始对话，一起组队吧",
    });

    return {
      match: { ...existing, status: "matched" },
      targetUser: targetUser || {
        id: userId,
        name: "队友",
        avatar: "队",
        college: "",
      },
    };
  }

  // 单向右滑：插入 pending
  const { data: newMatch } = await supabase
    .from("matches")
    .insert({
      user_a: user.id,
      user_b: userId,
      status: "pending",
    })
    .select()
    .single();

  return { match: newMatch, targetUser: null, isPending: true };
}

export async function swipeLeft(userId) {
  swipedUserIds.add(userId);
}

// ---- 对话 ----

export async function getConversation(matchId) {
  const { data } = await supabase
    .from("messages")
    .select("*")
    .eq("match_id", matchId)
    .order("sent_at", { ascending: true });

  return (data || []).map((m) => ({
    id: m.id,
    sender: m.sender_id,
    text: m.content,
    time: m.sent_at
      ? new Date(m.sent_at).toLocaleTimeString("zh-CN", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "",
  }));
}

export async function sendMessage(matchId, text) {
  const user = await getCurrentUser();
  if (!user) throw new Error("未登录");

  const { data, error } = await supabase
    .from("messages")
    .insert({
      match_id: matchId,
      sender_id: user.id,
      content: text,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    sender: "me",
    text: data.content,
    time: formatTime(),
  };
}

// ---- 项目 ----

export async function createProject(matchId, targetUserName) {
  const user = await getCurrentUser();
  if (!user) throw new Error("未登录");

  // 查 match 找对方 user_id
  const { data: match } = await supabase
    .from("matches")
    .select("*")
    .eq("id", matchId)
    .single();

  const targetUserId =
    match.user_a === user.id ? match.user_b : match.user_a;

  // 创建项目
  const { data: project } = await supabase
    .from("projects")
    .insert({
      name: `${user.name} 和 ${targetUserName} 的项目`,
      created_by: user.id,
      match_id: matchId,
    })
    .select()
    .single();

  if (!project) throw new Error("创建项目失败");

  // 添加成员
  await supabase.from("project_members").insert([
    { project_id: project.id, user_id: user.id, role: "owner" },
    { project_id: project.id, user_id: targetUserId, role: "member" },
  ]);

  // 添加默认任务
  await supabase.from("tasks").insert([
    {
      project_id: project.id,
      title: "确定项目方向和目标",
      status: "todo",
    },
    {
      project_id: project.id,
      title: "分工认领任务",
      status: "todo",
    },
  ]);

  return {
    ...project,
    members: [
      { id: user.id, name: user.name },
      { id: targetUserId, name: targetUserName },
    ],
    tasks: [
      {
        id: "t_tmp_1",
        title: "确定项目方向和目标",
        assignee: "未分配",
        due: "待定",
        status: "todo",
      },
      {
        id: "t_tmp_2",
        title: "分工认领任务",
        assignee: "未分配",
        due: "待定",
        status: "todo",
      },
    ],
  };
}

export async function getProject(projectId) {
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();

  if (!project) return null;

  const { data: members } = await supabase
    .from("project_members")
    .select("*")
    .eq("project_id", projectId);

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  return {
    ...project,
    members: (members || []).map((m) => ({ id: m.user_id, name: m.user_id })),
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
  const payload = {};
  if (updates.status) payload.status = updates.status;
  if (updates.title) payload.title = updates.title;
  if (updates.assignee) payload.assignee = updates.assignee;

  const { data, error } = await supabase
    .from("tasks")
    .update(payload)
    .eq("id", taskId)
    .eq("project_id", projectId)
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    title: data.title,
    assignee: data.assignee || "未分配",
    due: data.due_date || "待定",
    status: data.status,
  };
}

export async function addTask(projectId, title) {
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      project_id: projectId,
      title,
      status: "todo",
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    title: data.title,
    assignee: data.assignee || "未分配",
    due: data.due_date || "待定",
    status: data.status,
  };
}

// ---- 招募广场 ----

export async function getRecruitments(filters = {}) {
  let query = supabase.from("recruitments").select("*");

  if (filters.college && filters.college !== "全部学院") {
    query = query.eq("college", filters.college);
  }
  if (filters.skill && filters.skill !== "全部技能") {
    query = query.contains("skills", [filters.skill]);
  }

  const { data } = await query.order("created_at", { ascending: false });

  return (data || []).map((r) => ({
    id: r.id,
    title: r.title,
    skills: r.skills || [],
    college: r.college || "",
    authorId: r.author_id,
    time: r.created_at
      ? (() => {
          const diff = Date.now() - new Date(r.created_at).getTime();
          const hours = Math.floor(diff / (1000 * 60 * 60));
          if (hours < 1) return "刚刚";
          if (hours < 24) return `${hours} 小时前`;
          return `${Math.floor(hours / 24)} 天前`;
        })()
      : "",
    urgent: r.urgent || false,
  }));
}

export async function addRecruitment({ title, skills, college }) {
  const user = await getCurrentUser();
  if (!user) throw new Error("未登录");

  const { data, error } = await supabase
    .from("recruitments")
    .insert({
      title,
      skills,
      college: college || user.college || "",
      author_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    title: data.title,
    skills: data.skills,
    college: data.college,
    authorId: data.author_id,
    time: "刚刚",
    urgent: false,
  };
}

// ---- Realtime 订阅（用于即时通讯） ----

export function subscribeMessages(matchId, currentUserId, onNewMessage) {
  return supabase
    .channel(`messages:${matchId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `match_id=eq.${matchId}`,
      },
      (payload) => {
        const m = payload.new;
        onNewMessage({
          id: m.id,
          sender: m.sender_id === currentUserId ? "me" : "other",
          text: m.content,
          time: new Date(m.sent_at).toLocaleTimeString("zh-CN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        });
      }
    )
    .subscribe();
}
