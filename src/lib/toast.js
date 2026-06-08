// ============================================================
// Toast 通知系统 — 全局可用，React 和非 React 代码均可调用
// 用法：import toast from '../lib/toast';
//       toast.success('操作成功');
//       toast.error('操作失败');
//       toast.info('提示信息');
// ============================================================

const listeners = new Set();

const toast = {
  listen(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  _emit(message, type = "info") {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const toast = { id, message, type };
    listeners.forEach((fn) => fn(toast));
  },

  success(message) {
    this._emit(message, "success");
  },

  error(message) {
    // 如果是 Error 对象，提取 message
    const msg = message instanceof Error ? message.message : message;
    this._emit(msg || "操作失败，请重试", "error");
  },

  info(message) {
    this._emit(message, "info");
  },

  warn(message) {
    this._emit(message, "warn");
  },
};

export default toast;
