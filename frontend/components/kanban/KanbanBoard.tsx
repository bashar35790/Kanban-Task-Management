"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanTask } from "./KanbanTask";
import { AddColumnForm } from "./AddColumnForm";
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
  onAddTask: (columnId: string, title: string, category: string, assignee: string) => void;
  onDeleteTask: (task: Task) => void;
};

export function KanbanBoard({
  columns,
  canEdit,
  onMoveTask,
  onAddColumn,
  onDeleteColumn,
  onAddTask,
  onDeleteTask,
}: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

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
      <div className="flex gap-4 overflow-x-auto pb-6 pt-1 items-start">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            canEdit={canEdit}
            onDeleteColumn={() => onDeleteColumn(column.id)}
            onAddTask={(title, category, assignee) =>
              onAddTask(column.id, title, category, assignee)
            }
            onDeleteTask={onDeleteTask}
          />
        ))}
        {canEdit ? <AddColumnForm onSubmit={onAddColumn} /> : null}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="w-68 rotate-2 scale-105 pointer-events-none shadow-2xl">
            <KanbanTask task={activeTask} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
