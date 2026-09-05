"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  MeasuringStrategy,
  closestCorners,
  defaultDropAnimationSideEffects,
  useDndContext,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type {
  DragStartEvent,
  DragEndEvent,
  DropAnimation,
} from "@dnd-kit/core";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanTask } from "./KanbanTask";
import { AddColumnForm } from "./AddColumnForm";
import { EditTaskModal } from "./EditTaskModal";
import type { Column, Task } from "@/hooks/useBoard";

type KanbanBoardProps = {
  columns: Column[];
  canEdit: boolean;
  dragDisabled?: boolean;
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

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: { active: { opacity: "0.4" } },
  }),
};

// Rendered inside the DragOverlay. Sized exactly like the dragged card so
// the preview stays 1:1 under the cursor (no width jump, no offset).
function DragPreview({ task }: { task: Task }) {
  const { active } = useDndContext();
  const width = active?.rect.current.initial?.width ?? undefined;

  return (
    <div
      style={width ? { width } : undefined}
      className="pointer-events-none rounded-2xl shadow-2xl shadow-pink-200/50 ring-1 ring-pink-200"
    >
      <KanbanTask task={task} />
    </div>
  );
}

export function KanbanBoard({
  columns,
  canEdit,
  dragDisabled,
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
  // Portal target for the drag overlay (client-only: document is
  // unavailable during server prerender).
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
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
    if (dragDisabled) return;
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
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
      autoScroll={{ layoutShiftCompensation: true }}
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
            dragDisabled={dragDisabled}
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

      {/* Portalled to document.body so ancestor transforms/filters
          (e.g. backdrop-blur) can't offset the fixed-position preview —
          the card stays exactly under the cursor while dragging. */}
      {mounted
        ? createPortal(
            <DragOverlay dropAnimation={dropAnimation} adjustScale={false}>
              {activeTask ? <DragPreview task={activeTask} /> : null}
            </DragOverlay>,
            document.body
          )
        : null}

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
