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
  onAddTask: (title: string, category: string, assignee: string) => void;
  onDeleteTask: (task: Task) => void;
};

export function KanbanColumn({
  column,
  canEdit,
  onDeleteColumn,
  onAddTask,
  onDeleteTask,
}: KanbanColumnProps) {
  const [showCreateCard, setShowCreateCard] = useState(false);
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div
      ref={setNodeRef}
      className={`flex w-72 shrink-0 flex-col rounded-3xl p-2 transition-all duration-200 ${
        isOver ? "bg-indigo-50/40 ring-2 ring-indigo-300" : "bg-transparent"
      }`}
    >
      <div className="mb-3 flex items-center justify-between px-2 pt-1">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-slate-800 tracking-tight">{column.title}</h3>
          <span className="text-xs font-semibold text-slate-400">
            {column.tasks.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
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
        <div className="flex flex-col gap-3 min-h-[100px]">
          {column.tasks.map((task) => (
            <KanbanTask
              key={task.id}
              task={task}
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
