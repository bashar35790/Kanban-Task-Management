"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { BoardRole } from "@/hooks/useBoards";

export type Task = {
  id: string;
  columnId: string;
  title: string;
  description: string | null;
  category: string;
  dueDate: string | null;
  commentsCount: number;
  attachmentsCount: number;
  assigneeId: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
};

export type Column = {
  id: string;
  boardId: string;
  title: string;
  position: number;
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
};

export type Member = {
  id: string;
  boardId: string;
  userId: string;
  role: BoardRole;
  createdAt: string;
  user?: { id: string; name: string; email: string; image: string | null };
};

export type BoardActivity = {
  id: string;
  boardId: string;
  userName: string;
  action: string;
  target?: string | null;
  iconColor: string; // orange, green, purple, blue
  createdAt: string;
};

export type BoardDetail = {
  board: {
    id: string;
    title: string;
    description: string | null;
    ownerId: string;
    isFavorite: boolean;
    createdAt: string;
    updatedAt: string;
    columns: Column[];
    members: Member[];
    activities: BoardActivity[];
  };
  yourRole: BoardRole;
};

export function useBoard(boardId: string) {
  return useQuery({
    queryKey: ["board", boardId],
    queryFn: async () => {
      const data = await apiFetch<BoardDetail>(`/boards/${boardId}`);
      return data;
    },
    enabled: Boolean(boardId),
    staleTime: 10_000,
  });
}
