import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Plus, X } from "@phosphor-icons/react";
import { useAuth } from "../context/AuthContext";
import { registerUser } from "../lib/dataStore";

const skillOptions = [
  "Python", "Java", "C++", "JavaScript", "React", "Vue",
  "Spring Boot", "MySQL", "机器学习", "数据分析",
  "PS", "AI", "Figma", "UI设计", "动画", "剪辑", "摄影",
  "PPT", "Excel", "写作", "文案", "演讲", "商业计划书",
  "CAD", "机器人工程", "嵌入式开发", "单片机", "网络安全",
  "英语", "日语", "翻译", "金融分析", "法律检索",
];

const goalOptions = [
  { key: "study", label: "找到学习搭子" },
  { key: "competition", label: "组队参加比赛" },
  { key: "thesis", label: "找毕设队友" },
  { key: "checkin", label: "日常打卡监督" },
];

const colleges = [
  "计算机科学学院",
  "机电学院",
  "自动化学院",
  "汽车与交通工程学院",
  "电子与信息学院",
  "光电工程学院",
  "数学与系统科学学院",
  "管理学院",
  "财经学院",
  "外国语学院",
  "文学与传媒学院",
  "法学与知识产权学院",
  "教育科学学院",
  "美术学院",
  "音乐学院",
  "网络空间安全学院",
  "数据科学与工程学院",
];

const grades = ["大一", "大二", "大三", "大四", "研一", "研二"];

