import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ChatCenteredDots, MagnifyingGlass, X } from "@phosphor-icons/react";
import { getUserMatches, deleteMatch } from "../lib/dataStore";
import { useAuth } from "../context/AuthContext";
import toast from "../lib/toast";
import Avatar from "../components/Avatar";

export default function Messages() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [slowHint, setSlowHint] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const slowTimer = setTimeout(() => { if (!cancelled) setSlowHint(true); }, 5000);
    (async () => {
      try {
        if (!user) { navigate("/login", { replace: true }); return; }
        const list = await getUserMatches().catch((e) => { console.error(e); return []; });
        if (cancelled) return;
        setMatches(list);
      } catch (e) {
        console.error("Messages load failed:", e);
      } finally {
        if (!cancelled) { setLoading(false); setSlowHint(false); clearTimeout(slowTimer); }
      }
    })();
    return () => { cancelled = true; clearTimeout(slowTimer); };
  }, []);

  const handleDelete = async (matchId, partnerName) => {
    if (!window.confirm(`确定删除与「${partnerName}」的对话吗？此操作不可撤销。`)) return;
    try {
      await deleteMatch(matchId);
      setMatches((prev) => prev.filter((m) => m.matchId !== matchId));
      toast.success("对话已删除");
    } catch (e) {
      toast.error("删除失败，请重试");
      console.error("deleteMatch failed:", e);
    }
  };

  const filtered = matches.filter((m) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      m.partner.name.toLowerCase().includes(q) ||
      (m.lastMessage || "").toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="w-6 h-6 border-2 border-accent-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[#78716c]">{slowHint ? "服务器启动中..." : "加载中..."}</p>
      </div>
    );
  }

  return (
    <div className="max-w-[640px] mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-[#78716c] hover:text-[#1c1917] transition-colors">
            <ArrowLeft size={22} />
          </Link>
          <h1 className="font-display text-2xl font-bold text-[#1c1917]">消息</h1>
          {matches.length > 0 && (
            <span className="px-2 py-0.5 text-xs font-bold text-white bg-accent-600 rounded-full">{matches.length}</span>
          )}
        </div>
      </div>

      {/* Search */}
      {matches.length > 0 && (
        <div className="relative mb-4">
          <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a8a29e]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索对话..."
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-[#e7e5e4] bg-white text-[#1c1917] placeholder:text-[#a8a29e] focus:outline-none focus:ring-2 focus:ring-accent-400 transition-shadow"
          />
        </div>
      )}

      {/* Conversation list */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-accent-100 flex items-center justify-center">
            <ChatCenteredDots size={28} weight="bold" className="text-accent-600" />
          </div>
          <h2 className="font-display text-xl font-bold text-[#1c1917] mb-1">
            {matches.length === 0 ? "还没有对话" : "没有找到匹配的对话"}
          </h2>
          <p className="text-sm text-[#78716c] mb-6">
            {matches.length === 0
              ? "去招募广场发帖，或到匹配页发现队友吧"
              : "试试其他搜索关键词"
            }
          </p>
          {matches.length === 0 && (
            <div className="flex items-center justify-center gap-3">
              <Link to="/square" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-accent-600 rounded-full no-underline hover:bg-accent-700 active:scale-[0.98] transition-all">
                去招募广场
              </Link>
              <Link to="/match" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-[#1c1917] border border-[#e7e5e4] rounded-full no-underline hover:bg-stone-50 active:scale-[0.98] transition-all">
                去匹配
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((m) => (
            <Link
              key={m.matchId}
              to={`/chat/${m.matchId}`}
              className="flex items-center gap-4 p-4 rounded-2xl border border-[#e7e5e4] bg-white hover:shadow-[0_2px_8px_rgba(28,25,23,0.06)] hover:-translate-y-[1px] no-underline transition-all"
            >
              <Avatar user={m.partner} size={44} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-[#1c1917]">{m.partner.name}</div>
                  <div className="text-xs text-[#a8a29e] flex-shrink-0 ml-2">{m.lastTime}</div>
                </div>
                <div className="text-sm text-[#78716c] truncate mt-0.5">
                  {m.lastMessage || "开始对话"}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDelete(m.matchId, m.partner.name);
                }}
                className="text-[#a8a29e] hover:text-red-500 transition-colors flex-shrink-0 p-1"
                title="删除对话"
              >
                <X size={16} weight="bold" />
              </button>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
