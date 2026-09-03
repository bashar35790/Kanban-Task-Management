"use client";

import type { Task, BoardActivity } from "@/hooks/useBoard";

type SidebarWidgetsProps = {
  tasks: Task[];
  activities: BoardActivity[];
};

export function SidebarWidgets({ tasks, activities }: SidebarWidgetsProps) {
  // Compute progress for each category
  const copywritingTasks = tasks.filter((t) =>
    (t.category || "").toLowerCase().includes("copy")
  );
  const illustrationTasks = tasks.filter((t) =>
    (t.category || "").toLowerCase().includes("illustrat")
  );
  const uiDesignTasks = tasks.filter(
    (t) =>
      !(t.category || "").toLowerCase().includes("copy") &&
      !(t.category || "").toLowerCase().includes("illustrat")
  );

  const categories = [
    {
      name: "Copywriting",
      total: Math.max(copywritingTasks.length, 8),
      completed: 3,
      barColor: "bg-pink-400",
      bgColor: "bg-pink-100",
    },
    {
      name: "Illustrations",
      total: Math.max(illustrationTasks.length, 10),
      completed: 6,
      barColor: "bg-emerald-400",
      bgColor: "bg-emerald-100",
    },
    {
      name: "UI Design",
      total: Math.max(uiDesignTasks.length, 7),
      completed: 2,
      barColor: "bg-blue-400",
      bgColor: "bg-blue-100",
    },
  ];

  // Map icon colors matching Image 1
  const getIconBadge = (color: string) => {
    switch (color) {
      case "orange":
        return "bg-amber-100 text-amber-500";
      case "green":
        return "bg-emerald-100 text-emerald-500";
      case "purple":
        return "bg-indigo-100 text-indigo-500";
      default:
        return "bg-blue-100 text-blue-500";
    }
  };

  return (
    <aside className="w-72 shrink-0 border-l border-slate-100/80 bg-white/40 p-6 flex flex-col gap-8 select-none">
      {/* Task Progress Section */}
      <div>
        <h3 className="text-sm font-bold text-slate-800 tracking-tight mb-5">
          Task Progress
        </h3>

        <div className="space-y-4">
          {categories.map((cat) => {
            const percent = Math.min(
              100,
              Math.round((cat.completed / cat.total) * 100)
            );
            return (
              <div key={cat.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-700">{cat.name}</span>
                  <span className="text-slate-400">
                    {cat.completed}/{cat.total}
                  </span>
                </div>
                {/* Progress bar */}
                <div className={`h-1.5 w-full rounded-full ${cat.bgColor} overflow-hidden`}>
                  <div
                    className={`h-full rounded-full ${cat.barColor} transition-all duration-300`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="flex-1">
        <h3 className="text-sm font-bold text-slate-800 tracking-tight mb-5">
          Recent Activity
        </h3>

        <div className="space-y-4">
          {activities.length > 0 ? (
            activities.slice(0, 5).map((act, index) => (
              <div key={act.id || index} className="flex items-start gap-3">
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${getIconBadge(
                    act.iconColor
                  )}`}
                >
                  ●
                </span>
                <div className="flex flex-col">
                  <p className="text-xs text-slate-700 leading-snug">
                    <span className="font-semibold text-slate-900">{act.userName}</span>{" "}
                    {act.action}
                  </p>
                  <span className="text-[10px] font-medium text-slate-400 mt-0.5">
                    Aug 10
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 italic">No recent activity</p>
          )}
        </div>
      </div>
    </aside>
  );
}
