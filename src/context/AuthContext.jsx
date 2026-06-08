import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 启动时从 Supabase session 恢复
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // 监听 auth 状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadProfile(session.user);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadProfile(authUser) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("name, college, grade, skills, goal, wechat, role")
      .eq("user_id", authUser.id)
      .maybeSingle();  // maybeSingle: 0 行返回 null，不抛异常

    const userData = {
      id: authUser.id,
      email: authUser.email,
      name: profile?.name || authUser.email?.split("@")[0] || "",
      avatar: (profile?.name || authUser.email || "?")[0],
      college: profile?.college || "",
      grade: profile?.grade || "",
      skills: profile?.skills || [],
      goal: profile?.goal || "",
      wechat: profile?.wechat || "",
      role: profile?.role || null,
    };
    setUser(userData);
    localStorage.setItem("campus_current_user", authUser.id);
    setLoading(false);
    return userData;
  }

  // 注册：Supabase Auth signUp — profiles 由 DB 触发器自动创建
  const signUp = useCallback(async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    });
    if (error) throw error;
    if (!data.user) throw new Error("注册失败，请重试");

    // profiles 已由 handle_new_user() 触发器自动创建，直接加载
    return await loadProfile(data.user);
  }, []);

  // 登录
  const signIn = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    return await loadProfile(data.user);
  }, []);

  // 登出
  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("campus_current_user");
    setUser(null);
  }, []);

  const value = { user, session: user ? {} : null, loading, signUp, signIn, signOut };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth 必须在 AuthProvider 内部使用");
  return context;
}
