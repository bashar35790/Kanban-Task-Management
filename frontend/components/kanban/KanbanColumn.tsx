"use client";

import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { KanbanTask } from "./KanbanTask";
import { CreateTaskCard } from "./CreateTaskCard";
import type { Column, Task } from "@/hooks/useBoard";

type KanbanColumnProps = {
  column: Column;
  canEdit: boolean;
  onDeleteColumn: () => void;
  onUpdateColumnTitle?: (title: string) => void;
  onAddTask: (title: string, category: string, assignee: string) => void;
  onDeleteTask: (task: Task) => void;
  onEditTask?: (task: Task) => void;
};

export function KanbanColumn({
  column,
  canEdit,
  onDeleteColumn,
  onUpdateColumnTitle,
  onAddTask,
  onDeleteTask,
  onEditTask,
}: KanbanColumnProps) {
  const [showCreateCard, setShowCreateCard] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(column.title);
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleInput.trim() && titleInput.trim() !== column.title) {
      onUpdateColumnTitle?.(titleInput.trim());
    } else {
      setTitleInput(column.title);
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={`flex w-[78vw] max-w-[18rem] shrink-0 snap-start flex-col rounded-2xl p-2 transition-all duration-200 sm:w-72 sm:max-w-none sm:rounded-3xl ${
        isOver ? "bg-indigo-50/40 ring-2 ring-indigo-300" : "bg-transparent"
      }`}
    >
      <div className="mb-3 flex items-center justify-between px-2 pt-1">
        <div className="flex items-center gap-2 flex-1 min-w-0 mr-2">
          {isEditingTitle ? (
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleTitleSubmit();
                if (e.key === "Escape") {
                  setTitleInput(column.title);
                  setIsEditingTitle(false);
                }
              }}
              autoFocus
              className="h-7 w-full rounded-lg border border-indigo-400 bg-white px-2 text-sm font-bold text-slate-800 shadow-xs focus:outline-none"
            />
          ) : (
            <div className="flex items-center gap-1.5 min-w-0">
              <h3
                onDoubleClick={() => canEdit && setIsEditingTitle(true)}
                title={canEdit ? "Double-click to rename" : undefined}
                className="text-sm font-bold text-slate-800 tracking-tight truncate cursor-default"
              >
                {column.title}
              </h3>
              {canEdit ? (
                <button
                  onClick={() => setIsEditingTitle(true)}
                  title="Rename column"
                  className="text-slate-300 hover:text-indigo-600 rounded p-0.5 transition-colors cursor-pointer"
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              ) : null}
            </div>
          )}
          <span className="text-xs font-semibold text-slate-400 shrink-0">
            {column.tasks.length}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {canEdit ? (
            <button
              onClick={onDeleteColumn}
              title="Delete column"
              className="text-slate-300 hover:text-rose-500 rounded p-1 transition-colors cursor-pointer"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          ) : (
            <span className="text-slate-300 text-xs">•••</span>
          )}
        </div>
      </div>

      {/* Task List */}
      <SortableContext
        items={column.tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex max-h-[52dvh] flex-col gap-2.5 overflow-y-auto overscroll-contain px-0.5 pb-1 pt-0.5 sm:gap-3 lg:max-h-[calc(100dvh-24rem)]">
          {column.tasks.map((task) => (
            <KanbanTask
              key={task.id}
              task={task}
              onEdit={canEdit && onEditTask ? () => onEditTask(task) : undefined}
              onDelete={canEdit ? () => onDeleteTask(task) : undefined}
            />
          ))}

          {/* Inline Create Task Card */}
          {canEdit && showCreateCard ? (
            <CreateTaskCard
              columnTitle={column.title}
              onCancel={() => setShowCreateCard(false)}
              onSubmit={(title, category, assignee) => {
                onAddTask(title, category, assignee);
                setShowCreateCard(false);
              }}
            />
          ) : null}

          {column.tasks.length === 0 && !showCreateCard ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200/80 p-6 text-center text-xs text-slate-400">
              Empty column
            </div>
          ) : null}
        </div>
      </SortableContext>

      {canEdit && !showCreateCard ? (
        <button
          onClick={() => setShowCreateCard(true)}
          className="mt-2.5 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold text-slate-400 hover:text-indigo-600 hover:bg-white/60 transition-all cursor-pointer"
        >
          <span className="text-sm leading-none">+</span> Add Card
        </button>
      ) : null}
    </div>
  );
}
