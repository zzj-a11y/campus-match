import { useState } from 'react';
import { Megaphone } from '@phosphor-icons/react';
import ADS, { CATEGORIES } from '../data/ads';
import AdCard from '../components/AdCard';
import AdBanner from '../components/AdBanner';

export default function Ads() {
  const [activeCategory, setActiveCategory] = useState('全部');

  const filteredAds = activeCategory === '全部'
    ? ADS
    : ADS.filter((ad) => ad.category === activeCategory);

  return (
    <div className="max-w-[960px] mx-auto px-6 py-8 page-enter">
      {/* 标题 */}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-[#1c1917]">
          校园优惠
        </h1>
        <p className="text-sm text-[#78716c] mt-1">
          广师大学生专属福利
        </p>
      </div>

      {/* 轮播 Banner */}
      <AdBanner />

      {/* 分类筛选 pill bar */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-all ${
              activeCategory === cat
                ? 'bg-accent-600 text-white'
                : 'bg-white text-[#78716c] border border-[#e7e5e4] hover:text-[#1c1917] hover:border-[#a8a29e]'
            }`}
          >
            {cat === '全部' && <Megaphone size={14} weight="bold" className="mr-1.5" />}
            {cat}
          </button>
        ))}
      </div>

      {/* 广告卡片网格 */}
      {filteredAds.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-accent-100 flex items-center justify-center">
            <Megaphone size={24} weight="bold" className="text-accent-600" />
          </div>
          <div className="text-[#78716c]">暂无该分类的优惠信息</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAds.map((ad) => (
            <AdCard key={ad.id} ad={ad} />
          ))}
        </div>
      )}
    </div>
  );
}
