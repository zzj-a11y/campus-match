import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { SignOut, ChatCenteredDots, Crown, Star } from "@phosphor-icons/react";
import { useAuth } from "../context/AuthContext";
import { getUserMatches } from "../lib/dataStore";
import Avatar from "../components/Avatar";

export default function Nav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [matchCount, setMatchCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    if (user) {
      getUserMatches().then((list) => {
        if (!cancelled) setMatchCount(list.length);
      }).catch((e) => console.error("Nav matches failed:", e));
    } else {
      setMatchCount(0);
    }
    return () => { cancelled = true; };
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 h-16 border-b border-[#e7e5e4] bg-[#fafaf9]/95 backdrop-blur-sm">
      <div className="max-w-[1280px] mx-auto h-full px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 no-underline">
          <span className="font-display text-xl font-extrabold text-[#0d9488] tracking-tight">
            校园智搭
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <Link
            to="/"
            className={`text-sm font-medium no-underline transition-colors ${
              location.pathname === "/"
                ? "text-[#0d9488]"
                : "text-[#78716c] hover:text-[#1c1917]"
            }`}
          >
            首页
          </Link>
          <Link
            to="/square"
            className={`text-sm font-medium no-underline transition-colors ${
              location.pathname === "/square"
                ? "text-[#0d9488]"
                : "text-[#78716c] hover:text-[#1c1917]"
            }`}
          >
            广场
          </Link>
          <Link
            to="/ads"
            className={`text-sm font-medium no-underline transition-colors ${
              location.pathname === "/ads"
                ? "text-[#0d9488]"
                : "text-[#78716c] hover:text-[#1c1917]"
            }`}
          >
            广告
          </Link>
          <Link
            to="/pricing"
            className={`text-sm font-medium no-underline transition-colors ${
              location.pathname === "/pricing"
                ? "text-[#0d9488]"
                : "text-[#78716c] hover:text-[#1c1917]"
            }`}
          >
            会员
          </Link>
          <Link
            to="/match"
            className={`text-sm font-medium no-underline transition-colors ${
              location.pathname === "/match"
                ? "text-[#0d9488]"
                : "text-[#78716c] hover:text-[#1c1917]"
            }`}
          >
            匹配
          </Link>

          {user && (
            <Link
              to="/messages"
              className={`text-sm font-medium no-underline transition-colors inline-flex items-center gap-1.5 ${
                location.pathname === "/messages" || location.pathname.startsWith("/chat")
                  ? "text-[#0d9488]"
                  : "text-[#78716c] hover:text-[#1c1917]"
              }`}
            >
              <ChatCenteredDots size={16} weight="bold" />
              消息
              {matchCount > 0 && (
                <span className="px-1.5 py-0.5 text-[11px] font-bold text-white bg-accent-600 rounded-full leading-none">
                  {matchCount}
                </span>
              )}
            </Link>
          )}

          {user ? (
            /* 已登录：用户信息 + 退出 */
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-[#78716c]">
                <Avatar user={user} size={28} />
                <Link to="/profile" className="hidden sm:inline text-[#1c1917] font-medium no-underline hover:text-accent-600 transition-colors">
                  {user.name || user.email?.split("@")[0]}
                </Link>
                {user.subscription_tier === "yearly" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold text-warm-600 bg-warm-100 rounded-full whitespace-nowrap">
                    <Crown size={12} weight="fill" />
                    年费会员
                  </span>
                )}
                {user.subscription_tier === "semester" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold text-warm-600 bg-warm-100 rounded-full whitespace-nowrap">
                    <Star size={12} weight="fill" />
                    学期会员
                  </span>
                )}
              </div>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-[#78716c] rounded-full border border-[#e7e5e4] hover:text-[#1c1917] hover:border-[#a8a29e] active:scale-[0.98] transition-all"
              >
                <SignOut size={14} />
                <span className="hidden sm:inline">退出</span>
              </button>
            </div>
          ) : (
            /* 未登录：去登录 / 注册 */
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-medium text-[#78716c] hover:text-[#1c1917] no-underline transition-colors"
              >
                登录
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center px-5 py-2 text-sm font-semibold text-white bg-accent-600 rounded-full no-underline hover:bg-accent-700 active:scale-[0.98] transition-all"
              >
                开始匹配
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
