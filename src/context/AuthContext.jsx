import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import toast from "../lib/toast";
import {
  signOutLocal,
  getAllUsers,
  getUserMatches,
} from "../lib/dataStore";

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
      .select("name, college, grade, skills, goal, wechat, role, avatar_url, subscription_tier, gpa, awards")
      .eq("user_id", authUser.id)
      .maybeSingle();

    const userData = {
      id: authUser.id,
      email: authUser.email,
      name: profile?.name || authUser.email?.split("@")[0] || "",
      avatar: (profile?.name || authUser.email || "?")[0],
      avatar_url: profile?.avatar_url || null,
      college: profile?.college || "",
      grade: profile?.grade || "",
      skills: profile?.skills || [],
      goal: profile?.goal || "",
      wechat: profile?.wechat || "",
      role: profile?.role || null,
      subscription_tier: profile?.subscription_tier || "free",
      gpa: profile?.gpa || "",
      awards: profile?.awards || [],
    };
    setUser(userData);
    localStorage.setItem("campus_current_user", authUser.id);
    setLoading(false);

    // 后台预加载热点数据（不阻塞渲染，不抛错）
    preloadCriticalData();

    return userData;
  }

  // 注册
  const signUp = useCallback(async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    });
    if (error) throw error;
    if (!data.user) throw new Error("注册失败，请重试");

    return await loadProfile(data.user);
  }, []);

  // 登录
  const signIn = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const userData = await loadProfile(data.user);
    toast.success(`欢迎回来，${userData.name || '同学'}`);
    return userData;
  }, []);

  // 登出
  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("campus_current_user");
    signOutLocal();
    setUser(null);
    toast.info("已安全退出");
  }, []);

  // 后台静默预加载热点数据，缓存到 localStorage 和内存
  function preloadCriticalData() {
    setTimeout(() => {
      getAllUsers().catch(() => {});
      getUserMatches().catch(() => {});
    }, 0);
  }

  const value = { user, session: user ? {} : null, loading, signUp, signIn, signOut };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth 必须在 AuthProvider 内部使用");
  return context;
}
