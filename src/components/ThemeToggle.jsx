import { useState } from "react";

export default function ThemeToggle({ checked = false, onChange = () => {} }) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      className={`relative h-7 w-12 rounded-full p-0.5 transition-all duration-500 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 ${
        checked ? "bg-accent-600 shadow-[0_0_12px_rgba(13,148,136,0.3)]" : "bg-[#d6d3d1]"
      }`}
    >
      {/* 光晕 */}
      <div
        className={`absolute inset-0 rounded-full transition-opacity duration-500 ${
          checked ? "opacity-100" : "opacity-0"
        }`}
        style={{
          boxShadow: checked ? "0 0 16px rgba(13,148,136,0.35)" : "none",
        }}
      />

      {/* 滑块 */}
      <div
        className={`relative h-6 w-6 rounded-full bg-white shadow-md transition-all duration-500 ${
          isPressed ? "scale-90 duration-150" : ""
        }`}
        style={{
          transform: checked ? "translateX(20px)" : "translateX(0)",
          transitionTimingFunction: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        }}
      >
        {/* 滑块中心指示点 */}
        <div
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-500 ${
            checked ? "h-2.5 w-2.5 bg-accent-500 scale-100" : "h-1.5 w-1.5 bg-[#a8a29e] scale-100"
          }`}
        />
      </div>
    </button>
  );
}
