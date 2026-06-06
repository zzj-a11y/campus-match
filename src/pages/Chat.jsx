import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, PaperPlaneTilt, Users } from "@phosphor-icons/react";
import {
  getCurrentUser,
  getConversation,
  sendMessage,
  createProject,
  subscribeMessages,
} from "../lib/mockStore";

export default function Chat() {
  const { id: matchId } = useParams();
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);

  // 加载用户和消息
  useEffect(() => {
    (async () => {
      const u = await getCurrentUser();
      if (!u) {
        navigate("/register", { replace: true });
        return;
      }
      setUser(u);

      const msgs = await getConversation(matchId);
      setMessages(msgs.map((m) => ({
        ...m,
        sender: m.sender === u.id ? "me" : "other",
      })));
      setLoading(false);
    })();
  }, [matchId]);

  // Realtime 订阅
  useEffect(() => {
    if (!user) return;

    const channel = subscribeMessages(matchId, user.id, (newMsg) => {
      setMessages((prev) => [...prev, newMsg]);
    });

    return () => {
      channel.unsubscribe();
    };
  }, [matchId, user]);

  // 自动滚动到底部

  const handleSend = async () => {
    if (!input.trim()) return;
    await sendMessage(matchId, input.trim());
    setInput("");
    // Realtime subscription will handle the incoming message display
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCreateProject = async () => {
    const project = await createProject(matchId, "队友");
    navigate(`/project/${project.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-accent-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-[720px] mx-auto px-6 py-6 flex flex-col" style={{ height: "calc(100dvh - 64px - 57px)" }}>
      {/* Chat header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#e7e5e4]">
        <div className="flex items-center gap-3">
          <Link to="/match" className="text-[#78716c] hover:text-[#1c1917] transition-colors">
            <ArrowLeft size={22} />
          </Link>
          <div className="w-10 h-10 rounded-full bg-accent-100 flex items-center justify-center text-accent-700 font-bold">
            队
          </div>
          <div>
            <div className="font-semibold text-[#1c1917]">队友</div>
            <div className="text-xs text-accent-600">在线</div>
          </div>
        </div>
        <button
          onClick={handleCreateProject}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent-600 rounded-full no-underline hover:bg-accent-700 active:scale-[0.98] transition-all"
        >
          <Users size={16} weight="bold" />
          确认组队
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12 text-[#a8a29e] text-sm">
            发送第一条消息，开始你们的合作
          </div>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.sender === "me" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                m.sender === "me"
                  ? "bg-accent-600 text-white rounded-br-md"
                  : "bg-[#e7e5e4] text-[#1c1917] rounded-bl-md"
              }`}
            >
              {m.text}
              <div
                className={`text-[11px] mt-1 ${
                  m.sender === "me" ? "text-accent-200" : "text-[#a8a29e]"
                }`}
              >
                {m.time}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="flex items-center gap-3 pt-3 border-t border-[#e7e5e4]">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入消息..."
          className="flex-1 px-4 py-3 text-sm rounded-full border border-[#e7e5e4] bg-white text-[#1c1917] placeholder-[#a8a29e] focus:outline-none focus:ring-2 focus:ring-accent-300"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="w-11 h-11 rounded-full bg-accent-600 flex items-center justify-center text-white disabled:opacity-40 hover:bg-accent-700 active:scale-90 transition-all"
        >
          <PaperPlaneTilt size={18} weight="bold" />
        </button>
      </div>
    </div>
  );
}
