import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, X, Heart, Faders, Sparkle, ChatCenteredDots } from "@phosphor-icons/react";
import { getCurrentUser, getCandidates, swipeRight, swipeLeft, getUserMatches, contactAuthor } from "../lib/dataStore";

export default function Match() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [swiping, setSwiping] = useState(null); // "left" | "right" | null
  const [matchResult, setMatchResult] = useState(null);
  const [showMatchPopup, setShowMatchPopup] = useState(false);
  const [myMatches, setMyMatches] = useState([]);
  const [slowHint, setSlowHint] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);

  // 加载用户和候选
  useEffect(() => {
    let cancelled = false;
    const slowTimer = setTimeout(() => { if (!cancelled) setSlowHint(true); }, 8000);
    (async () => {
      try {
        const u = await getCurrentUser();
        if (cancelled) return;
        if (!u) { navigate("/register", { replace: true }); return; }
        setUser(u);
        const [list, matches] = await Promise.all([
          getCandidates().catch((e) => { console.error(e); return []; }),
          getUserMatches().catch((e) => { console.error(e); return []; }),
        ]);
        if (cancelled) return;
        clearTimeout(slowTimer);
        setCandidates(list);
        setMyMatches(matches);
      } catch (e) { console.error("Match load failed:", e); }
      finally {
        if (!cancelled) { setLoading(false); setSlowHint(false); }
      }
    })();
    return () => { cancelled = true; clearTimeout(slowTimer); };
  }, []);

  const current = candidates[index];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="w-6 h-6 border-2 border-accent-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[#78716c]">{slowHint ? "服务器启动中..." : "加载中..."}</p>
      </div>
    );
  }

  if (!user) return null;

  const doSwipe = async (direction) => {
    if (!current || swiping || btnLoading) return;
    setSwiping(direction);
    setBtnLoading(true);

    if (direction === "right") {
      try {
        const result = await swipeRight(current.id);
        if (result && result.targetUser) {
          setMatchResult(result);
          setTimeout(() => setShowMatchPopup(true), 400);
        }
      } catch (e) { console.error(e); }
    } else {
      try { await swipeLeft(current.id); } catch (e) { console.error(e); }
    }

    // 动画结束后切卡片
    setTimeout(() => {
      setIndex((i) => i + 1);
      setSwiping(null);
      setBtnLoading(false);
    }, 280);
  };

  const goToChat = () => { setShowMatchPopup(false); navigate(`/chat/${matchResult.match.id}`); };
  const dismissPopup = () => setShowMatchPopup(false);

  // 无候选人时
  if (!current) {
    return (
      <div className="max-w-[480px] mx-auto px-6 py-24 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-accent-100 flex items-center justify-center text-accent-600">
          <Heart size={28} weight="fill" />
        </div>
        <h2 className="mt-6 font-display text-2xl font-bold text-[#1c1917]">
          {myMatches.length === 0 ? "欢迎加入校园智搭！" : "今日推荐已全部浏览"}
        </h2>
        <p className="mt-2 text-[#78716c]">
          {myMatches.length === 0
            ? "暂时没有推荐人选，先去招募广场发帖，或邀请同学一起加入吧"
            : "去招募广场看看更多队友，或稍后再来发现新人"
          }
        </p>
        {myMatches.length > 0 && (
          <div className="mt-8 text-left">
            <h3 className="text-sm font-semibold text-[#1c1917] mb-3">我的对话</h3>
            <div className="space-y-2">
              {myMatches.map((m) => (
                <Link key={m.matchId} to={`/chat/${m.matchId}`}
                  className="flex items-center gap-3 p-3 rounded-xl border border-[#e7e5e4] bg-white hover:shadow-[0_2px_8px_rgba(28,25,23,0.06)] no-underline transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-accent-100 flex items-center justify-center text-accent-700 font-bold flex-shrink-0">{m.partner.avatar}</div>
                  <div className="text-left min-w-0">
                    <div className="text-sm font-medium text-[#1c1917]">{m.partner.name}</div>
                    <div className="text-xs text-[#78716c] truncate">{m.lastMessage || "开始对话"}</div>
                  </div>
                  <ChatCenteredDots size={18} className="text-accent-400 ml-auto flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        )}
        <Link to="/square" className="mt-6 inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-accent-600 rounded-full no-underline hover:bg-accent-700 active:scale-[0.98] transition-all">
          去招募广场
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[960px] mx-auto px-6 py-8">
      <div className="flex gap-6 justify-center">
        {/* 匹配小贴士侧栏 */}
        <div className="hidden lg:block w-[200px] flex-shrink-0">
          <div className="sticky top-24 rounded-2xl border border-[#e7e5e4] bg-white p-5 shadow-[0_2px_8px_rgba(28,25,23,0.04)]">
            <div className="text-xs font-semibold text-[#78716c] uppercase tracking-wider mb-3">匹配小贴士</div>
            <p className="text-sm text-[#1c1917] leading-relaxed">同学院同学的匹配度更高哦，不妨先多看看本院的小伙伴</p>
            <div className="mt-4 pt-4 border-t border-[#e7e5e4]">
              <div className="text-xs text-[#78716c]">已匹配 <span className="font-bold text-accent-600">{myMatches.length}</span> 位队友</div>
            </div>
          </div>
        </div>

        {/* 卡片主体 */}
        <div className="max-w-[480px] flex-1">
          <div className="flex items-center justify-between mb-6">
            <Link to="/" className="text-[#78716c] hover:text-[#1c1917] transition-colors"><ArrowLeft size={22} /></Link>
            <h1 className="font-display text-lg font-bold text-[#1c1917]">发现队友</h1>
            <button onClick={() => navigate("/register")} className="text-[#78716c] hover:text-[#1c1917] transition-colors" title="调整匹配偏好"><Faders size={22} /></button>
          </div>

          {/* 卡片堆叠区 */}
          <div className="relative w-full" style={{ height: 440 }}>
            {/* 背景卡片 */}
            {candidates.slice(index + 1, index + 3).map((c, i) => (
              <div key={c.id}
                className="absolute inset-0 rounded-[20px] border border-[#e7e5e4] bg-white p-6 flex flex-col"
                style={{ transform: `scale(${0.95 - i * 0.03}) translateY(${(i + 1) * 6}px)`, zIndex: 1 - i }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-accent-100 flex items-center justify-center text-accent-700 font-bold text-xl">{c.avatar}</div>
                  <div><div className="font-semibold text-lg text-[#1c1917]">{c.name}</div><div className="text-sm text-[#78716c]">{c.college} · {c.grade}</div></div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 opacity-60">
                  {c.skills.map((s) => (<span key={s} className="px-3 py-1.5 text-sm font-medium bg-accent-100 text-accent-700 rounded-lg">{s}</span>))}
                </div>
              </div>
            ))}

            {/* 前景卡片 —— 纯 CSS 过渡动画 */}
            <div
              className="absolute inset-0 z-10 transition-all duration-[280ms] ease-out"
              style={{
                transform: swiping === "right" ? "translateX(400px) rotate(15deg)"
                         : swiping === "left" ? "translateX(-400px) rotate(-15deg)"
                         : "translateX(0) rotate(0deg)",
                opacity: swiping ? 0 : 1,
              }}
            >
              <div className="relative h-full rounded-[20px] border border-[#e7e5e4] bg-white p-6 shadow-[0_8px_32px_rgba(28,25,23,0.10)] flex flex-col">
                {/* 单击卡片 → 直接对话 */}
                <div className="absolute inset-0 z-[5] cursor-pointer" onClick={() => {
                  if (btnLoading) return;
                  setBtnLoading(true);
                  contactAuthor(current.id).then((matchId) => {
                    navigate(`/chat/${matchId}`);
                  }).catch((e) => {
                    console.error(e);
                    setBtnLoading(false);
                  });
                }} />

                {/* 跳过/连接印章 */}
                {swiping === "left" && (
                  <div className="absolute top-8 left-6 z-20 px-4 py-1.5 rounded-lg border-2 border-red-400 rotate-[-20deg] pointer-events-none">
                    <span className="text-2xl font-extrabold text-red-400">跳过</span>
                  </div>
                )}
                {swiping === "right" && (
                  <div className="absolute top-8 right-6 z-20 px-4 py-1.5 rounded-lg border-2 border-accent-400 rotate-[20deg] pointer-events-none">
                    <span className="text-2xl font-extrabold text-accent-400">连接</span>
                  </div>
                )}

                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-14 h-14 rounded-full bg-accent-100 flex items-center justify-center text-accent-700 font-bold text-xl">{current.avatar}</div>
                  <div><div className="font-semibold text-lg text-[#1c1917]">{current.name}</div><div className="text-sm text-[#78716c]">{current.college} · {current.grade}</div></div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2 relative z-10">
                  {current.skills.map((s) => (<span key={s} className="px-3 py-1.5 text-sm font-medium bg-accent-100 text-accent-700 rounded-lg">{s}</span>))}
                </div>
                <div className="mt-auto pt-4 border-t border-[#e7e5e4] relative z-10">
                  <div className="text-xs text-[#78716c] mb-1">匹配理由</div>
                  <div className="text-sm text-[#1c1917] leading-relaxed">{current.reason}</div>
                  <div className="mt-3 text-sm font-semibold text-accent-600">{current.matchRate}% 匹配度</div>
                </div>
              </div>
            </div>
          </div>

          {/* 按钮 */}
          <div className="flex items-center justify-center gap-6 mt-6">
            <button onClick={() => doSwipe("left")} disabled={btnLoading}
              className="w-14 h-14 rounded-full border-2 border-[#e7e5e4] bg-white flex items-center justify-center text-[#78716c] hover:border-red-300 hover:text-red-500 active:scale-90 transition-all disabled:opacity-40"
            >
              <X size={26} weight="bold" />
            </button>
            <button onClick={() => doSwipe("right")} disabled={btnLoading}
              className="w-14 h-14 rounded-full border-2 border-accent-300 bg-white flex items-center justify-center text-accent-600 hover:bg-accent-50 hover:border-accent-500 active:scale-90 transition-all disabled:opacity-40"
            >
              <Heart size={26} weight="bold" />
            </button>
          </div>

          <div className="text-center mt-4 text-sm text-[#78716c]">
            {btnLoading ? "处理中..." : `剩余推荐：${candidates.length - index} 人`}
          </div>
        </div>
      </div>

      {/* Match popup */}
      <AnimatePresence>
        {showMatchPopup && matchResult && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-6" onClick={dismissPopup}
          >
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[24px] p-8 max-w-[360px] w-full text-center shadow-[0_20px_60px_rgba(0,0,0,0.2)]"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-accent-100 flex items-center justify-center">
                <Sparkle size={32} weight="fill" className="text-accent-600" />
              </div>
              <h2 className="mt-4 font-display text-2xl font-bold text-[#1c1917]">匹配成功！</h2>
              <p className="mt-2 text-[#78716c]">你和 <span className="font-semibold text-[#1c1917]">{matchResult.targetUser.name}</span> 互相选择了对方</p>
              <div className="mt-5 flex items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent-100 flex items-center justify-center text-accent-700 font-bold">{user.avatar}</div>
                <div className="w-0.5 h-6 bg-accent-300 rounded" />
                <div className="w-12 h-12 rounded-full bg-accent-100 flex items-center justify-center text-accent-700 font-bold">{matchResult.targetUser.avatar}</div>
              </div>
              <button onClick={goToChat} className="mt-6 w-full py-3 text-sm font-semibold text-white bg-accent-600 rounded-full hover:bg-accent-700 active:scale-[0.98] transition-all">开始对话</button>
              <button onClick={dismissPopup} className="mt-2 w-full py-2.5 text-sm font-medium text-[#78716c] rounded-full hover:text-[#1c1917] transition-colors">继续匹配</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
