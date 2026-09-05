"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanTask } from "./KanbanTask";
import { AddColumnForm } from "./AddColumnForm";
import { EditTaskModal } from "./EditTaskModal";
import type { Column, Task } from "@/hooks/useBoard";

type KanbanBoardProps = {
  columns: Column[];
  canEdit: boolean;
  onMoveTask: (input: {
    taskId: string;
    targetColumnId: string;
    afterTaskId: string | null;
    beforeTaskId: string | null;
  }) => void;
  onAddColumn: (title: string) => void;
  onDeleteColumn: (columnId: string) => void;
  onUpdateColumn?: (columnId: string, title: string) => void;
  onAddTask: (columnId: string, title: string, category: string, assignee: string) => void;
  onDeleteTask: (task: Task) => void;
  onUpdateTask?: (taskId: string, data: any) => Promise<void>;
};

export function KanbanBoard({
  columns,
  canEdit,
  onMoveTask,
  onAddColumn,
  onDeleteColumn,
  onUpdateColumn,
  onAddTask,
  onDeleteTask,
  onUpdateTask,
}: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { distance: 5 },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 250, tolerance: 5 },
  });
  const sensors = useSensors(mouseSensor, touchSensor);

  const allTasks = columns.flatMap((c) => c.tasks);

  const handleDragStart = (event: DragStartEvent) => {
    const task = allTasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    if (active.id === over.id) return;

    const draggedTask = allTasks.find((t) => t.id === active.id);
    if (!draggedTask) return;

    const overTask = allTasks.find((t) => t.id === over.id);
    let targetColumnId = draggedTask.columnId;

    if (overTask) {
      targetColumnId = overTask.columnId;
      const colTasks = columns.find((c) => c.id === targetColumnId)?.tasks ?? [];
      const targetTasks = colTasks.filter((t) => t.id !== draggedTask.id);
      const overIndex = targetTasks.findIndex((t) => t.id === overTask.id);

      const reordered = [...targetTasks];
      reordered.splice(overIndex < 0 ? reordered.length : overIndex, 0, draggedTask);

      const after = reordered[reordered.indexOf(draggedTask) - 1] ?? null;
      const before = reordered[reordered.indexOf(draggedTask) + 1] ?? null;

      onMoveTask({
        taskId: draggedTask.id,
        targetColumnId,
        afterTaskId: after?.id ?? null,
        beforeTaskId: before?.id ?? null,
      });
    } else {
      targetColumnId = String(over.id);
      const targetTasks = columns.find((c) => c.id === targetColumnId)?.tasks ?? [];

      if (targetColumnId === draggedTask.columnId && targetTasks.length === 1) {
        return;
      }

      const after = targetTasks.filter((t) => t.id !== draggedTask.id).at(-1) ?? null;

      onMoveTask({
        taskId: draggedTask.id,
        targetColumnId,
        afterTaskId: after?.id ?? null,
        beforeTaskId: null,
      });
    }
  };

  const handleDragCancel = () => setActiveTask(null);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="kanban-scroll kanban-snap flex items-start gap-3 overflow-x-auto pb-4 pt-1 sm:gap-4 sm:pb-6">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            canEdit={canEdit}
            onDeleteColumn={() => onDeleteColumn(column.id)}
            onUpdateColumnTitle={(title) => onUpdateColumn?.(column.id, title)}
            onAddTask={(title, category, assignee) =>
              onAddTask(column.id, title, category, assignee)
            }
            onDeleteTask={onDeleteTask}
            onEditTask={(task) => setEditingTask(task)}
          />
        ))}
        {canEdit ? <AddColumnForm onSubmit={onAddColumn} /> : null}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="pointer-events-none w-[78vw] max-w-[17rem] rotate-2 scale-105 shadow-2xl sm:w-72 sm:max-w-none">
            <KanbanTask task={activeTask} />
          </div>
        ) : null}
      </DragOverlay>

      {canEdit && (
        <EditTaskModal
          open={Boolean(editingTask)}
          onClose={() => setEditingTask(null)}
          task={editingTask}
          onSave={async (taskId, data) => {
            if (onUpdateTask) {
              await onUpdateTask(taskId, data);
            }
          }}
        />
      )}
    </DndContext>
  );
}
