"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { Member } from "@/hooks/useBoard";
import type { BoardRole } from "@/hooks/useBoards";

export function useMembers(boardId: string) {
  const queryKey = ["members", boardId];
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const data = await apiFetch<{ members: Member[] }>(
        `/boards/${boardId}/members`
      );
      return data.members;
    },
    enabled: Boolean(boardId),
  });

  const invite = useMutation({
    mutationFn: async (input: { email: string; role: BoardRole }) => {
      const data = await apiFetch<{ member: Member }>(
        `/boards/${boardId}/members`,
        {
          method: "POST",
          body: JSON.stringify(input),
        }
      );
      return data.member;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const changeRole = useMutation({
    mutationFn: async (input: { userId: string; role: BoardRole }) => {
      const data = await apiFetch<{ member: Member }>(
        `/boards/${boardId}/members/${input.userId}`,
        {
          method: "PATCH",
          body: JSON.stringify({ role: input.role }),
        }
      );
      return data.member;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const removeMember = useMutation({
    mutationFn: async (userId: string) => {
      await apiFetch(`/boards/${boardId}/members/${userId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return { query, invite, changeRole, removeMember };
}
