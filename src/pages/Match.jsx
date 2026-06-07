import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, useMotionValue, useTransform, AnimatePresence } from "motion/react";
import { ArrowLeft, X, Heart, Faders, Sparkle, ChatCenteredDots } from "@phosphor-icons/react";
import { getCurrentUser, getCandidates, swipeRight, swipeLeft, getUserMatches } from "../lib/dataStore";

export default function Match() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [exitX, setExitX] = useState(0);
  const [exitDir, setExitDir] = useState(null);
  const [matchResult, setMatchResult] = useState(null);
  const [showMatchPopup, setShowMatchPopup] = useState(false);
  const [myMatches, setMyMatches] = useState([]);

  const dragX = useMotionValue(0);
  const rotate = useTransform(dragX, [-200, 200], [-20, 20]);
  const opacityOut = useTransform(
    dragX,
    [-200, -100, 0, 100, 200],
    [0.3, 1, 1, 1, 0.3]
  );
  const leftStampOpacity = useTransform(dragX, [-200, -60], [1, 0]);
  const rightStampOpacity = useTransform(dragX, [60, 200], [0, 1]);

  // 加载用户和候选
  useEffect(() => {
    (async () => {
      const u = await getCurrentUser();
      if (!u) {
        navigate("/register", { replace: true });
        return;
      }
      setUser(u);
      const [list, matches] = await Promise.all([
        getCandidates(),
        getUserMatches(),
      ]);
      setCandidates(list);
      setMyMatches(matches);
      setLoading(false);
    })();
  }, []);

  const current = candidates[index];

  // 键盘支持
  useEffect(() => {
    const onKey = (e) => {
      if (showMatchPopup || loading) return;
      if (e.key === "ArrowLeft") handleSwipe("left");
      if (e.key === "ArrowRight") handleSwipe("right");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, showMatchPopup, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-accent-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const handleSwipe = async (direction) => {
    if (!current || showMatchPopup) return;

    setExitDir(direction);
    setExitX(direction === "right" ? 400 : -400);

    if (direction === "right") {
      const result = await swipeRight(current.id);
      if (result && result.targetUser) {
        setMatchResult(result);
        setTimeout(() => setShowMatchPopup(true), 350);
      }
    } else {
      await swipeLeft(current.id);
    }

    setTimeout(() => {
      setIndex((i) => i + 1);
      setExitX(0);
      setExitDir(null);
      dragX.set(0);
    }, 300);
  };

  const handleDragEnd = (_, info) => {
    if (info.offset.x > 100) handleSwipe("right");
    else if (info.offset.x < -100) handleSwipe("left");
  };

  const goToChat = () => {
    setShowMatchPopup(false);
    navigate(`/chat/${matchResult.match.id}`);
  };

  const dismissPopup = () => {
    setShowMatchPopup(false);
  };

  if (!current) {
    return (
      <div className="max-w-[480px] mx-auto px-6 py-24 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-accent-100 flex items-center justify-center text-accent-600">
          <Heart size={28} weight="fill" />
        </div>
        <h2 className="mt-6 font-display text-2xl font-bold text-[#1c1917]">
          今日推荐已全部浏览
        </h2>
        <p className="mt-2 text-[#78716c]">
          去招募广场看看更多队友，或稍后再来发现新人
        </p>

        {/* 已有对话 */}
        {myMatches.length > 0 && (
          <div className="mt-8 text-left">
            <h3 className="text-sm font-semibold text-[#1c1917] mb-3">我的对话</h3>
            <div className="space-y-2">
              {myMatches.map((m) => (
                <Link
                  key={m.matchId}
                  to={`/chat/${m.matchId}`}
                  className="flex items-center gap-3 p-3 rounded-xl border border-[#e7e5e4] bg-white hover:shadow-[0_2px_8px_rgba(28,25,23,0.06)] no-underline transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-accent-100 flex items-center justify-center text-accent-700 font-bold flex-shrink-0">
                    {m.partner.avatar}
                  </div>
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

        <Link
          to="/square"
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-accent-600 rounded-full no-underline hover:bg-accent-700 active:scale-[0.98] transition-all"
        >
          去招募广场
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[480px] mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link to="/" className="text-[#78716c] hover:text-[#1c1917] transition-colors">
          <ArrowLeft size={22} />
        </Link>
        <h1 className="font-display text-lg font-bold text-[#1c1917]">发现队友</h1>
        <button className="text-[#78716c] hover:text-[#1c1917] transition-colors">
          <Faders size={22} />
        </button>
      </div>

      {/* Card area */}
      <div className="relative w-full" style={{ height: 420 }}>
        {candidates.slice(index + 1, index + 3).map((c, i) => (
          <div
            key={c.id}
            className="absolute inset-0 rounded-[20px] border border-[#e7e5e4] bg-white"
            style={{
              transform: `scale(${0.95 - i * 0.03}) translateY(${(i + 1) * 6}px)`,
              zIndex: 1 - i,
            }}
          />
        ))}

        <AnimatePresence>
          <motion.div
            key={current.id}
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{
              x: exitX,
              opacity: 0,
              rotate: exitDir === "right" ? 15 : -15,
              transition: { duration: 0.25, ease: "easeOut" },
            }}
            style={{
              x: dragX,
              rotate,
              opacity: opacityOut,
              zIndex: 10,
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.8}
            onDragEnd={handleDragEnd}
            className="absolute inset-0"
          >
            <div className="relative h-full rounded-[20px] border border-[#e7e5e4] bg-white p-6 shadow-[0_8px_32px_rgba(28,25,23,0.10)] flex flex-col">
              <motion.div
                style={{ opacity: leftStampOpacity }}
                className="absolute top-8 left-6 z-20 px-4 py-1.5 rounded-lg border-2 border-red-400 rotate-[-20deg] pointer-events-none"
              >
                <span className="text-2xl font-extrabold text-red-400">跳过</span>
              </motion.div>
              <motion.div
                style={{ opacity: rightStampOpacity }}
                className="absolute top-8 right-6 z-20 px-4 py-1.5 rounded-lg border-2 border-accent-400 rotate-[20deg] pointer-events-none"
              >
                <span className="text-2xl font-extrabold text-accent-400">连接</span>
              </motion.div>

              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-accent-100 flex items-center justify-center text-accent-700 font-bold text-xl">
                  {current.avatar}
                </div>
                <div>
                  <div className="font-semibold text-lg text-[#1c1917]">
                    {current.name}
                  </div>
                  <div className="text-sm text-[#78716c]">
                    {current.college} · {current.grade}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {current.skills.map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1.5 text-sm font-medium bg-accent-100 text-accent-700 rounded-lg"
                  >
                    {s}
                  </span>
                ))}
              </div>

              <div className="mt-auto pt-4 border-t border-[#e7e5e4]">
                <div className="text-xs text-[#78716c] mb-1">匹配理由</div>
                <div className="text-sm text-[#1c1917] leading-relaxed">
                  {current.reason}
                </div>
                <div className="mt-3 text-sm font-semibold text-accent-600">
                  {current.matchRate}% 匹配度
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-center gap-6 mt-6">
        <button
          onClick={() => handleSwipe("left")}
          className="w-14 h-14 rounded-full border-2 border-[#e7e5e4] bg-white flex items-center justify-center text-[#78716c] hover:border-red-300 hover:text-red-500 active:scale-90 transition-all"
        >
          <X size={26} weight="bold" />
        </button>
        <button
          onClick={() => handleSwipe("right")}
          className="w-14 h-14 rounded-full border-2 border-accent-300 bg-white flex items-center justify-center text-accent-600 hover:bg-accent-50 hover:border-accent-500 active:scale-90 transition-all"
        >
          <Heart size={26} weight="bold" />
        </button>
      </div>

      <div className="text-center mt-4 text-sm text-[#78716c]">
        剩余推荐：{candidates.length - index} 人 · 左右方向键也可操作
      </div>

      {/* Match popup */}
      <AnimatePresence>
        {showMatchPopup && matchResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-6"
            onClick={dismissPopup}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[24px] p-8 max-w-[360px] w-full text-center shadow-[0_20px_60px_rgba(0,0,0,0.2)]"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-accent-100 flex items-center justify-center">
                <Sparkle size={32} weight="fill" className="text-accent-600" />
              </div>
              <h2 className="mt-4 font-display text-2xl font-bold text-[#1c1917]">
                匹配成功！
              </h2>
              <p className="mt-2 text-[#78716c]">
                你和 <span className="font-semibold text-[#1c1917]">{matchResult.targetUser.name}</span> 互相选择了对方
              </p>
              <div className="mt-5 flex items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent-100 flex items-center justify-center text-accent-700 font-bold">
                  {user.avatar}
                </div>
                <div className="w-0.5 h-6 bg-accent-300 rounded" />
                <div className="w-12 h-12 rounded-full bg-accent-100 flex items-center justify-center text-accent-700 font-bold">
                  {matchResult.targetUser.avatar}
                </div>
              </div>
              <button
                onClick={goToChat}
                className="mt-6 w-full py-3 text-sm font-semibold text-white bg-accent-600 rounded-full hover:bg-accent-700 active:scale-[0.98] transition-all"
              >
                开始对话
              </button>
              <button
                onClick={dismissPopup}
                className="mt-2 w-full py-2.5 text-sm font-medium text-[#78716c] rounded-full hover:text-[#1c1917] transition-colors"
              >
                继续匹配
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
