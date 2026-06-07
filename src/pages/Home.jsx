import { Link } from "react-router-dom";
import { ArrowRight, Users, Kanban, ChatCenteredDots } from "@phosphor-icons/react";

const features = [
  {
    icon: Users,
    title: "智能匹配",
    desc: "填标签 30 秒，算法推荐最合适的队友",
    to: "/register",
    size: "lg",
  },
  {
    icon: ChatCenteredDots,
    title: "即时通讯",
    desc: "匹配成功自动建对话，无需加好友",
    to: "/match",
    size: "sm",
  },
  {
    icon: Kanban,
    title: "任务看板",
    desc: "组队自动建项目，DDL 追踪不摆烂",
    to: "/match",
    size: "sm",
  },
];

const steps = [
  { step: "01", title: "填标签", desc: "3 个技能 + 1 个目标 + 学院年级，30 秒搞定" },
  { step: "02", title: "划卡匹配", desc: "左滑跳过右滑连接，算法推荐理由透明可见" },
  { step: "03", title: "组队协作", desc: "确认组队自动建项目空间，任务看板跟踪进度" },
];

const stats = [
  { value: "87%", label: "用户 1 小时内找到队友" },
  { value: "1,200+", label: "项目已在平台创建" },
  { value: "15 所", label: "高校同学正在使用" },
];

export default function Home() {
  return (
    <>
      {/* ---- Hero (≤ 25vh) ---- */}
      <section className="max-w-[1280px] mx-auto px-6 pt-20 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 items-center">
          {/* Left: copy */}
          <div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#1c1917] leading-[1.08] tracking-tight">
              不止是搭子，
              <br />
              更是你的
              <br />
              学业成长合伙人
            </h1>
            <p className="mt-5 text-base sm:text-lg text-[#78716c] leading-relaxed max-w-[480px]">
              30 秒填标签，即刻找到能和你组队学习、打比赛、做项目的校园搭子
            </p>
            <div className="mt-7 flex items-center gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-6 py-3 text-base font-semibold text-white bg-accent-600 rounded-full no-underline hover:bg-accent-700 active:scale-[0.98] transition-all"
              >
                开始匹配
                <ArrowRight size={18} weight="bold" />
              </Link>
              <Link
                to="/square"
                className="inline-flex items-center gap-2 px-6 py-3 text-base font-medium text-[#78716c] rounded-full no-underline hover:text-[#1c1917] hover:bg-[#e7e5e4]/50 transition-colors"
              >
                逛招募广场
              </Link>
            </div>
          </div>

          {/* Right: match card preview */}
          <div className="hidden lg:block">
            <div className="relative rounded-[20px] border border-[#e7e5e4] bg-white p-6 shadow-[0_8px_32px_rgba(28,25,23,0.10)]">
              <div className="text-xs font-medium text-[#78716c] uppercase tracking-wider">
                为你推荐
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-accent-100 flex items-center justify-center text-accent-700 font-bold text-lg">
                  张
                </div>
                <div>
                  <div className="font-semibold text-[#1c1917]">张同学</div>
                  <div className="text-sm text-[#78716c]">计算机学院 · 大三</div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="px-3 py-1 text-xs font-medium bg-accent-100 text-accent-700 rounded-lg">
                  Python
                </span>
                <span className="px-3 py-1 text-xs font-medium bg-accent-100 text-accent-700 rounded-lg">
                  数据分析
                </span>
                <span className="px-3 py-1 text-xs font-medium bg-accent-100 text-accent-700 rounded-lg">
                  PPT 设计
                </span>
              </div>
              <div className="mt-4 pt-4 border-t border-[#e7e5e4]">
                <div className="text-xs text-[#78716c]">匹配理由</div>
                <div className="mt-1 text-sm text-[#1c1917]">
                  你们都有 Python 标签，同学院优先推荐
                </div>
              </div>
              <div className="mt-4 text-xs text-accent-600 font-semibold">
                87% 匹配度
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Feature Bento ---- */}
      <section className="max-w-[1280px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-4">
          {features.map((f) => {
            const Icon = f.icon;
            const isLarge = f.size === "lg";
            return (
              <Link
                key={f.title}
                to={f.to}
                className={`group block rounded-2xl border border-[#e7e5e4] bg-white p-6 no-underline transition-all hover:shadow-[0_4px_16px_rgba(28,25,23,0.08)] hover:-translate-y-0.5 ${
                  isLarge ? "md:row-span-2 flex flex-col justify-between" : ""
                }`}
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-accent-100 flex items-center justify-center text-accent-600">
                    <Icon size={22} weight="duotone" />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold text-[#1c1917]">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-sm text-[#78716c] leading-relaxed">
                    {f.desc}
                  </p>
                </div>
                {isLarge && (
                  <div className="mt-6 flex items-center gap-1 text-sm font-medium text-accent-600 group-hover:gap-2 transition-all">
                    立即体验 <ArrowRight size={14} weight="bold" />
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </section>

      {/* ---- Steps: horizontal scroll ---- */}
      <section className="max-w-[1280px] mx-auto px-6 py-16">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1c1917]">
          三步找到你的队友
        </h2>
        <div className="mt-8 flex gap-6 overflow-x-auto no-scrollbar snap-x-mandatory pb-2">
          {steps.map((s) => (
            <div
              key={s.step}
              className="flex-shrink-0 w-[280px] sm:w-[340px] snap-center rounded-2xl border border-[#e7e5e4] bg-white p-6"
            >
              <div className="font-mono text-sm text-[#78716c]">{s.step}</div>
              <h3 className="mt-3 font-display text-xl font-bold text-[#1c1917]">
                {s.title}
              </h3>
              <p className="mt-2 text-sm text-[#78716c] leading-relaxed">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ---- Stats ---- */}
      <section className="max-w-[1280px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-left sm:text-left">
              <div className="font-display text-3xl sm:text-4xl font-extrabold text-[#0d9488]">
                {s.value}
              </div>
              <div className="mt-1 text-sm text-[#78716c]">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ---- CTA ---- */}
      <section className="max-w-[1280px] mx-auto px-6 pb-20">
        <div className="rounded-2xl bg-accent-600 p-10 sm:p-14 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
              准备好找到你的搭子了吗？
            </h2>
            <p className="mt-2 text-accent-100">
              免费使用，无需任何费用
            </p>
          </div>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-7 py-3.5 text-base font-semibold text-accent-700 bg-white rounded-full no-underline hover:bg-accent-50 active:scale-[0.98] transition-all whitespace-nowrap"
          >
            30 秒开始
            <ArrowRight size={18} weight="bold" />
          </Link>
        </div>
      </section>
    </>
  );
}
