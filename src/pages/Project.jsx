import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Plus, Calendar, User, Star } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "motion/react";
import { getCurrentUser, getProject, updateTask, addTask } from "../lib/dataStore";

function TaskCard({ task, onDragStart }) {
  const isDone = task.status === "done";
  const statusColor = isDone
    ? "#0d9488"
    : task.status === "in_progress"
    ? "#f97316"
    : "#d6d3d1";
  return (
    <motion.div
      layout
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      className={`kanban-card rounded-xl border mb-3 bg-white transition-all hover:shadow-[0_2px_8px_rgba(28,25,23,0.06)] flex ${
        isDone ? "border-[#e7e5e4] opacity-70" : "border-[#e7e5e4]"
      }`}
    >
      {/* 状态色带 */}
      <div className="w-[3px] flex-shrink-0 rounded-l-xl" style={{ backgroundColor: statusColor }} />
      <div className="p-3.5 flex-1">
        <div className={`text-sm font-medium ${isDone ? "text-[#a8a29e] line-through" : "text-[#1c1917]"}`}>
          {task.title}
        </div>
        <div className="mt-2 flex items-center gap-3 text-xs text-[#78716c]">
          <span className="inline-flex items-center gap-1">
            <User size={12} />
            {task.assignee}
          </span>
          <span className="inline-flex items-center gap-1">
            <Calendar size={12} />
            {task.due}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

const columns = [
  { key: "todo", label: "待做" },
  { key: "in_progress", label: "进行中" },
  { key: "done", label: "已完成" },
];

export default function Project() {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [draggedId, setDraggedId] = useState(null);
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    (async () => {
      const u = await getCurrentUser();
      if (!u) {
        navigate("/register", { replace: true });
        return;
      }
      setUser(u);

      const p = await getProject(projectId);
      if (!p) {
        navigate("/", { replace: true });
        return;
      }
      setProject(p);
      setLoading(false);
    })();
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-accent-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !project) return null;

  const refresh = async () => {
    const p = await getProject(projectId);
    if (p) setProject(p);
  };

  const handleDragStart = (e, id) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = async (status) => {
    if (!draggedId) return;
    await updateTask(projectId, draggedId, { status });
    setDraggedId(null);
    refresh();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleAddTask = async () => {
    if (!newTitle.trim()) return;
    await addTask(projectId, newTitle.trim());
    setNewTitle("");
    setShowNewTask(false);
    refresh();
  };

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-6">
      {/* Project header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link to={project.match_id ? `/chat/${project.match_id}` : "/match"} className="text-[#78716c] hover:text-[#1c1917] transition-colors">
            <ArrowLeft size={22} />
          </Link>
          <div>
            <h1 className="font-display text-xl font-bold text-[#1c1917]">
              {project.name}
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              {project.members.map((m) => (
                <span key={m.id} className="text-xs text-[#78716c]">{m.name}</span>
              ))}
              <span className="text-xs text-[#a8a29e]">· {project.members.length} 人</span>
            </div>
          </div>
        </div>
        <button className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#78716c] rounded-full border border-[#e7e5e4] hover:text-[#1c1917] hover:border-[#a8a29e] transition-colors">
          <Star size={14} /> 项目结束
        </button>
      </div>

      {/* Kanban board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map((col) => {
          const colTasks = project.tasks.filter((t) => t.status === col.key);
          const isTodo = col.key === "todo";

          return (
            <div
              key={col.key}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(col.key)}
              className="rounded-2xl border border-[#e7e5e4] bg-white p-4 min-h-[300px]"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      col.key === "todo"
                        ? "bg-[#d97706]"
                        : col.key === "in_progress"
                        ? "bg-accent-600"
                        : "bg-[#16a34a]"
                    }`}
                  />
                  <span className="font-semibold text-sm text-[#1c1917]">
                    {col.label}
                  </span>
                  <span className="text-xs text-[#a8a29e]">{colTasks.length}</span>
                </div>
              </div>

              <AnimatePresence>
                {colTasks.map((t) => (
                  <TaskCard key={t.id} task={t} onDragStart={handleDragStart} />
                ))}
              </AnimatePresence>

              {colTasks.length === 0 && (
                <div className="text-center py-8 text-sm text-[#a8a29e]">
                  拖拽任务到此处
                </div>
              )}

              {isTodo && showNewTask && (
                <div className="rounded-xl border-2 border-dashed border-accent-300 p-3 mb-3">
                  <input
                    type="text"
                    autoFocus
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddTask();
                      if (e.key === "Escape") setShowNewTask(false);
                    }}
                    placeholder="任务标题..."
                    className="w-full text-sm border-none outline-none bg-transparent text-[#1c1917] placeholder-[#a8a29e]"
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={handleAddTask}
                      className="px-3 py-1 text-xs font-semibold text-white bg-accent-600 rounded-full hover:bg-accent-700 transition-colors"
                    >
                      添加
                    </button>
                    <button
                      onClick={() => setShowNewTask(false)}
                      className="px-3 py-1 text-xs font-medium text-[#78716c] rounded-full hover:text-[#1c1917] transition-colors"
                    >
                      取消
                    </button>
                  </div>
                </div>
              )}

              {isTodo && !showNewTask && (
                <button
                  onClick={() => setShowNewTask(true)}
                  className="w-full py-2.5 text-sm text-[#a8a29e] rounded-xl border border-dashed border-[#e7e5e4] hover:text-accent-600 hover:border-accent-300 transition-colors flex items-center justify-center gap-1"
                >
                  <Plus size={14} />
                  新建任务
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
