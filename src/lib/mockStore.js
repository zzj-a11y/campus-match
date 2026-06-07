// ============================================================
// 数据层 - 纯前端 localStorage 方案
// 所有函数签名不变，底层从 Supabase 切换为浏览器本地存储
// ============================================================

// ---- localStorage DB ----

const DB_KEY = "campus_match_db";

const SEED_USERS = [
  {
    id: "seed-zhang",
    email: "zhang@campus.edu",
    password: "123456",
    name: "张同学",
    college: "计算机科学学院",
    grade: "大三",
    skills: ["Python", "数据分析", "PPT"],
    goal: "competition",
  },
  {
    id: "seed-li",
    email: "li@campus.edu",
    password: "123456",
    name: "李同学",
    college: "财经学院",
    grade: "大二",
    skills: ["商业计划书", "Excel", "演讲"],
    goal: "competition",
  },
  {
    id: "seed-wang",
    email: "wang@campus.edu",
    password: "123456",
    name: "王同学",
    college: "美术学院",
    grade: "大三",
    skills: ["Figma", "UI设计", "动画"],
    goal: "thesis",
  },
  {
    id: "seed-zhao",
    email: "zhao@campus.edu",
    password: "123456",
    name: "赵同学",
    college: "计算机科学学院",
    grade: "大四",
    skills: ["Java", "Spring Boot", "MySQL"],
    goal: "thesis",
  },
  {
    id: "seed-liu",
    email: "liu@campus.edu",
    password: "123456",
    name: "刘同学",
    college: "文学与传媒学院",
    grade: "大三",
    skills: ["写作", "文案", "剪辑"],
    goal: "competition",
  },
  {
    id: "seed-chen",
    email: "chen@campus.edu",
    password: "123456",
    name: "陈同学",
    college: "机电学院",
    grade: "大四",
    skills: ["Python", "机器学习", "数据分析"],
    goal: "thesis",
  },
  {
    id: "seed-zhou",
    email: "zhou@campus.edu",
    password: "123456",
    name: "周同学",
    college: "财经学院",
    grade: "大二",
    skills: ["英语", "Excel", "金融分析"],
    goal: "study",
  },
  {
    id: "seed-wu",
    email: "wu@campus.edu",
    password: "123456",
    name: "吴同学",
    college: "美术学院",
    grade: "大三",
    skills: ["PS", "AI", "摄影"],
    goal: "thesis",
  },
  {
    id: "seed-lin",
    email: "lin@campus.edu",
    password: "123456",
    name: "林同学",
    college: "自动化学院",
    grade: "大三",
    skills: ["C++", "机器人工程", "嵌入式开发"],
    goal: "competition",
  },
  {
    id: "seed-huang",
    email: "huang@campus.edu",
    password: "123456",
    name: "黄同学",
    college: "外国语学院",
    grade: "大二",
    skills: ["英语", "日语", "翻译"],
    goal: "study",
  },
  {
    id: "seed-zheng",
    email: "zheng@campus.edu",
    password: "123456",
    name: "郑同学",
    college: "网络空间安全学院",
    grade: "大四",
    skills: ["网络安全", "Python", "CTF"],
    goal: "competition",
  },
  {
    id: "seed-sun",
    email: "sun@campus.edu",
    password: "123456",
    name: "孙同学",
    college: "教育科学学院",
    grade: "大三",
    skills: ["教育技术", "数字媒体", "PPT"],
    goal: "thesis",
  },
  {
    id: "seed-yang",
    email: "yang@campus.edu",
    password: "123456",
    name: "杨同学",
    college: "汽车与交通工程学院",
    grade: "大三",
    skills: ["CAD", "新能源汽车", "项目管理"],
    goal: "competition",
  },
  {
    id: "seed-xu",
    email: "xu@campus.edu",
    password: "123456",
    name: "许同学",
    college: "电子与信息学院",
    grade: "大二",
    skills: ["单片机", "电路设计", "硬件调试"],
    goal: "study",
  },
  {
    id: "seed-he",
    email: "he@campus.edu",
    password: "123456",
    name: "何同学",
    college: "法学与知识产权学院",
    grade: "大四",
    skills: ["法律检索", "文书写作", "辩论"],
    goal: "thesis",
  },
];

function getDb() {
  const raw = localStorage.getItem(DB_KEY);
  if (!raw) {
    const initial = {
      users: {},
      matches: [],
      messages: {},
      projects: {},
      tasks: {},
      recruitments: [],
      swipedUsers: [],
    };
    // 预置种子用户
    for (const u of SEED_USERS) {
      initial.users[u.id] = { ...u };
    }
    saveDb(initial);
    return initial;
  }
  return JSON.parse(raw);
}

