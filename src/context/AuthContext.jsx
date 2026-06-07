import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { signUpLocal, signInLocal, signOutLocal, getCurrentUser } from "../lib/mockStore";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 启动时检查是否已有登录用户
    getCurrentUser().then((u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  // 邮箱注册
  const signUp = useCallback(async (email, password) => {
    const data = await signUpLocal(email, password);
    setUser(data);
    return data;
  }, []);

  // 邮箱登录
  const signIn = useCallback(async (email, password) => {
    const data = await signInLocal(email, password);
    setUser(data);
    return data;
  }, []);

  // 登出
  const signOut = useCallback(async () => {
    signOutLocal();
    setUser(null);
  }, []);

  const value = { user, session: user ? {} : null, loading, signUp, signIn, signOut };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth 必须在 AuthProvider 内部使用");
  }
  return context;
}
