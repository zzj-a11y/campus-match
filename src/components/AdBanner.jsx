import { useState, useEffect, useCallback } from 'react';
import { Circle, Megaphone } from '@phosphor-icons/react';
import { useTheme } from '../context/ThemeContext';
import ADS from '../data/ads';

const BANNER_ADS = ADS.slice(0, 3);

export default function AdBanner() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % BANNER_ADS.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(goNext, 5000);
    return () => clearInterval(timer);
  }, [isPaused, goNext]);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border mb-8 ${isDark ? 'border-slate-700 bg-slate-800' : 'border-[#e7e5e4] bg-white'}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className={`px-8 py-10 flex items-center gap-8 min-h-[200px] ${isDark ? 'bg-gradient-to-r from-slate-800 to-slate-700' : 'bg-gradient-to-r from-accent-50 to-white'}`}>
        {/* 左侧文字 */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold text-warm-600 bg-warm-100 rounded-full">
              <Megaphone size={11} weight="fill" /> 推广
            </span>
            <span className="text-xs text-[#a8a29e]">{BANNER_ADS[currentSlide].category}</span>
          </div>
          <h3 className={`font-display text-xl font-bold ${isDark ? 'text-slate-100' : 'text-[#1c1917]'}`}>
            {BANNER_ADS[currentSlide].brand} · {BANNER_ADS[currentSlide].title}
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {BANNER_ADS[currentSlide].tags.map((t) => (
              <span key={t} className={`px-2 py-0.5 text-[11px] font-medium rounded-md ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-stone-100 text-[#78716c]'}`}>
                {t}
              </span>
            ))}
          </div>
          <p className={`text-sm italic ${isDark ? 'text-slate-400' : 'text-[#78716c]'}`}>
            &ldquo;{BANNER_ADS[currentSlide].review}&rdquo; - {BANNER_ADS[currentSlide].reviewer}
          </p>
          <div className="flex items-center gap-4 pt-2">
            <span className="text-lg font-bold text-accent-600">{BANNER_ADS[currentSlide].price}</span>
            <span className="inline-flex items-center px-5 py-2 text-sm font-semibold text-white bg-accent-600 rounded-full hover:bg-accent-700 active:scale-[0.98] transition-all cursor-pointer">
              {BANNER_ADS[currentSlide].cta}
            </span>
          </div>
        </div>

      </div>

      {/* 底部圆点指示器 */}
      <div className="flex items-center justify-center gap-2 pb-4">
        {BANNER_ADS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className="text-accent-400 hover:text-accent-600 transition-colors cursor-pointer"
          >
            {idx === currentSlide ? (
              <Circle size={10} weight="fill" />
            ) : (
              <Circle size={10} weight="bold" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
