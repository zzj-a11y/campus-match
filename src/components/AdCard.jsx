import { Megaphone } from '@phosphor-icons/react';

const variantClass = {
  'amber-stripe': 'border-t-[3px] border-t-warm-500',
  'brand-tint': 'bg-blue-50/20',
  'plain': '',
};

export default function AdCard({ ad }) {
  return (
    <div className={`rounded-2xl border border-[#e7e5e4] bg-white p-5 flex flex-col hover:shadow-[0_4px_16px_rgba(28,25,23,0.08)] transition-all group ${variantClass[ad.variant] || ''}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold text-warm-600 bg-warm-100 rounded-full">
          <Megaphone size={11} weight="fill" /> 推广
        </span>
        <span className="text-xs text-[#a8a29e]">{ad.category}</span>
      </div>
      <div className="font-semibold text-[#1c1917] mb-2">{ad.brand} · {ad.title}</div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {ad.tags.map(t => (
          <span key={t} className="px-2 py-0.5 text-[11px] font-medium bg-stone-100 text-[#78716c] rounded-md">{t}</span>
        ))}
      </div>
      <p className="text-sm text-[#78716c] italic leading-relaxed mb-3 flex-1">
        &ldquo;{ad.review}&rdquo; - {ad.reviewer}
      </p>
      <div className="flex items-center justify-between pt-3 border-t border-[#e7e5e4]">
        <span className="text-sm font-semibold text-accent-700">{ad.price}</span>
        <span className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-accent-600 rounded-full hover:bg-accent-700 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap">{ad.cta}</span>
      </div>
    </div>
  );
}