function saveDb(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

// ---- 辅助 ----

function formatTime() {
  return new Date().toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function currentUserId() {
  return localStorage.getItem("campus_current_user");
}

function setCurrentUserId(id) {
  if (id) {
    localStorage.setItem("campus_current_user", id);
  } else {
    localStorage.removeItem("campus_current_user");
  }
}

// ---- Auth / 用户 ----

export async function getCurrentUser() {
  const uid = currentUserId();
  if (!uid) return null;
  const db = getDb();
  const profile = db.users[uid];
  if (!profile) return null;
  return {
    id: uid,
    email: profile.email,
    name: profile.name,
    avatar: profile.name[0],
    college: profile.college || "",
    grade: profile.grade || "",
    skills: profile.skills || [],
    goal: profile.goal || "",
  };
}

export async function registerUser({ skills, goal, college, grade }) {
  const uid = currentUserId();
  if (!uid) throw new Error("未登录");

  const db = getDb();
  const existing = db.users[uid];
  if (!existing) throw new Error("用户不存在");

  db.users[uid] = {
    ...existing,
    college,
    grade,
    skills,
    goal,
  };
  saveDb(db);

  return {
    id: uid,
    name: existing.name,
    avatar: existing.name[0],
    college,
    grade,
    skills,
    goal,
  };
}

export async function getUserById(userId) {
  const db = getDb();
  const p = db.users[userId];
  if (!p) return null;
  return {
    id: userId,
    name: p.name,
    avatar: p.name[0],
    college: p.college || "",
    grade: p.grade || "",
    skills: p.skills || [],
    goal: p.goal || "",
  };
}

export async function signUpLocal(email, password, name) {
  const db = getDb();

  // 检查邮箱是否已注册
  const exists = Object.values(db.users).find((u) => u.email === email);
  if (exists) throw new Error("该邮箱已被注册");

  const id = "user_" + crypto.randomUUID().slice(0, 8);
  db.users[id] = {
    id,
    email,
    password,
    name: name || email.split("@")[0],
    college: "",
    grade: "",
    skills: [],
    goal: "",
  };
  saveDb(db);
  setCurrentUserId(id);
  return {
    id,
    email,
    name: db.users[id].name,
    avatar: db.users[id].name[0],
    college: "",
    grade: "",
    skills: [],
    goal: "",
  };
}

export async function signInLocal(email, password) {
  const db = getDb();
  const user = Object.values(db.users).find(
    (u) => u.email === email && u.password === password
  );
  if (!user) throw new Error("邮箱或密码错误");

  setCurrentUserId(user.id);
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.name[0],
    college: user.college || "",
    grade: user.grade || "",
    skills: user.skills || [],
    goal: user.goal || "",
  };
}

export function signOutLocal() {
  setCurrentUserId(null);
}

// ---- 匹配 ----

export async function getCandidates() {
  const user = await getCurrentUser();
  if (!user) return [];

  const db = getDb();
  const userSkills = user.skills || [];
  const userGoal = user.goal;
  const userCollege = user.college;
  const swiped = db.swipedUsers || [];

  const candidates = Object.values(db.users)
    .filter((u) => u.id !== user.id && !swiped.includes(u.id))
    .map((u) => {
      const pSkills = u.skills || [];
      const sharedSkills = pSkills.filter((s) => userSkills.includes(s));
      let score = sharedSkills.length * 25;
      if (u.college === userCollege) score += 20;
      if (u.goal === userGoal) score += 15;
      score = Math.min(score, 98);

      const reasonParts = [];
      if (sharedSkills.length > 0) {
        reasonParts.push(`你们都有 ${sharedSkills.slice(0, 2).join("、")} 标签`);
      }
      if (u.college === userCollege) reasonParts.push("同学院优先推荐");
      if (u.goal === userGoal) reasonParts.push("目标一致");
      if (reasonParts.length === 0) reasonParts.push("技能互补，可能适合组队");

      return {
        id: u.id,
        name: u.name,
        avatar: u.name[0],
        college: u.college,
        grade: u.grade,
        skills: pSkills,
        goal: u.goal,
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

  const db = getDb();

  // 记录已划
  if (!db.swipedUsers) db.swipedUsers = [];
  if (!db.swipedUsers.includes(userId)) db.swipedUsers.push(userId);

  // 检查对方是否已对我右滑
  const existing = db.matches.find(
    (m) =>
      m.user_a === userId &&
      m.user_b === user.id &&
      m.status === "pending"
  );

  if (existing) {
    // 双向匹配！
    existing.status = "matched";

    const targetUser = db.users[userId];
    const matchId = existing.id;

    // 系统消息
    if (!db.messages[matchId]) db.messages[matchId] = [];
    db.messages[matchId].push({
      id: "msg_" + crypto.randomUUID().slice(0, 8),
      senderId: user.id,
      text: "你们成功匹配了！现在可以开始对话，一起组队吧",
      time: formatTime(),
    });

    saveDb(db);

    return {
      match: { ...existing, status: "matched" },
      targetUser: targetUser
        ? {
            id: userId,
            name: targetUser.name,
            avatar: targetUser.name[0],
            college: targetUser.college || "",
          }
        : { id: userId, name: "队友", avatar: "队", college: "" },
    };
  }

  // 单向右滑：插入 pending
  const newMatch = {
    id: "match_" + crypto.randomUUID().slice(0, 8),
    user_a: user.id,
    user_b: userId,
    status: "pending",
  };
  db.matches.push(newMatch);
  saveDb(db);

  return { match: newMatch, targetUser: null, isPending: true };
}

export async function swipeLeft(userId) {
  const db = getDb();
  if (!db.swipedUsers) db.swipedUsers = [];
  if (!db.swipedUsers.includes(userId)) db.swipedUsers.push(userId);
  saveDb(db);
}

// ---- 对话 ----

export async function getConversation(matchId) {
  const db = getDb();
  const msgs = db.messages[matchId] || [];
  const user = await getCurrentUser();

  return msgs.map((m) => ({
    id: m.id,
    sender: m.senderId === user?.id ? "me" : "other",
    text: m.text,
    time: m.time,
  }));
}

export async function sendMessage(matchId, text) {
  const user = await getCurrentUser();
  if (!user) throw new Error("未登录");

  const db = getDb();

  if (!db.messages[matchId]) db.messages[matchId] = [];

  const msg = {
    id: "msg_" + crypto.randomUUID().slice(0, 8),
    senderId: user.id,
    text,
    time: formatTime(),
  };
  db.messages[matchId].push(msg);
  saveDb(db);

  // 模拟对方自动回复（1.5 秒后）
  setTimeout(() => {
    const db2 = getDb();
    const match = db2.matches.find((m) => m.id === matchId);
    if (!match) return;

    const otherId =
      match.user_a === user.id ? match.user_b : match.user_a;
    const otherUser = db2.users[otherId];
    const otherName = otherUser?.name || "队友";

    const replies = [
      "好的！" + otherName + "收到",
      "没问题👍，我们一起加油",
      "可以的，这个我比较擅长",
      "大概什么时候开始？",
      "有具体分工吗？",
      "好的，我先准备一下",
      "太棒了，期待合作！",
      "你那边进度怎么样了？",
    ];
    const reply = {
      id: "msg_" + crypto.randomUUID().slice(0, 8),
      senderId: otherId,
      text: replies[Math.floor(Math.random() * replies.length)],
      time: formatTime(),
    };

    if (!db2.messages[matchId]) db2.messages[matchId] = [];
    db2.messages[matchId].push(reply);
    saveDb(db2);

    // 通知 Chat 页面有新消息
    window.dispatchEvent(
      new CustomEvent("campus-new-message", {
        detail: {
          matchId,
          id: reply.id,
          senderId: otherId,
          text: reply.text,
          time: reply.time,
        },
      })
    );
  }, 1500);

  return {
    id: msg.id,
    sender: "me",
    text: msg.text,
    time: msg.time,
  };
}

// ---- Realtime 订阅（事件驱动模拟） ----

export function subscribeMessages(matchId, currentUserId, onNewMessage) {
  const handler = (e) => {
    if (e.detail.matchId === matchId && e.detail.senderId !== currentUserId) {
      onNewMessage({
        id: e.detail.id,
        sender: "other",
        text: e.detail.text,
        time: e.detail.time,
      });
    }
  };
  window.addEventListener("campus-new-message", handler);
  return {
    unsubscribe: () =>
      window.removeEventListener("campus-new-message", handler),
  };
}

// ---- 项目 ----

export async function createProject(matchId, targetUserName) {
  const user = await getCurrentUser();
  if (!user) throw new Error("未登录");

  const db = getDb();

  const match = db.matches.find((m) => m.id === matchId);
  if (!match) throw new Error("匹配不存在");

  const targetUserId =
    match.user_a === user.id ? match.user_b : match.user_a;

  const projectId = "proj_" + crypto.randomUUID().slice(0, 8);

  const project = {
    id: projectId,
    name: `${user.name} 和 ${targetUserName} 的项目`,
    created_by: user.id,
    match_id: matchId,
  };

  db.projects[projectId] = project;

  db.tasks[projectId] = [
    {
      id: "task_" + crypto.randomUUID().slice(0, 8),
      title: "确定项目方向和目标",
      status: "todo",
      assignee: "未分配",
      due: "待定",
    },
    {
      id: "task_" + crypto.randomUUID().slice(0, 8),
      title: "分工认领任务",
      status: "todo",
      assignee: "未分配",
      due: "待定",
    },
  ];

  saveDb(db);

  return {
    ...project,
    members: [
      { id: user.id, name: user.name },
      { id: targetUserId, name: targetUserName },
    ],
    tasks: db.tasks[projectId],
  };
}

export async function getProject(projectId) {
  const db = getDb();
  const project = db.projects[projectId];
  if (!project) return null;

  const tasks = db.tasks[projectId] || [];

  // 从 users 表获取成员名
  const memberIds = [project.created_by];
  const match = db.matches.find((m) => m.id === project.match_id);
  if (match) {
    const other =
      match.user_a === project.created_by ? match.user_b : match.user_a;
    memberIds.push(other);
  }

  const members = memberIds.map((uid) => {
    const u = db.users[uid];
    return { id: uid, name: u?.name || "未知" };
  });

  return {
    ...project,
    members,
    tasks: tasks.map((t) => ({
      id: t.id,
      title: t.title,
      assignee: t.assignee || "未分配",
      due: t.due || "待定",
      status: t.status,
    })),
  };
}

export async function updateTask(projectId, taskId, updates) {
  const db = getDb();
  const tasks = db.tasks[projectId];
  if (!tasks) throw new Error("项目不存在");

  const task = tasks.find((t) => t.id === taskId);
  if (!task) throw new Error("任务不存在");

  if (updates.status) task.status = updates.status;
  if (updates.title) task.title = updates.title;
  if (updates.assignee) task.assignee = updates.assignee;

  db.tasks[projectId] = tasks;
  saveDb(db);

  return {
    id: task.id,
    title: task.title,
    assignee: task.assignee || "未分配",
    due: task.due || "待定",
    status: task.status,
  };
}

export async function addTask(projectId, title) {
  const db = getDb();

  if (!db.tasks[projectId]) db.tasks[projectId] = [];

  const task = {
    id: "task_" + crypto.randomUUID().slice(0, 8),
    title,
    status: "todo",
    assignee: "未分配",
    due: "待定",
  };

  db.tasks[projectId].push(task);
  saveDb(db);

  return {
    id: task.id,
    title: task.title,
    assignee: task.assignee,
    due: task.due,
    status: task.status,
  };
}

// ---- 招募广场 ----

export async function getRecruitments(filters = {}) {
  const db = getDb();
  let list = db.recruitments || [];

  if (filters.college && filters.college !== "全部学院") {
    list = list.filter((r) => r.college === filters.college);
  }
  if (filters.skill && filters.skill !== "全部技能") {
    list = list.filter((r) => (r.skills || []).includes(filters.skill));
  }

  // 按创建时间降序（新的在前）
  list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  return list.map((r) => ({
    id: r.id,
    title: r.title,
    skills: r.skills || [],
    college: r.college || "",
    authorId: r.authorId,
    time: r.createdAt ? timeAgo(r.createdAt) : "",
    urgent: r.urgent || false,
  }));
}

function timeAgo(timestamp) {
  const diff = Date.now() - timestamp;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "刚刚";
  if (hours < 24) return `${hours} 小时前`;
  return `${Math.floor(hours / 24)} 天前`;
}

export async function addRecruitment({ title, skills, college }) {
  const user = await getCurrentUser();
  if (!user) throw new Error("未登录");

  const db = getDb();
  const item = {
    id: "rec_" + crypto.randomUUID().slice(0, 8),
    title,
    skills,
    college: college || user.college || "",
    authorId: user.id,
    authorName: user.name,
    createdAt: Date.now(),
    urgent: false,
  };

  if (!db.recruitments) db.recruitments = [];
  db.recruitments.push(item);
  saveDb(db);

  return {
    id: item.id,
    title: item.title,
    skills: item.skills,
    college: item.college,
    authorId: item.authorId,
    time: "刚刚",
    urgent: false,
  };
}
