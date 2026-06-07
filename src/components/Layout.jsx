import { Outlet, useLocation } from "react-router-dom";
import Nav from "./Nav";

export default function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#fafaf9]">
      <Nav />
      <main className="flex-1 page-enter" key={location.pathname}>
        <Outlet />
      </main>
      <footer className="border-t border-[#e7e5e4] py-6 px-6">
        <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-[#78716c]">
          <span>校园智搭 - 不止是搭子，更是你的学业成长合伙人</span>
          <span>2026 校园智搭团队</span>
        </div>
      </footer>
    </div>
  );
}
