import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MagnifyingGlass, Plus, CaretDown, Fire, X, Megaphone, PushPin, Crown } from "@phosphor-icons/react";
import { getRecruitments, addRecruitment, subscribeRecruitments, contactAuthor, deleteRecruitment, boostPost } from "../lib/dataStore";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "../lib/toast";
import ADS from "../data/ads";

const colleges = [
  "全部学院",
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
const skillFilters = [
  "全部技能",
  "Python", "Java", "C++", "JavaScript", "React", "Vue",
  "Spring Boot", "MySQL", "机器学习", "数据分析",
  "PS", "AI", "Figma", "UI设计", "动画", "剪辑", "摄影",
  "PPT", "Excel", "写作", "文案", "演讲", "商业计划书",
  "CAD", "机器人工程", "嵌入式开发", "单片机", "网络安全",
  "英语", "日语", "翻译", "金融分析", "法律检索",
];

export default function Square() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [collegeFilter, setCollegeFilter] = useState("全部学院");
  const [skillFilter, setSkillFilter] = useState("全部技能");
  const [search, setSearch] = useState("");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 发布招募表单
  const [showCreate, setShowCreate] = useState(false);
  const [createTitle, setCreateTitle] = useState("");
  const [createSkills, setCreateSkills] = useState([]);
  const [createSkillInput, setCreateSkillInput] = useState("");
  const [createCollege, setCreateCollege] = useState("");
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [boostModalPost, setBoostModalPost] = useState(null);
  const [boostConfirming, setBoostConfirming] = useState(false);

  // 加载招募帖（竞态保护 + 刷新回调）
  const loadPosts = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const data = await getRecruitments({
        college: collegeFilter,
        skill: skillFilter,
      });
      setPosts(data);
    } catch (e) {
      console.error("Square loadPosts failed:", e);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await getRecruitments({
          college: collegeFilter,
          skill: skillFilter,
        });
        if (!cancelled) setPosts(data);
      } catch (e) {
        console.error("Square loadPosts failed:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [collegeFilter, skillFilter]);

  // Realtime 订阅：新帖自动刷新（去重）
  useEffect(() => {
    const channel = subscribeRecruitments(
      // INSERT：新帖自动加入列表
      (newPost) => {
        setPosts((prev) => {
          if (prev.some((p) => p.id === newPost.id)) return prev;
          return [newPost, ...prev];
        });
      },
      // UPDATE：置顶/加急状态实时同步到所有在线用户
      (updatedPost) => {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === updatedPost.id
              ? { ...p, boosted: updatedPost.boosted, boost_level: updatedPost.boost_level, boosted_until: updatedPost.boosted_until, urgent: updatedPost.urgent }
              : p
          )
        );
      }
    );
    return () => channel.unsubscribe();
  }, []);

  const handlePublish = async () => {
    if (!createTitle.trim() || createSkills.length === 0) return;
    setCreateSubmitting(true);
    try {
      const newPost = await addRecruitment({
        title: createTitle.trim(),
        skills: createSkills,
        college: createCollege || (user?.college) || "计算机科学学院",
      });
      toast.success("招募已发布");
      // 手动添加到列表顶部，Realtime 回调会去重跳过
      setPosts((prev) => [newPost, ...prev]);
      setShowCreate(false);
      setCreateTitle("");
      setCreateSkills([]);
      setCreateSkillInput("");
      setCreateCollege("");
    } catch (e) {
      toast.error(e?.message || "发布失败，请重试");
      console.error("handlePublish failed:", e);
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handleBoost = async (level) => {
    if (!boostModalPost) return;
    setBoostConfirming(true);
    try {
      await boostPost(boostModalPost.id, level);
      // 乐观更新：直接改本地状态，不等 Supabase 刷新
      setPosts((prev) =>
        prev.map((p) =>
          p.id === boostModalPost.id
            ? { ...p, boosted: true, boost_level: level, boosted_until: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() }
            : p
        )
      );
      toast.success(level === 'super' ? "已设置超级置顶" : "已设置标准置顶");
      setBoostModalPost(null);
    } catch (e) {
      toast.error(e?.message || "置顶失败");
    } finally {
      setBoostConfirming(false);
    }
  };

  const handleCardClick = async (post) => {
    if (!user) {
      window.location.href = "/#/login";
      return;
    }
    if (post.authorId === user.id) return; // 不联系自己
    try {
      const matchId = await contactAuthor(post.authorId);
      navigate(`/chat/${matchId}`);
    } catch (e) {
      console.error("联系失败:", e);
    }
  };

  const addCreateSkill = () => {
    const s = createSkillInput.trim();
    if (!s || createSkills.includes(s)) {
      setCreateSkillInput("");
      return;
    }
    setCreateSkills([...createSkills, s]);
    setCreateSkillInput("");
  };

  const filteredPosts = posts.filter((p) => {
    if (!search.trim()) return true;
    return (
      p.title.includes(search.trim()) ||
      p.skills.some((s) => s.includes(search.trim()))
    );
  });

  // 每5条普通帖后插入1条推广摘要（前3条广告轮换）
  const adsForFeed = ADS.slice(0, 3);
  const postsWithAds = filteredPosts.flatMap((p, i) => {
    const items = [p];
    if ((i + 1) % 5 === 0 && i < filteredPosts.length - 1) {
      const ad = adsForFeed[Math.floor(i / 5) % adsForFeed.length];
      items.push({ type: "ad", ...ad });
    }
    return items;
  });

  return (
    <div className="max-w-[960px] mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-[#1c1917]">
          招募广场
        </h1>
        <button
          onClick={() => {
            if (!user) {
              window.location.href = "/#/login";
              return;
            }
            setShowCreate(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-accent-600 rounded-full no-underline hover:bg-accent-700 active:scale-[0.98] transition-all"
        >
          <Plus size={16} weight="bold" />
          发布需求
        </button>
      </div>

      {/* Filter bar */}
      <div className="sticky top-16 z-30 bg-[#fafaf9]/90 backdrop-blur-sm -mx-6 px-6 py-3 border-b border-[#e7e5e4] mb-4">
        <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <select
            value={collegeFilter}
            onChange={(e) => setCollegeFilter(e.target.value)}
            className="appearance-none pl-4 pr-10 py-2 text-sm rounded-full border border-[#e7e5e4] bg-white text-[#1c1917] focus:outline-none focus:ring-2 focus:ring-accent-300"
          >
            {colleges.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <CaretDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78716c] pointer-events-none" />
        </div>
        <div className="relative">
          <select
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            className="appearance-none pl-4 pr-10 py-2 text-sm rounded-full border border-[#e7e5e4] bg-white text-[#1c1917] focus:outline-none focus:ring-2 focus:ring-accent-300"
          >
            {skillFilters.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <CaretDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78716c] pointer-events-none" />
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <MagnifyingGlass size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#78716c]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索招募帖..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-full border border-[#e7e5e4] bg-white text-[#1c1917] placeholder-[#a8a29e] focus:outline-none focus:ring-2 focus:ring-accent-300"
          />
        </div>
        </div>
      </div>

      {/* Post grid */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-6 h-6 border-2 border-accent-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-accent-100 flex items-center justify-center">
            <MagnifyingGlass size={24} weight="bold" className="text-accent-600" />
          </div>
          <div className="text-[#78716c]">没有找到匹配的招募帖</div>
          <button
            onClick={() => {
              setCollegeFilter("全部学院");
              setSkillFilter("全部技能");
              setSearch("");
            }}
            className="mt-3 text-sm text-accent-600 hover:text-accent-700 font-medium"
          >
            清除筛选
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {postsWithAds.map((p) => {
            // 推广摘要卡片
            if (p.type === "ad") {
              return (
                <div
                  key={`ad-${p.id}`}
                  onClick={() => navigate("/ads")}
                  className="rounded-2xl border border-[#e7e5e4] bg-white p-5 hover:shadow-[0_4px_16px_rgba(28,25,23,0.08)] transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold text-warm-600 bg-warm-100 rounded-full">
                      <Megaphone size={11} weight="fill" /> 推广
                    </span>
                    <span className="text-xs text-[#a8a29e]">{p.category}</span>
                  </div>
                  <h3 className="font-semibold text-[#1c1917] mb-2">{p.brand} · {p.title}</h3>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {p.tags.map((t) => (
                      <span key={t} className="px-2 py-0.5 text-[11px] font-medium bg-stone-100 text-[#78716c] rounded-md">{t}</span>
                    ))}
                  </div>
                  <p className="text-sm text-[#78716c] italic leading-relaxed mb-3">
                    &ldquo;{p.review}&rdquo; - {p.reviewer}
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-[#e7e5e4]">
                    <span className="text-sm font-semibold text-accent-700">{p.price}</span>
                    <span className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-accent-600 rounded-full cursor-pointer whitespace-nowrap">{p.cta}</span>
                  </div>
                </div>
              );
            }

            // 普通招募帖
            const boostLevel = p.boosted ? (p.boost_level || 'standard') : null;
            const cardClassName = boostLevel === 'super'
              ? "rounded-2xl border border-[#e7e5e4] dark:border-warm-500/30 bg-gradient-to-b from-warm-50 to-white dark:from-warm-950 dark:to-slate-800 p-5 hover:shadow-[0_4px_16px_rgba(28,25,23,0.08)] transition-all group cursor-pointer ring-2 ring-warm-400 dark:ring-warm-500/30 shadow-[0_0_24px_rgba(249,115,22,0.2)] dark:shadow-[0_0_16px_rgba(249,115,22,0.18)]"
              : boostLevel === 'standard'
                ? "rounded-2xl border border-warm-400 dark:border-warm-500/50 bg-warm-50/30 dark:bg-warm-950/40 p-5 hover:shadow-[0_4px_16px_rgba(28,25,23,0.08)] transition-all group cursor-pointer shadow-[0_4px_16px_rgba(249,115,22,0.12)] dark:shadow-[0_0_12px_rgba(249,115,22,0.15)]"
                : "rounded-2xl border border-[#e7e5e4] dark:border-slate-700 bg-white dark:bg-slate-800 p-5 hover:shadow-[0_4px_16px_rgba(28,25,23,0.08)] transition-all group cursor-pointer";
            return (
              <div
                key={p.id}
                onClick={() => handleCardClick(p)}
                className={cardClassName}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-[#1c1917] dark:text-slate-100 leading-snug group-hover:text-accent-700 transition-colors">
                    {p.title}
                  </h3>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {p.time === "刚刚" && (
                      <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-accent-600 dark:text-accent-400 bg-accent-100 dark:bg-accent-900/40 rounded-full">
                        新
                      </span>
                    )}
                    {p.urgent && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-warm-600 bg-warm-100 rounded-full">
                        <Fire size={12} weight="fill" />
                        急
                      </span>
                    )}
                    {p.boosted && p.boost_level === 'super' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold text-white bg-warm-500 rounded-full">
                        <Crown size={14} weight="fill" />
                        超级置顶
                      </span>
                    )}
                    {p.boosted && p.boost_level !== 'super' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-warm-600 bg-warm-100 rounded-full">
                        <PushPin size={14} weight="fill" className="text-warm-600" />
                        置顶
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {p.skills.map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-0.5 text-xs font-medium bg-accent-100 text-accent-700 rounded-md"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-[#78716c] dark:text-slate-400">
                  <span>{p.college}</span>
                  <div className="flex items-center gap-2">
                    <span>{p.time}</span>
                    {user && p.authorId === user.id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setBoostModalPost(p);
                        }}
                        className="text-xs font-medium text-[#78716c] dark:text-slate-400 border border-[#e7e5e4] dark:border-slate-600 rounded-full px-2.5 py-0.5 hover:text-[#1c1917] dark:hover:text-slate-200 hover:border-[#a8a29e] dark:hover:border-slate-500 active:scale-[0.98] transition-all"
                      >
                        置顶
                      </button>
                    )}
                    {user?.role === "admin" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`确定要删除「${p.title}」吗？`)) {
                            deleteRecruitment(p.id).then(() => loadPosts()).catch(console.error);
                          }
                        }}
                        className="text-[#a8a29e] hover:text-red-500 transition-colors"
                        title="删除此帖"
                      >
                        <X size={14} weight="bold" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 置顶选择弹窗 - 标准/超级双等级 */}
      {boostModalPost && (
        <div
          className="fixed inset-0 z-[110] bg-black/50 flex items-center justify-center p-6"
          onClick={() => setBoostModalPost(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[20px] p-6 max-w-[480px] w-full shadow-[0_20px_60px_rgba(0,0,0,0.2)]"
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-display text-xl font-bold text-[#1c1917]">置顶帖子</h2>
              <button
                onClick={() => setBoostModalPost(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#78716c] hover:bg-[#e7e5e4] transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-[#78716c] mb-5">帖子将固定在广场顶部 3 天</p>

            <div className="grid grid-cols-2 gap-3 mb-5">
              {/* 标准置顶 */}
              <div className="bg-white border border-warm-200 rounded-xl p-4 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-warm-100 flex items-center justify-center flex-shrink-0">
                    <PushPin size={18} weight="fill" className="text-warm-600" />
                  </div>
                  <span className="font-semibold text-sm text-[#1c1917]">标准置顶</span>
                </div>
                <p className="text-xs text-[#78716c] mb-1">金色边框 + 微微暖色阴影</p>
                <p className="text-xs text-[#a8a29e] mb-4">会员免费 / 非会员 1元/次</p>
                <button
                  onClick={() => handleBoost('standard')}
                  disabled={boostConfirming}
                  className="mt-auto w-full py-2.5 text-sm font-medium text-warm-600 border border-warm-500 rounded-full hover:bg-warm-50 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
                >
                  {boostConfirming ? "处理中..." : "选择标准置顶"}
                </button>
              </div>

              {/* 超级置顶 */}
              <div className="bg-gradient-to-b from-warm-50 to-white border border-warm-300 rounded-xl p-4 flex flex-col relative">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-warm-500 flex items-center justify-center flex-shrink-0">
                    <Crown size={18} weight="fill" className="text-white" />
                  </div>
                  <span className="font-semibold text-sm text-[#1c1917]">超级置顶</span>
                </div>
                <p className="text-xs text-[#78716c] mb-1">琥珀色发光光晕 + 独占一行</p>
                <p className="text-xs text-[#a8a29e] mb-4">全年会员免费 / 非会员 2元/次</p>
                <button
                  onClick={() => handleBoost('super')}
                  disabled={boostConfirming}
                  className="mt-auto w-full py-2.5 text-sm font-semibold text-white bg-warm-500 rounded-full hover:bg-warm-600 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
                >
                  {boostConfirming ? "处理中..." : "选择超级置顶"}
                </button>
              </div>
            </div>

            <button
              onClick={() => setBoostModalPost(null)}
              disabled={boostConfirming}
              className="w-full py-3 text-sm font-medium text-[#78716c] rounded-full border border-[#e7e5e4] hover:text-[#1c1917] hover:border-[#a8a29e] disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* 发布招募弹窗 */}
      {showCreate && (
        <div
          className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-6"
          onClick={() => setShowCreate(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[20px] p-6 max-w-[480px] w-full shadow-[0_20px_60px_rgba(0,0,0,0.2)]"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-bold text-[#1c1917]">发布招募</h2>
              <button
                onClick={() => setShowCreate(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#78716c] hover:bg-[#e7e5e4] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1c1917] mb-1.5">招募标题</label>
                <input
                  type="text"
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                  placeholder="例如：找 Python 队友打数学建模比赛"
                  className="w-full px-4 py-2.5 text-sm rounded-lg border border-[#e7e5e4] bg-white text-[#1c1917] placeholder:text-[#a8a29e] focus:outline-none focus:ring-2 focus:ring-accent-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1c1917] mb-1.5">
                  所需技能 <span className="text-[#78716c] font-normal">（已选 {createSkills.length} 个）</span>
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={createSkillInput}
                    onChange={(e) => setCreateSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCreateSkill();
                      }
                    }}
                    placeholder="输入技能名，回车添加"
                    className="flex-1 px-4 py-2 text-sm rounded-lg border border-[#e7e5e4] bg-white text-[#1c1917] placeholder:text-[#a8a29e] focus:outline-none focus:ring-2 focus:ring-accent-400"
                  />
                  <button
                    onClick={addCreateSkill}
                    disabled={!createSkillInput.trim()}
                    className="px-4 py-2 text-sm font-medium text-accent-600 bg-accent-50 rounded-lg border border-accent-200 hover:bg-accent-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                {createSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {createSkills.map((s) => (
                      <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-accent-100 text-accent-700 rounded-lg">
                        {s}
                        <button onClick={() => setCreateSkills(createSkills.filter((x) => x !== s))}>
                          <X size={12} weight="bold" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1c1917] mb-1.5">所在学院</label>
                <select
                  value={createCollege}
                  onChange={(e) => setCreateCollege(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-lg border border-[#e7e5e4] bg-white text-[#1c1917] focus:outline-none focus:ring-2 focus:ring-accent-400"
                >
                  <option value="">{user?.college || "选择学院"}</option>
                  {colleges.filter(c => c !== "全部学院").map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handlePublish}
              disabled={!createTitle.trim() || createSkills.length === 0 || createSubmitting}
              className="mt-6 w-full py-3 text-sm font-semibold text-white bg-accent-600 rounded-full hover:bg-accent-700 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
            >
              {createSubmitting ? "发布中..." : "发布招募"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
