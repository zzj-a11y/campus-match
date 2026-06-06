import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MagnifyingGlass, Plus, CaretDown, Fire } from "@phosphor-icons/react";
import { getRecruitments } from "../lib/mockStore";

const colleges = ["全部学院", "计算机学院", "经管学院", "设计学院", "人文学院", "理工学院"];
const skillFilters = ["全部技能", "Python", "React", "PS", "PPT", "数据分析", "写作"];

export default function Square() {
  const [collegeFilter, setCollegeFilter] = useState("全部学院");
  const [skillFilter, setSkillFilter] = useState("全部技能");
  const [search, setSearch] = useState("");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 加载招募帖
  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await getRecruitments({
        college: collegeFilter,
        skill: skillFilter,
      });
      setPosts(data);
      setLoading(false);
    })();
  }, [collegeFilter, skillFilter]);

  const filteredPosts = posts.filter((p) => {
    if (!search.trim()) return true;
    return (
      p.title.includes(search.trim()) ||
      p.skills.some((s) => s.includes(search.trim()))
    );
  });

  return (
    <div className="max-w-[960px] mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-[#1c1917]">
          招募广场
        </h1>
        <Link
          to="/register"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-accent-600 rounded-full no-underline hover:bg-accent-700 active:scale-[0.98] transition-all"
        >
          <Plus size={16} weight="bold" />
          发布需求
        </Link>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
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

      {/* Post grid */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-6 h-6 border-2 border-accent-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">📭</div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPosts.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl border border-[#e7e5e4] bg-white p-5 hover:shadow-[0_4px_16px_rgba(28,25,23,0.08)] transition-all group cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-[#1c1917] leading-snug group-hover:text-accent-700 transition-colors">
                  {p.title}
                </h3>
                {p.urgent && (
                  <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-orange-600 bg-orange-50 rounded-full">
                    <Fire size={12} weight="fill" />
                    急
                  </span>
                )}
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
              <div className="mt-3 flex items-center justify-between text-xs text-[#78716c]">
                <span>{p.college}</span>
                <span>{p.time}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
