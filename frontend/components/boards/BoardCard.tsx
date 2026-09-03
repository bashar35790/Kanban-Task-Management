"use client";

import Link from "next/link";
import type { Board } from "@/hooks/useBoards";
import { useToggleFavoriteBoard } from "@/hooks/useBoards";

type BoardCardProps = {
  board: Board;
};

export function BoardCard({ board }: BoardCardProps) {
  const toggleFavorite = useToggleFavoriteBoard();

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite.mutate(board.id);
  };

  // Format relative time
  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffHours = Math.round((now.getTime() - d.getTime()) / (1000 * 60 * 60));
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.round(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <Link
      href={`/boards/${board.id}`}
      className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-md cursor-pointer"
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors text-base line-clamp-1">
            {board.title}
          </h3>
          <button
            onClick={handleFavoriteClick}
            aria-label={board.isFavorite ? "Remove favorite" : "Add to favorites"}
            className="text-slate-300 hover:text-amber-400 transition-colors p-0.5 cursor-pointer"
          >
            <svg
              className={`h-5 w-5 ${board.isFavorite ? "fill-amber-400 text-amber-400" : "fill-none stroke-current"}`}
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
        </div>

        <p className="mt-1 line-clamp-2 text-xs text-slate-500 min-h-[2rem]">
          {board.description || "No description"}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
        <div className="flex items-center gap-3">
          {/* Members count */}
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {board.memberCount ?? 1}
          </span>

          {/* Tasks count */}
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            {board.taskCount ?? 0}
          </span>
        </div>

        <span>{formatTime(board.updatedAt || board.createdAt)}</span>
      </div>
    </Link>
  );
}
