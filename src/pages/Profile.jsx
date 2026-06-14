import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, PencilSimple, FloppyDisk, X, Plus, Camera } from "@phosphor-icons/react";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "../lib/dataStore";
import { uploadAvatar } from "../lib/storage";
import Avatar from "../components/Avatar";
import toast from "../lib/toast";

const skillOptions = [
  "Python", "Java", "C++", "JavaScript", "React", "Vue",
  "Spring Boot", "MySQL", "机器学习", "数据分析",
  "PS", "AI", "Figma", "UI设计", "动画", "剪辑", "摄影",
  "PPT", "Excel", "写作", "文案", "演讲", "商业计划书",
  "CAD", "机器人工程", "嵌入式开发", "单片机", "网络安全",
  "英语", "日语", "翻译", "金融分析", "法律检索",
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

const grades = ["大一", "大二", "大三", "大四"];

const goalOptions = [
  "组队参加比赛",
  "做大创项目",
  "做课设项目",
  "日常打卡监督",
];

export default function Profile() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [formName, setFormName] = useState("");
  const [formCollege, setFormCollege] = useState("");
  const [formGrade, setFormGrade] = useState("");
  const [formSkills, setFormSkills] = useState([]);
  const [formGoal, setFormGoal] = useState("");
  const [formWechat, setFormWechat] = useState("");

  // Custom skill input
  const [customSkills, setCustomSkills] = useState([]);
  const [customInput, setCustomInput] = useState("");
  const allSkillOptions = [...skillOptions, ...customSkills];

  // Avatar upload
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || null);

  // Snapshot for cancel
  const [snapshot, setSnapshot] = useState(null);

  // Initialize form from user data when user loads or changes
  useEffect(() => {
    if (user) {
      setFormName(user.name || "");
      setFormCollege(user.college || "");
      setFormGrade(user.grade || "");
      setFormSkills(user.skills || []);
      setFormGoal(user.goal || "");
      setFormWechat(user.wechat || "");
      // Derive custom skills: skills that aren't in the preset list
      const userCustomSkills = (user.skills || []).filter(
        (s) => !skillOptions.includes(s)
      );
      setCustomSkills(userCustomSkills);
    }
  }, [user]);

  // Page-enter: scroll to top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Sync avatar URL from user context
  useEffect(() => {
    if (user?.avatar_url) {
      setAvatarUrl(user.avatar_url);
    }
  }, [user?.avatar_url]);

  const handleEdit = () => {
    setSnapshot({
      name: formName,
      college: formCollege,
      grade: formGrade,
      skills: [...formSkills],
      goal: formGoal,
      wechat: formWechat,
    });
    setError("");
    setEditing(true);
  };

  const handleCancel = () => {
    if (snapshot) {
      setFormName(snapshot.name);
      setFormCollege(snapshot.college);
      setFormGrade(snapshot.grade);
      setFormSkills([...snapshot.skills]);
      setFormGoal(snapshot.goal);
      setFormWechat(snapshot.wechat);
      setCustomSkills(
        snapshot.skills.filter((s) => !skillOptions.includes(s))
      );
    }
    setError("");
    setEditing(false);
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      setError("请填写姓名");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await updateProfile({
        name: formName.trim(),
        college: formCollege,
        grade: formGrade,
        skills: formSkills,
        goal: formGoal,
        wechat: formWechat.trim(),
      });
      toast.success("资料已保存");
      setEditing(false);
      setSnapshot(null);
    } catch (err) {
      const msg = err?.message || "保存失败，请重试";
      setError(typeof msg === "string" ? msg : "保存失败，请重试");
    } finally {
      setSaving(false);
    }
  };

  const toggleSkill = (s) => {
    if (formSkills.includes(s)) {
      setFormSkills(formSkills.filter((x) => x !== s));
    } else if (formSkills.length < 3) {
      setFormSkills([...formSkills, s]);
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
    if (formSkills.length < 3) {
      setFormSkills([...formSkills, trimmed]);
    }
    setCustomInput("");
  };

  const handleCustomKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCustomSkill();
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarUploading(true);
    try {
      const url = await uploadAvatar(file, user.id);
      await updateProfile({ avatar_url: url });
      setAvatarUrl(url);
      toast.success("头像已更新");
    } catch (err) {
      toast.error(err?.message || "头像上传失败");
    } finally {
      setAvatarUploading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-accent-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-[680px] mx-auto px-6 py-12 page-enter">
        <div className="rounded-2xl border border-[#e7e5e4] bg-white p-10 text-center">
          <p className="text-[#78716c] text-sm">请先登录后查看个人主页</p>
          <button
            onClick={() => navigate("/login")}
            className="mt-4 inline-flex items-center px-6 py-3 text-sm font-semibold text-white bg-accent-600 rounded-full hover:bg-accent-700 active:scale-[0.98] transition-all"
          >
            去登录
          </button>
        </div>
      </div>
    );
  }

  const displayName = user.name || user.email?.split("@")[0] || "";
  const initial = (displayName || "?")[0];

  return (
    <div className="max-w-[680px] mx-auto px-6 py-12 page-enter">
      {/* Display Mode */}
      {!editing && (
        <div className="rounded-2xl border border-[#e7e5e4] bg-white p-8">
          {/* Avatar + Name row */}
          <div className="flex items-start gap-5">
            <label className="relative cursor-pointer group flex-shrink-0 active:scale-[0.98] transition-transform">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
                disabled={avatarUploading}
              />

              {avatarUploading ? (
                <div
                  className="w-16 h-16 rounded-full bg-accent-100 flex items-center justify-center"
                  style={{ minWidth: "64px", minHeight: "64px" }}
                >
                  <div className="w-6 h-6 border-2 border-accent-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <Avatar user={{ ...user, avatar_url: avatarUrl }} size={64} />
              )}

              {/* Hover overlay with camera icon */}
              <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                <Camera
                  size={20}
                  weight="bold"
                  className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
            </label>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-[#1c1917] truncate">
                {displayName}
              </h1>
              {(formCollege || formGrade) && (
                <p className="mt-1 text-sm text-[#78716c]">
                  {[formCollege, formGrade].filter(Boolean).join(" · ")}
                </p>
              )}
              {!avatarUrl && !avatarUploading && (
                <p className="mt-1 text-xs text-[#a8a29e]">
                  点击上传头像
                </p>
              )}
            </div>
          </div>

          {/* Skills */}
          {formSkills.length > 0 && (
            <div className="mt-6">
              <p className="text-xs font-medium text-[#a8a29e] mb-2">技能</p>
              <div className="flex flex-wrap gap-2">
                {formSkills.map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1 text-sm font-medium bg-accent-100 text-accent-700 rounded-full"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Goal */}
          {formGoal && (
            <div className="mt-5">
              <p className="text-xs font-medium text-[#a8a29e] mb-1">目标</p>
              <p className="text-sm text-[#1c1917]">{formGoal}</p>
            </div>
          )}

          {/* Wechat */}
          {formWechat && (
            <div className="mt-5">
              <p className="text-xs font-medium text-[#a8a29e] mb-1">微信</p>
              <p className="text-sm text-[#1c1917]">{formWechat}</p>
            </div>
          )}

          {/* Edit button */}
          <div className="mt-8">
            <button
              onClick={handleEdit}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-accent-600 rounded-full hover:bg-accent-700 active:scale-[0.98] transition-all"
            >
              <PencilSimple size={16} weight="bold" />
              编辑资料
            </button>
          </div>
        </div>
      )}

      {/* Edit Mode */}
      {editing && (
        <div className="rounded-2xl border border-[#e7e5e4] bg-white p-8">
          <h2 className="text-xl font-bold text-[#1c1917] mb-6">
            编辑个人资料
          </h2>

          {/* Error */}
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-[#1c1917] mb-1.5">
                姓名
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="你的姓名"
                maxLength={20}
                className="w-full px-4 py-3 rounded-lg border border-[#e7e5e4] bg-white text-[#1c1917] text-sm placeholder:text-[#a8a29e] focus:outline-none focus:ring-2 focus:ring-accent-400 transition-shadow"
              />
            </div>

            {/* College */}
            <div>
              <label className="block text-sm font-medium text-[#1c1917] mb-1.5">
                学院
              </label>
              <select
                value={formCollege}
                onChange={(e) => setFormCollege(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-[#e7e5e4] bg-white text-[#1c1917] text-sm focus:outline-none focus:ring-2 focus:ring-accent-400"
              >
                <option value="">选择学院</option>
                {colleges.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Grade */}
            <div>
              <label className="block text-sm font-medium text-[#1c1917] mb-1.5">
                年级
              </label>
              <select
                value={formGrade}
                onChange={(e) => setFormGrade(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-[#e7e5e4] bg-white text-[#1c1917] text-sm focus:outline-none focus:ring-2 focus:ring-accent-400"
              >
                <option value="">选择年级</option>
                {grades.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-[#1c1917] mb-1.5">
                技能 <span className="text-[#a8a29e] font-normal">(最多 3 个)</span>
              </label>
              <p className="text-xs text-[#a8a29e] mb-3">
                已选 {formSkills.length}/3
              </p>
              <div className="flex flex-wrap gap-2">
                {allSkillOptions.map((s) => {
                  const active = formSkills.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
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
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCustomSkills(customSkills.filter((x) => x !== s));
                            setFormSkills(formSkills.filter((x) => x !== s));
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
              {/* Custom skill input */}
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={handleCustomKeyDown}
                  placeholder="输入自定义技能，按回车添加"
                  className="flex-1 px-4 py-2.5 text-sm rounded-lg border border-[#e7e5e4] bg-white text-[#1c1917] placeholder:text-[#a8a29e] focus:outline-none focus:ring-2 focus:ring-accent-400 transition-shadow"
                />
                <button
                  type="button"
                  onClick={addCustomSkill}
                  disabled={!customInput.trim()}
                  className="inline-flex items-center gap-1 px-4 py-2.5 text-sm font-medium text-accent-600 bg-accent-50 rounded-lg border border-accent-200 hover:bg-accent-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus size={16} />
                  添加
                </button>
              </div>
            </div>

            {/* Goal */}
            <div>
              <label className="block text-sm font-medium text-[#1c1917] mb-1.5">
                目标
              </label>
              <select
                value={formGoal}
                onChange={(e) => setFormGoal(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-[#e7e5e4] bg-white text-[#1c1917] text-sm focus:outline-none focus:ring-2 focus:ring-accent-400"
              >
                <option value="">选择目标</option>
                {goalOptions.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            {/* Wechat */}
            <div>
              <label className="block text-sm font-medium text-[#1c1917] mb-1.5">
                微信
              </label>
              <input
                type="text"
                value={formWechat}
                onChange={(e) => setFormWechat(e.target.value)}
                placeholder="选填，方便队友联系"
                className="w-full px-4 py-3 rounded-lg border border-[#e7e5e4] bg-white text-[#1c1917] text-sm placeholder:text-[#a8a29e] focus:outline-none focus:ring-2 focus:ring-accent-400 transition-shadow"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-8 flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-accent-600 rounded-full hover:bg-accent-700 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
            >
              <FloppyDisk size={16} weight="bold" />
              {saving ? "保存中..." : "保存"}
            </button>
            <button
              onClick={handleCancel}
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-[#78716c] rounded-full border border-[#e7e5e4] hover:text-[#1c1917] hover:border-[#a8a29e] disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
            >
              <X size={16} weight="bold" />
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
