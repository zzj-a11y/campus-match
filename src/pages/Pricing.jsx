import { Link } from "react-router-dom";
import { Star, PushPin, Lightning, Eye, Circle, Check } from "@phosphor-icons/react";

export default function Pricing() {
  return (
    <div className="page-enter">
      {/* Section 1 — Hero + 3 Pricing Cards */}
      <section className="max-w-[960px] mx-auto px-6 py-12 md:py-16">
        {/* Hero — left aligned */}
        <div className="mb-10">
          <h1 className="font-display text-4xl font-bold text-[#1c1917]">
            免费使用，按需升级
          </h1>
          <p className="text-base text-[#78716c] mt-3 max-w-[480px]">
            核心组队功能永久免费，进阶效率工具只需两杯奶茶钱
          </p>
          <Link
            to="/register"
            className="inline-flex items-center px-6 py-3 mt-6 text-sm font-semibold text-white bg-accent-600 rounded-full no-underline hover:bg-accent-700 active:scale-[0.98] transition-all"
          >
            开始免费使用
          </Link>
        </div>

        {/* 3 Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1 — Free */}
          <div className="rounded-2xl bg-white border border-[#e7e5e4] p-6 flex flex-col">
            <div className="text-2xl font-bold text-[#1c1917]">¥0</div>
            <div className="text-sm text-[#78716c] mt-0.5">永久</div>
            <ul className="mt-5 space-y-2.5 text-sm text-[#78716c] flex-1">
              <li className="flex items-center gap-2">
                <Check size={16} weight="bold" className="text-accent-600 shrink-0" />
                核心匹配
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} weight="bold" className="text-accent-600 shrink-0" />
                发帖聊天
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} weight="bold" className="text-accent-600 shrink-0" />
                基础看板
              </li>
            </ul>
            <button className="mt-6 w-full py-2.5 text-sm font-medium text-accent-600 bg-white border border-accent-600 rounded-full active:scale-[0.98] transition-all cursor-default">
              当前方案
            </button>
          </div>

          {/* Card 2 — Semester (Featured) */}
          <div className="rounded-2xl bg-accent-50 border-2 border-accent-300 p-6 flex flex-col relative">
            {/* 最受欢迎 badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center gap-1 px-3 py-1 text-[11px] font-semibold text-white bg-accent-600 rounded-full whitespace-nowrap">
                <Star size={12} weight="fill" />
                最受欢迎
              </span>
            </div>
            <div className="text-2xl font-bold text-[#1c1917] mt-1">¥9.9</div>
            <div className="text-sm text-[#78716c] mt-0.5">/ 学期 · 约 ¥2/月</div>
            <ul className="mt-5 space-y-2.5 text-sm text-[#78716c] flex-1">
              <li className="flex items-center gap-2">
                <Check size={16} weight="bold" className="text-accent-600 shrink-0" />
                无限匹配
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} weight="bold" className="text-accent-600 shrink-0" />
                帖子置顶
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} weight="bold" className="text-accent-600 shrink-0" />
                加急邀约
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} weight="bold" className="text-accent-600 shrink-0" />
                访客记录
              </li>
            </ul>
            <button className="mt-6 w-full py-2.5 text-sm font-semibold text-white bg-accent-600 rounded-full hover:bg-accent-700 active:scale-[0.98] transition-all">
              立即升级
            </button>
          </div>

          {/* Card 3 — Yearly */}
          <div className="rounded-2xl bg-white border border-[#e7e5e4] p-6 flex flex-col">
            <div className="text-2xl font-bold text-[#1c1917]">¥19.9</div>
            <div className="text-sm text-[#78716c] mt-0.5">/ 年 · 约 ¥1.7/月</div>
            <ul className="mt-5 space-y-2.5 text-sm text-[#78716c] flex-1">
              <li className="flex items-center gap-2">
                <Check size={16} weight="bold" className="text-accent-600 shrink-0" />
                全部学期权益
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} weight="bold" className="text-accent-600 shrink-0" />
                高级筛选
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} weight="bold" className="text-accent-600 shrink-0" />
                云端扩容
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} weight="bold" className="text-accent-600 shrink-0" />
                报表导出
              </li>
            </ul>
            <button className="mt-6 w-full py-2.5 text-sm font-semibold text-white bg-accent-600 rounded-full hover:bg-accent-700 active:scale-[0.98] transition-all">
              立即升级
            </button>
          </div>
        </div>
      </section>

      {/* Section 2 — Pay-Per-Use Items */}
      <section className="max-w-[960px] mx-auto px-6 py-12 md:py-16">
        <div className="mb-8">
          <h2 className="font-display text-2xl font-bold text-[#1c1917]">
            需要更灵活？按次付费
          </h2>
          <p className="text-base text-[#78716c] mt-2 max-w-[480px]">
            不受会员周期约束，用得少花得少
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Item 1 — 帖子置顶 */}
          <div className="rounded-2xl bg-white border border-[#e7e5e4] p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-accent-100 flex items-center justify-center mb-4">
              <PushPin size={24} weight="bold" className="text-accent-600" />
            </div>
            <h3 className="font-semibold text-[#1c1917]">帖子置顶</h3>
            <p className="text-lg font-bold text-[#1c1917] mt-1">
              ¥1-2<span className="text-sm font-normal text-[#78716c]">/次</span>
            </p>
            <p className="text-sm text-[#78716c] mt-2">3天置顶，曝光翻倍</p>
            <button className="mt-5 w-full py-2.5 text-sm font-medium text-accent-600 bg-white border border-accent-600 rounded-full active:scale-[0.98] transition-all">
              立即使用
            </button>
          </div>

          {/* Item 2 — 加急邀约 */}
          <div className="rounded-2xl bg-white border border-[#e7e5e4] p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-accent-100 flex items-center justify-center mb-4">
              <Lightning size={24} weight="bold" className="text-accent-600" />
            </div>
            <h3 className="font-semibold text-[#1c1917]">加急邀约</h3>
            <p className="text-lg font-bold text-[#1c1917] mt-1">
              ¥0.5<span className="text-sm font-normal text-[#78716c]">/次</span>
            </p>
            <p className="text-sm text-[#78716c] mt-2">强制弹窗，对方必看到</p>
            <button className="mt-5 w-full py-2.5 text-sm font-medium text-accent-600 bg-white border border-accent-600 rounded-full active:scale-[0.98] transition-all">
              立即使用
            </button>
          </div>

          {/* Item 3 — 访客记录 */}
          <div className="rounded-2xl bg-white border border-[#e7e5e4] p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-accent-100 flex items-center justify-center mb-4">
              <Eye size={24} weight="bold" className="text-accent-600" />
            </div>
            <h3 className="font-semibold text-[#1c1917]">访客记录</h3>
            <p className="text-lg font-bold text-[#1c1917] mt-1">
              ¥1<span className="text-sm font-normal text-[#78716c]">/次</span>
            </p>
            <p className="text-sm text-[#78716c] mt-2">查看谁浏览过我的卡片</p>
            <button className="mt-5 w-full py-2.5 text-sm font-medium text-accent-600 bg-white border border-accent-600 rounded-full active:scale-[0.98] transition-all">
              立即使用
            </button>
          </div>
        </div>
      </section>

      {/* Section 3 — Kanban Comparison Table */}
      <section className="max-w-[960px] mx-auto px-6 py-12 md:py-16">
        <div className="mb-8">
          <h2 className="font-display text-2xl font-bold text-[#1c1917]">
            团队协作，效率翻倍
          </h2>
          <p className="text-base text-[#78716c] mt-2 max-w-[480px]">
            免费看板够用，高阶协作按需开通
          </p>
        </div>

        <div className="rounded-2xl bg-white border border-[#e7e5e4] overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-2 border-b border-[#e7e5e4]">
            <div className="px-6 py-3 text-sm text-[#78716c] font-medium">免费版</div>
            <div className="px-6 py-3 text-sm font-medium text-[#1c1917]">会员版</div>
          </div>
          {/* Rows */}
          {[
            { free: "基础拖拽", paid: "权限分配" },
            { free: "3列看板", paid: "无限子任务" },
            { free: "文字备注", paid: "文件上传" },
            { free: "单人操作", paid: "进度报表导出" },
          ].map((row, i) => (
            <div
              key={i}
              className={`grid grid-cols-2 ${i < 3 ? "border-b border-[#e7e5e4]" : ""}`}
            >
              <div className="px-6 py-3.5 flex items-center gap-2 text-sm text-[#78716c]">
                <Circle size={14} weight="bold" className="text-[#a8a29e] shrink-0" />
                {row.free}
              </div>
              <div className="px-6 py-3.5 flex items-center gap-2 text-sm text-[#1c1917]">
                <Check size={16} weight="bold" className="text-accent-600 shrink-0" />
                {row.paid}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 4 — Bottom CTA */}
      <section className="bg-accent-50">
        <div className="max-w-[960px] mx-auto px-6 py-12 md:py-16 text-center">
          <h2 className="font-display text-2xl font-bold text-[#1c1917]">
            准备好提升组队效率了吗？
          </h2>
          <Link
            to="/register"
            className="inline-flex items-center px-6 py-3 mt-6 text-sm font-semibold text-white bg-accent-600 rounded-full no-underline hover:bg-accent-700 active:scale-[0.98] transition-all"
          >
            开始免费使用
          </Link>
        </div>
      </section>
    </div>
  );
}