export default function Register() {
  const navigate = useNavigate();
  const { user, signUp } = useAuth();

  // 已登录用户直接从技能步骤开始
  const [step, setStep] = useState(user ? 1 : 0);

  // 防止刷新后 step=0 但 user 已恢复 → 自动跳到 step 1
  useEffect(() => {
    if (user && step === 0) setStep(1);
  }, [user]);
  const [skills, setSkills] = useState([]);
  const [goal, setGoal] = useState(null);
  const [college, setCollege] = useState("");
  const [grade, setGrade] = useState("");
  const [saving, setSaving] = useState(false);
  const [slowHint, setSlowHint] = useState(false);
  const [error, setError] = useState("");

  // 仅新用户：邮箱 + 密码 + 姓名
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // 自定义技能标签
  const [customSkills, setCustomSkills] = useState([]);
  const [customInput, setCustomInput] = useState("");
  const allSkillOptions = [...skillOptions, ...customSkills];

  // 自定义目标
  const [customGoal, setCustomGoal] = useState("");
  const [customGoalActive, setCustomGoalActive] = useState(false);

  const totalSteps = 4;
  const displayTotal = 4;
  // 已登录用户自动完成 step 0（账号创建）
  const completedSteps = user ? 1 : 0;

  const toggleSkill = (s) => {
    if (skills.includes(s)) {
      setSkills(skills.filter((x) => x !== s));
    } else if (skills.length < 3) {
      setSkills([...skills, s]);
    }
  };

  const addCustomSkill = () => {
    const trimmed = customInput.trim();
    if (!trimmed) return;
    if (allSkillOptions.includes(trimmed)) {
      setCustomInput("");
      return;
    }
    setCustomSkills([...customSkills, trimmed]);
    // 自动选中
    if (skills.length < 3) {
      setSkills([...skills, trimmed]);
    }
    setCustomInput("");
  };

  const handleCustomKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCustomSkill();
    }
  };

  const canNext = () => {
    if (!user && step === 0) return name.trim().length >= 1 && email.includes("@") && email.includes(".") && password.length >= 6 && password === passwordConfirm;
    if ((user && step === 1) || (!user && step === 1)) return skills.length > 0;
    if ((user && step === 2) || (!user && step === 2)) return goal !== null || (customGoalActive && customGoal.trim().length > 0);
    if ((user && step === 3) || (!user && step === 3)) return college && grade;
    return false;
  };

  const handleNext = async () => {
    // Step 0: 创建本地账号
    if (!user && step === 0) {
      setError("");
      setSaving(true);
      setSlowHint(false);
      // 冷启动提示：Supabase 免费计划首次请求需唤醒数据库（8-30 秒）
      const slowTimer = setTimeout(() => setSlowHint(true), 8000);
      try {
        await signUp(email, password, name.trim());
        clearTimeout(slowTimer);
        setSaving(false);
        setStep(step + 1);
      } catch (err) {
        clearTimeout(slowTimer);
        setSaving(false);
        setSlowHint(false);
        const msg = err?.message || (err instanceof Error ? err.message : "") || "注册失败，请重试";
        if (typeof msg === "string" && msg.includes("已被注册")) {
          setError("该邮箱已被注册，请直接登录");
        } else if (typeof msg === "string" && msg.includes("already registered")) {
          setError("该邮箱已被注册，请直接登录");
        } else if (typeof msg === "string" && msg.includes("Password")) {
          setError("密码长度至少 6 位");
        } else {
          setError(typeof msg === "string" ? msg : "注册失败，请重试");
        }
        return;
      }
    } else {
      setStep(step + 1);
    }
  };

  const handleFinish = async () => {
    setSaving(true);
    setSlowHint(false);
    setError("");

    const slowTimer = setTimeout(() => setSlowHint(true), 8000);
    try {
      const finalGoal = customGoalActive ? customGoal.trim() : goal;
      await registerUser({ skills, goal: finalGoal, college, grade });
      clearTimeout(slowTimer);

      navigate("/match");
    } catch (err) {
      clearTimeout(slowTimer);
      let msg = err?.message || (err instanceof Error ? err.message : "") || "保存失败，请重试";
      // Supabase 原始错误转中文
      if (typeof msg === "string") {
        if (msg.includes("coerce") || msg.includes("single JSON")) {
          msg = "保存资料失败，请刷新页面重试";
        } else if (msg.includes("row-level security") || msg.includes("RLS")) {
          msg = "权限不足，请重新登录后再试";
        }
      }
      setError(typeof msg === "string" ? msg : "保存失败，请重试");
      console.error("注册保存失败:", err);
    } finally {
      setSaving(false);
    }
  };

  // 进度条——始终 4 步
  const progressSteps = [1, 2, 3, 4];
  const currentDisplayStep = step + 1;

  return (
    <div className="max-w-[680px] mx-auto px-6 py-12 relative">
      {/* 背景装饰 */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
        backgroundImage: "radial-gradient(circle, #0d9488 1px, transparent 1px)",
        backgroundSize: "24px 24px"
      }} />

      {/* 步骤名 */}
      <div className="text-center mb-2">
        <span className="text-sm font-medium text-accent-600">
          {!user && step === 0 && "创建账号"}
          {step === 1 && "选择技能"}
          {step === 2 && "确定目标"}
          {step === 3 && "学院与年级"}
        </span>
      </div>

      {/* Progress */}
      <div className="mb-10">
        <div className="flex items-center gap-2">
          {progressSteps.map((n, i) => (
            <div key={n} className="flex items-center gap-2 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  currentDisplayStep >= n
                    ? "bg-accent-600 text-white"
                    : "bg-[#e7e5e4] text-[#78716c]"
                }`}
              >
                {n}
              </div>
              {i < progressSteps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 rounded transition-colors ${
                    currentDisplayStep > n ? "bg-accent-600" : "bg-[#e7e5e4]"
                  }`}
                />
              )}
            </div>
          ))}
          <span className="text-sm text-[#78716c] ml-2">
            {currentDisplayStep}/{displayTotal}
          </span>
        </div>
        {/* 步骤标签 */}
        <div className="flex mt-2 text-[11px] text-[#a8a29e]">
          {["账号", "技能", "目标", "学院"].map((label, i) => (
            <span key={label} className="flex-1 text-center">{label}</span>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Step 0: 创建账号（仅新用户） */}
      {!user && step === 0 && (
        <div>
          <h2 className="font-display text-2xl font-bold text-[#1c1917]">
            创建你的账号
          </h2>
          <p className="mt-1 text-sm text-[#78716c]">
            注册后即可开始匹配队友
          </p>
          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1c1917] mb-1.5">
                你的姓名
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="怎么称呼你？"
                maxLength={20}
                className="w-full px-4 py-3 rounded-lg border border-[#e7e5e4] bg-white text-[#1c1917] text-sm placeholder:text-[#a8a29e] focus:outline-none focus:ring-2 focus:ring-accent-400 transition-shadow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1c1917] mb-1.5">
                邮箱
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="yourname@example.com"
                className="w-full px-4 py-3 rounded-lg border border-[#e7e5e4] bg-white text-[#1c1917] text-sm placeholder:text-[#a8a29e] focus:outline-none focus:ring-2 focus:ring-accent-400 transition-shadow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1c1917] mb-1.5">
                密码
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="至少 6 位字符"
                  className="w-full px-4 py-3 pr-12 rounded-lg border border-[#e7e5e4] bg-white text-[#1c1917] text-sm placeholder:text-[#a8a29e] focus:outline-none focus:ring-2 focus:ring-accent-400 transition-shadow"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a8a29e] hover:text-[#78716c] text-xs font-medium transition-colors"
                >
                  {showPassword ? "隐藏" : "显示"}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1c1917] mb-1.5">
                确认密码
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
                placeholder="再次输入密码"
                className={`w-full px-4 py-3 rounded-lg border bg-white text-[#1c1917] text-sm placeholder:text-[#a8a29e] focus:outline-none focus:ring-2 focus:ring-accent-400 transition-shadow ${
                  passwordConfirm && password !== passwordConfirm
                    ? "border-red-300 ring-1 ring-red-200"
                    : "border-[#e7e5e4]"
                }`}
              />
              {passwordConfirm && password !== passwordConfirm && (
                <p className="mt-1 text-xs text-red-500">两次输入的密码不一致</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 1: Skills */}
      {((user && step === 1) || (!user && step === 1)) && (
        <div>
          <h2 className="font-display text-2xl font-bold text-[#1c1917]">
            选 1-3 个你最擅长的技能
          </h2>
          <p className="mt-1 text-sm text-[#78716c]">
            已选 {skills.length}/3，至少选 1 个
          </p>

          {/* 预设标签 */}
          <div className="mt-6 flex flex-wrap gap-2">
            {allSkillOptions.map((s) => {
              const active = skills.includes(s);
              return (
                <button
                  key={s}
                  onClick={() => toggleSkill(s)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all active:scale-95 ${
                    active
                      ? "bg-accent-100 text-accent-700 border-accent-300"
                      : "bg-white text-[#78716c] border-[#e7e5e4] hover:border-[#a8a29e]"
                  }`}
                >
                  {s}
                  {customSkills.includes(s) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCustomSkills(customSkills.filter((x) => x !== s));
                        setSkills(skills.filter((x) => x !== s));
                      }}
                      className="ml-1.5 inline-flex items-center text-accent-500 hover:text-red-500"
                      title="删除自定义标签"
                    >
                      <X size={12} weight="bold" />
                    </button>
                  )}
                </button>
              );
            })}
          </div>

          {/* 自定义标签输入 */}
          <div className="mt-4 flex items-center gap-2">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={handleCustomKeyDown}
              placeholder="输入自定义技能，按回车添加"
              className="flex-1 px-4 py-2.5 text-sm rounded-lg border border-[#e7e5e4] bg-white text-[#1c1917] placeholder:text-[#a8a29e] focus:outline-none focus:ring-2 focus:ring-accent-400 transition-shadow"
            />
            <button
              onClick={addCustomSkill}
              disabled={!customInput.trim()}
              className="inline-flex items-center gap-1 px-4 py-2.5 text-sm font-medium text-accent-600 bg-accent-50 rounded-lg border border-accent-200 hover:bg-accent-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Plus size={16} />
              添加
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Goal */}
      {((user && step === 2) || (!user && step === 2)) && (
        <div>
          <h2 className="font-display text-2xl font-bold text-[#1c1917]">
            你当前的目标是什么？
          </h2>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {goalOptions.map((g) => {
              const active = goal === g.key;
              return (
                <button
                  key={g.key}
                  onClick={() => { setGoal(g.key); setCustomGoalActive(false); }}
                  className={`p-4 rounded-xl border text-left transition-all active:scale-[0.98] ${
                    active
                      ? "bg-accent-100 text-accent-700 border-accent-400"
                      : "bg-white text-[#1c1917] border-[#e7e5e4] hover:border-[#a8a29e]"
                  }`}
                >
                  <span className="font-semibold">{g.label}</span>
                </button>
              );
            })}
            {/* 自定义目标 */}
            <button
              onClick={() => { setCustomGoalActive(true); setGoal(null); }}
              className={`p-4 rounded-xl border text-left transition-all active:scale-[0.98] ${
                customGoalActive
                  ? "bg-accent-100 text-accent-700 border-accent-400"
                  : "bg-white text-[#1c1917] border-[#e7e5e4] hover:border-[#a8a29e]"
              }`}
            >
              <span className="font-semibold">✏️ 自定义目标…</span>
            </button>
          </div>
          {customGoalActive && (
            <div className="mt-3 flex items-center gap-2">
              <input
                type="text"
                value={customGoal}
                onChange={(e) => setCustomGoal(e.target.value)}
                placeholder="输入你的目标，如：考公准备、出国留学…"
                className="flex-1 px-4 py-2.5 text-sm rounded-lg border border-[#e7e5e4] bg-white text-[#1c1917] placeholder:text-[#a8a29e] focus:outline-none focus:ring-2 focus:ring-accent-400 transition-shadow"
              />
              <button
                onClick={() => { setCustomGoal(""); setCustomGoalActive(false); }}
                className="px-3 py-2.5 text-sm text-[#78716c] hover:text-[#1c1917] transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 3: School info */}
      {((user && step === 3) || (!user && step === 3)) && (
        <div>
          <h2 className="font-display text-2xl font-bold text-[#1c1917]">
            学院 / 年级
          </h2>
          <p className="mt-1 text-sm text-[#78716c]">
            帮你找到身边的队友
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <select
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg border border-[#e7e5e4] bg-white text-[#1c1917] text-sm focus:outline-none focus:ring-2 focus:ring-accent-400"
            >
              <option value="">选择学院</option>
              {colleges.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg border border-[#e7e5e4] bg-white text-[#1c1917] text-sm focus:outline-none focus:ring-2 focus:ring-accent-400"
            >
              <option value="">选择年级</option>
              {grades.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="mt-10 flex items-center justify-between">
        {step > (user ? 1 : 0) ? (
          <button
            onClick={() => setStep(step - 1)}
            className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-[#78716c] rounded-full hover:text-[#1c1917] transition-colors"
          >
            <ArrowLeft size={16} /> 上一步
          </button>
        ) : (
          <div />
        )}

        <p className="text-sm text-[#78716c]">
          已有账号？{" "}
          <Link to="/login" className="text-accent-600 font-medium hover:underline">
            去登录
          </Link>
        </p>

        {((user && step < 3) || (!user && step < 3)) ? (
          <button
            disabled={!canNext() || saving}
            onClick={handleNext}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-accent-600 rounded-full disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent-700 active:scale-[0.98] transition-all"
          >
            {saving ? (slowHint ? "服务器启动中..." : "创建中...") : "下一步"}
            {!saving && <ArrowRight size={16} weight="bold" />}
          </button>
        ) : (
          <button
            disabled={!canNext() || saving}
            onClick={handleFinish}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-accent-600 rounded-full disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent-700 active:scale-[0.98] transition-all"
          >
            {saving ? (slowHint ? "服务器启动中..." : "保存中...") : "完成，开始匹配"}
            {!saving && <ArrowRight size={16} weight="bold" />}
          </button>
        )}
      </div>
    </div>
  );
}
