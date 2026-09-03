"use client";

import { BoardCard } from "./BoardCard";
import type { Board } from "@/hooks/useBoards";

type BoardListProps = {
  boards: Board[];
};

export function BoardList({ boards }: BoardListProps) {
  if (boards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/50 p-12 text-center">
        <p className="text-sm font-medium text-slate-500">No boards found in this view</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {boards.map((board) => (
        <BoardCard key={board.id} board={board} />
      ))}
    </div>
  );
}
