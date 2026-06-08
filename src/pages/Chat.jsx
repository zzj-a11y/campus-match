import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, PaperPlaneTilt, Users } from "@phosphor-icons/react";
import {
  getCurrentUser,
  getConversation,
  sendMessage,
  createProject,
  subscribeMessages,
  getMatchPartner,
} from "../lib/dataStore";

export default function Chat() {
  const { id: matchId } = useParams();
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const messagesEndRef = useRef(null);

  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [partner, setPartner] = useState({ name: "队友", avatar: "队" });
  const [slowHint, setSlowHint] = useState(false);

  // 加载用户和消息
  useEffect(() => {
    let cancelled = false;
    const slowTimer = setTimeout(() => { if (!cancelled) setSlowHint(true); }, 8000);
    (async () => {
      try {
        const u = await getCurrentUser();
        if (cancelled) return;
        if (!u) {
          navigate("/register", { replace: true });
          return;
        }
        setUser(u);

        const [p, msgs] = await Promise.all([
          getMatchPartner(matchId, u.id).catch((e) => { console.error(e); return null; }),
          getConversation(matchId).catch((e) => { console.error(e); return []; }),
        ]);
        if (cancelled) return;
        if (p) setPartner(p);
        setMessages(msgs);
      } catch (e) {
        console.error("Chat load failed:", e);
      } finally {
        if (!cancelled) {
          clearTimeout(slowTimer);
          setLoading(false);
          setSlowHint(false);
        }
      }
    })();
    return () => { cancelled = true; clearTimeout(slowTimer); };
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
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const myMsg = await sendMessage(matchId, input.trim());
    // 立即显示自己发送的消息
    setMessages((prev) => [...prev, myMsg]);
    setInput("");
    // 对方的自动回复由 Realtime subscription 推送
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCreateProject = async () => {
    const project = await createProject(matchId, partner.name);
    navigate(`/project/${project.id}`);
  };

  const handleShareWechat = async () => {
    const wxId = user.wechat || "未设置微信号";
    const myMsg = await sendMessage(matchId, `我的微信号：${wxId}`);
    setMessages((prev) => [...prev, myMsg]);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="w-6 h-6 border-2 border-accent-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[#78716c]">
          {slowHint ? "服务器启动中，请耐心等待..." : "加载中..."}
        </p>
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
          <div className="w-10 h-10 rounded-full bg-accent-100 flex items-center justify-center text-accent-700 font-bold relative">
            {partner.avatar}
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white" />
          </div>
          <div>
            <div className="font-semibold text-[#1c1917]">{partner.name}</div>
            <div className="flex items-center gap-2 text-xs text-[#78716c]">
              <span>在线</span>
              {partner.college && (
                <>
                  <span className="text-[#d6d3d1]">|</span>
                  <span className="bg-accent-100 text-accent-700 px-2 py-0.5 rounded-full text-[11px] font-medium">{partner.college}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleShareWechat}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-accent-600 bg-accent-50 rounded-full border border-accent-200 hover:bg-accent-100 active:scale-[0.98] transition-all"
            title="分享你的微信号给对方"
          >
            分享微信
          </button>
          <button
            onClick={handleCreateProject}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent-600 rounded-full no-underline hover:bg-accent-700 active:scale-[0.98] transition-all"
          >
            <Users size={16} weight="bold" />
            确认组队
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12 text-[#a8a29e] text-sm">
            发送第一条消息，开始你们的合作
          </div>
        )}
        {messages.map((m, idx) => {
          const isMe = m.sender === "me";
          const otherBubbleClass = !isMe && (idx % 4 === 2)
            ? "bg-warm-50 text-[#1c1917] rounded-bl-md"
            : "bg-[#e7e5e4] text-[#1c1917] rounded-bl-md";

          return (
            <div
              key={m.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`msg-enter max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isMe
                    ? "bg-accent-600 text-white rounded-br-md"
                    : otherBubbleClass
                }`}
              >
                {m.text}
                <div
                  className={`text-[11px] mt-1 ${
                    isMe ? "text-accent-200" : "text-[#a8a29e]"
                  }`}
                >
                  {m.time}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
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
