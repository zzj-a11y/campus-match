import { useState, useEffect, useCallback } from "react";
import { CheckCircle, XCircle, Info, Warning, X } from "@phosphor-icons/react";
import toast from "../lib/toast";

const TOAST_DURATION = 5000;

const typeConfig = {
  success: {
    icon: CheckCircle,
    bg: "bg-emerald-50 border-emerald-200",
    text: "text-emerald-800",
    iconColor: "text-emerald-600",
  },
  error: {
    icon: XCircle,
    bg: "bg-red-50 border-red-200",
    text: "text-red-800",
    iconColor: "text-red-600",
  },
  info: {
    icon: Info,
    bg: "bg-accent-50 border-accent-200",
    text: "text-accent-800",
    iconColor: "text-accent-600",
  },
  warn: {
    icon: Warning,
    bg: "bg-amber-50 border-amber-200",
    text: "text-amber-800",
    iconColor: "text-amber-600",
  },
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const unlisten = toast.listen((t) => {
      setToasts((prev) => [...prev, t]);
      // 自动移除
      if (t.type !== "error") {
        setTimeout(() => remove(t.id), TOAST_DURATION);
      }
    });
    return unlisten;
  }, [remove]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col-reverse gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => {
        const config = typeConfig[t.type] || typeConfig.info;
        const Icon = config.icon;
        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-lg animate-slide-in ${config.bg} ${config.text}`}
            style={{
              animation: "slideInToast 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <Icon size={20} weight="fill" className={`flex-shrink-0 mt-0.5 ${config.iconColor}`} />
            <p className="flex-1 text-sm leading-snug">{t.message}</p>
            <button
              onClick={() => remove(t.id)}
              className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
            >
              <X size={16} weight="bold" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
