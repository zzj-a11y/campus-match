import { useState } from "react";

const PALETTE = [
  "bg-accent-100 text-accent-700",
  "bg-warm-100 text-warm-600",
  "bg-blue-100 text-blue-700",
  "bg-green-100 text-green-700",
  "bg-purple-100 text-purple-700",
  "bg-pink-100 text-pink-700",
  "bg-amber-100 text-amber-700",
  "bg-indigo-100 text-indigo-700",
];

function hashName(name) {
  let h = 0;
  for (let i = 0; i < (name || "").length; i++) {
    h = (h * 31 + name.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export default function Avatar({ user, size = 40 }) {
  const [imgFailed, setImgFailed] = useState(false);

  if (!user) return null;

  const avatarUrl = user?.avatar_url || null;
  const displayName = user?.name || user?.college || user?.email?.split("@")[0] || "";
  const initial = (user?.avatar || displayName[0] || "?")[0];
  const colorClass = PALETTE[hashName(displayName) % PALETTE.length];

  if (avatarUrl && !imgFailed) {
    return (
      <img
        src={avatarUrl}
        alt={displayName}
        onError={() => setImgFailed(true)}
        className="rounded-full object-cover flex-shrink-0"
        style={{ width: size, height: size, minWidth: size, minHeight: size }}
      />
    );
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}
      style={{ width: size, height: size, minWidth: size, minHeight: size }}
      title={displayName}
    >
      <span
        className="font-bold select-none"
        style={{ fontSize: size * 0.4 }}
      >
        {initial}
      </span>
    </div>
  );
}
