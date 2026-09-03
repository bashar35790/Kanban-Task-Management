"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { BoardDetail, Column, Task } from "@/hooks/useBoard";

type MoveInput = {
  taskId: string;
  targetColumnId: string;
  afterTaskId: string | null;
  beforeTaskId: string | null;
};

export function useMoveTask(boardId: string) {
  const queryClient = useQueryClient();
  const key = ["board", boardId];

  return useMutation({
    mutationFn: async (input: MoveInput) => {
      const data = await apiFetch<{ task: Task }>(`/tasks/${input.taskId}/move`, {
        method: "POST",
        body: JSON.stringify({
          targetColumnId: input.targetColumnId,
          afterTaskId: input.afterTaskId,
          beforeTaskId: input.beforeTaskId,
        }),
      });
      return data.task;
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<BoardDetail>(key);

      queryClient.setQueryData<BoardDetail>(key, (old) => {
        if (!old) return old;
        const allTasks = old.board.columns.flatMap((c) => c.tasks);
        const task = allTasks.find((t) => t.id === input.taskId);
        if (!task) return old;

        const next = structuredClone(old);

        const removeFrom = (columnId: string) =>
          next.board.columns.map((c) =>
            c.id === columnId
              ? { ...c, tasks: c.tasks.filter((t) => t.id !== task.id) }
              : c
          );

        next.board.columns = removeFrom(task.columnId);

        const target = next.board.columns.find(
          (c) => c.id === input.targetColumnId
        );
        if (!target) return next;

        let tasks = target.tasks.filter((t) => t.id !== task.id);

        if (input.afterTaskId === null && input.beforeTaskId === null) {
          tasks = [...tasks, { ...task, columnId: input.targetColumnId }];
        } else if (input.afterTaskId === null) {
          tasks = [{ ...task, columnId: input.targetColumnId }, ...tasks];
        } else if (input.beforeTaskId === null) {
          tasks = [...tasks, { ...task, columnId: input.targetColumnId }];
        } else {
          const afterIdx = tasks.findIndex((t) => t.id === input.afterTaskId);
          const insertAt = afterIdx >= 0 ? afterIdx + 1 : tasks.length;
          tasks.splice(insertAt, 0, {
            ...task,
            columnId: input.targetColumnId,
          });
        }

        next.board.columns = next.board.columns.map((c) =>
          c.id === target.id ? { ...c, tasks } : c
        );

        return next;
      });

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(key, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: key });
    },
  });
}

export function useAddColumn(boardId: string) {
  const queryClient = useQueryClient();
  const key = ["board", boardId];

  return useMutation({
    mutationFn: async (title: string) => {
      const data = await apiFetch<{ column: Column }>(
        `/boards/${boardId}/columns`,
        { method: "POST", body: JSON.stringify({ title }) }
      );
      return data.column;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key });
    },
  });
}

export function useDeleteColumn(boardId: string) {
  const queryClient = useQueryClient();
  const key = ["board", boardId];

  return useMutation({
    mutationFn: async (columnId: string) => {
      await apiFetch(`/columns/${columnId}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key });
    },
  });
}

export type AddTaskInput = {
  columnId: string;
  title: string;
  description?: string;
  category?: string;
  dueDate?: string;
  assigneeId?: string;
};

export function useAddTask(boardId: string) {
  const queryClient = useQueryClient();
  const key = ["board", boardId];

  return useMutation({
    mutationFn: async (input: AddTaskInput) => {
      const data = await apiFetch<{ task: Task }>(
        `/columns/${input.columnId}/tasks`,
        {
          method: "POST",
          body: JSON.stringify({
            title: input.title,
            description: input.description ?? undefined,
            category: input.category || "UI Design",
            dueDate: input.dueDate || "Nov 24",
            assigneeId: input.assigneeId || "Samantha",
          }),
        }
      );
      return data.task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key });
    },
  });
}

export function useDeleteTask(boardId: string) {
  const queryClient = useQueryClient();
  const key = ["board", boardId];

  return useMutation({
    mutationFn: async (taskId: string) => {
      await apiFetch(`/tasks/${taskId}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key });
    },
  });
}
