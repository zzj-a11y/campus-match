import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { SignOut, User, ChatCenteredDots } from "@phosphor-icons/react";
import { useAuth } from "../context/AuthContext";
import { getUserMatches } from "../lib/dataStore";

export default function Nav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [matchCount, setMatchCount] = useState(0);
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    if (user) {
      getUserMatches().then((list) => {
        setMatches(list);
        setMatchCount(list.length);
      });
    }
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
            to="/match"
            className={`text-sm font-medium no-underline transition-colors ${
              location.pathname === "/match"
                ? "text-[#0d9488]"
                : "text-[#78716c] hover:text-[#1c1917]"
            }`}
          >
            匹配
          </Link>

          {user && matchCount > 0 && (
            <div className="relative group">
              <Link
                to={`/chat/${matches[0]?.matchId}`}
                className={`text-sm font-medium no-underline transition-colors inline-flex items-center gap-1.5 ${
                  location.pathname.startsWith("/chat")
                    ? "text-[#0d9488]"
                    : "text-[#78716c] hover:text-[#1c1917]"
                }`}
              >
                <ChatCenteredDots size={16} weight="bold" />
                对话
                <span className="px-1.5 py-0.5 text-[11px] font-bold text-white bg-accent-600 rounded-full leading-none">
                  {matchCount}
                </span>
              </Link>
              {/* 下拉对话列表 */}
              <div className="absolute top-full right-0 mt-2 w-64 rounded-xl border border-[#e7e5e4] bg-white shadow-[0_8px_32px_rgba(28,25,23,0.12)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <div className="p-2">
                  {matches.map((m) => (
                    <Link
                      key={m.matchId}
                      to={`/chat/${m.matchId}`}
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-stone-50 no-underline transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-accent-100 flex items-center justify-center text-accent-700 font-bold text-sm flex-shrink-0">
                        {m.partner.avatar}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-[#1c1917]">{m.partner.name}</div>
                        <div className="text-xs text-[#78716c] truncate">{m.lastMessage || "开始对话"}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {user ? (
            /* 已登录：用户信息 + 退出 */
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-[#78716c]">
                <User size={16} weight="bold" />
                <span className="hidden sm:inline text-[#1c1917] font-medium">
                  {user.name || user.email?.split("@")[0]}
                </span>
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
