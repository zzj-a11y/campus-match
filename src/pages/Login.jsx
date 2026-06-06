import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { user } = await signIn(email, password);

      // 检查是否已有技能档案 → 决定跳转目标
      const { data: profile } = await supabase
        .from("profiles")
        .select("skills")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profile?.skills?.length > 0) {
        navigate("/match", { replace: true });
      } else {
        navigate("/register", { replace: true });
      }
    } catch (err) {
      const msg = err.message;
      if (msg.includes("Invalid login credentials")) {
        setError("邮箱或密码错误，请重试");
      } else if (msg.includes("Email not confirmed")) {
        setError("邮箱尚未验证，请先点击邮件中的确认链接");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[480px] mx-auto px-6 py-16">
      <h1 className="font-display text-2xl font-bold text-[#1c1917]">
        登录校园智搭
      </h1>
      <p className="mt-1 text-sm text-[#78716c]">
        找到你的学业成长合伙人
      </p>

      {/* Error */}
      {error && (
        <div className="mt-5 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label className="block text-sm font-medium text-[#1c1917] mb-1.5">
            邮箱
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="yourname@school.edu.cn"
            className="w-full px-4 py-3 rounded-lg border border-[#e7e5e4] bg-white text-[#1c1917] text-sm placeholder:text-[#a8a29e] focus:outline-none focus:ring-2 focus:ring-accent-400 transition-shadow"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1c1917] mb-1.5">
            密码
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="至少 6 位字符"
            className="w-full px-4 py-3 rounded-lg border border-[#e7e5e4] bg-white text-[#1c1917] text-sm placeholder:text-[#a8a29e] focus:outline-none focus:ring-2 focus:ring-accent-400 transition-shadow"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 text-sm font-semibold text-white bg-accent-600 rounded-full disabled:opacity-60 disabled:cursor-not-allowed hover:bg-accent-700 active:scale-[0.98] transition-all"
        >
          {loading ? "登录中..." : "登录"}
        </button>
      </form>

      <p className="mt-6 text-sm text-center text-[#78716c]">
        还没有账号？{" "}
        <Link
          to="/register"
          className="text-accent-600 font-medium hover:underline"
        >
          立即注册
        </Link>
      </p>
    </div>
  );
}
