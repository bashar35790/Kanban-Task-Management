"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "@/hooks/useBoard";
import { Avatar } from "@/components/ui/Avatar";

type KanbanTaskProps = {
  task: Task;
  onDelete?: () => void;
  onEdit?: () => void;
  disabled?: boolean;
};

function getTagStyle(category: string) {
  const cat = (category || "").toLowerCase();
  if (cat.includes("copy")) {
    return "bg-pink-50 text-pink-500 border border-pink-100";
  }
  if (cat.includes("illustrat")) {
    return "bg-emerald-50 text-emerald-500 border border-emerald-100";
  }
  return "bg-blue-50 text-blue-500 border border-blue-100";
}

export function KanbanTask({ task, onDelete, onEdit, disabled }: KanbanTaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        if (onEdit && (e.target as HTMLElement).tagName !== "BUTTON" && !(e.target as HTMLElement).closest("button")) {
          onEdit();
        }
      }}
      className={`group relative flex min-w-0 flex-col rounded-2xl border border-slate-100 bg-white p-3.5 shadow-xs transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-pink-200 hover:shadow-md hover:shadow-pink-100/60 select-none sm:p-4 ${
        disabled ? "" : "cursor-grab active:cursor-grabbing"
      } ${
        isDragging ? "z-20 opacity-40 ring-2 ring-indigo-400" : ""
      }`}
    >
      {/* Top row: Category Pill + action buttons */}
      <div className="mb-2.5 flex min-w-0 items-center justify-between gap-2">
        <span
          className={`inline-flex min-w-0 max-w-full items-center truncate rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${getTagStyle(
            task.category
          )}`}
        >
          <span className="truncate">{task.category || "UI Design"}</span>
        </span>

        <div className="flex items-center gap-0.5">
          {onEdit ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              title="Edit task"
              className="text-slate-400 hover:text-pink-500 hover:bg-pink-50 rounded p-1 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          ) : null}

          {onDelete ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              title="Delete task"
              className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded p-1 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          ) : (
            <span className="text-slate-300 text-xs leading-none">•••</span>
          )}
        </div>
      </div>

      {/* Task Title */}
      <h4 className="mb-3 text-[13px] break-words font-semibold text-slate-800 leading-snug line-clamp-3">
        {task.title}
      </h4>

      {/* Task Meta Footer: Date, Comments, Attachments, Assignee */}
      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5 pt-1 text-[11px] font-medium text-slate-400">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1">
          {/* Due date */}
          <span className="flex items-center gap-1">
            <svg className="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
            </svg>
            {task.dueDate || "Nov 24"}
          </span>

          {/* Comments count */}
          <span className="flex items-center gap-1">
            <svg className="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {task.commentsCount ?? 2}
          </span>

          {/* Attachments count */}
          <span className="flex items-center gap-1">
            <svg className="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            {task.attachmentsCount ?? 5}
          </span>
        </div>

        {/* Assignee Avatar */}
        <Avatar name={task.assigneeId || "Samantha"} size="xs" />
      </div>
    </div>
  );
}
