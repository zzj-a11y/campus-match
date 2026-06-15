import { Outlet, useLocation } from "react-router-dom";
import { MeshGradient } from "@paper-design/shaders-react";
import { useTheme } from "../context/ThemeContext";
import Nav from "./Nav";

export default function Layout() {
  const location = useLocation();
  const { theme } = useTheme();

  return (
    <div className="min-h-[100dvh] flex flex-col relative">
      {/* 动态背景 */}
      {theme === "dark" ? (
        <MeshGradient
          className="fixed inset-0 w-full h-full z-0"
          colors={["#0f172a", "#0d9488", "#115e59", "#f97316", "#0f172a"]}
          speed={0.3}
          backgroundColor="#0f172a"
        />
      ) : (
        <MeshGradient
          className="fixed inset-0 w-full h-full z-0 pointer-events-none"
          colors={["#f0fdfa", "#ccfbf1", "#0d9488", "#f0fdfa"]}
          speed={0.2}
          backgroundColor="transparent"
        />
      )}
      <Nav />
      <main className="flex-1 page-enter relative z-10" key={location.pathname}>
        <Outlet />
      </main>
      <footer className="border-t border-[#e7e5e4] dark:border-slate-700 py-6 px-6 relative z-10">
        <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-[#78716c] dark:text-slate-400">
          <span>校园智搭 - 不止是搭子，更是你的学业成长合伙人</span>
          <span>2026 校园智搭团队</span>
        </div>
      </footer>
    </div>
  );
}
