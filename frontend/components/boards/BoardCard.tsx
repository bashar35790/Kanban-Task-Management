"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import type { Board } from "@/hooks/useBoards";
import { useToggleFavoriteBoard } from "@/hooks/useBoards";
import { useAuth } from "@/hooks/useAuth";
import { EditBoardModal } from "./EditBoardModal";
import { DeleteBoardModal } from "./DeleteBoardModal";
import { ShareBoardModal } from "./ShareBoardModal";

type BoardCardProps = {
  board: Board;
};

export function BoardCard({ board }: BoardCardProps) {
  const { user } = useAuth();
  const toggleFavorite = useToggleFavoriteBoard();
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite.mutate(board.id);
  };

  const isOwner = board.role === "OWNER";
  const canEdit = board.role === "OWNER" || board.role === "EDITOR";

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
    <>
      <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-md">
        <div>
          <div className="flex items-start justify-between gap-2">
            <Link
              href={`/boards/${board.id}`}
              className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors text-base line-clamp-1 flex-1 cursor-pointer"
            >
              {board.title}
            </Link>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={handleFavoriteClick}
                aria-label={board.isFavorite ? "Remove favorite" : "Add to favorites"}
                className="text-slate-300 hover:text-amber-400 transition-colors p-1 cursor-pointer"
              >
                <svg
                  className={`h-4 w-4 ${board.isFavorite ? "fill-amber-400 text-amber-400" : "fill-none stroke-current"}`}
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </button>

              {(canEdit || isOwner) && (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setMenuOpen(!menuOpen);
                    }}
                    aria-label="Board options"
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="5" r="2" />
                      <circle cx="12" cy="12" r="2" />
                      <circle cx="12" cy="19" r="2" />
                    </svg>
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 top-8 z-30 w-36 rounded-xl border border-slate-100 bg-white p-1 shadow-lg shadow-slate-900/10 backdrop-blur-md animate-in fade-in zoom-in-95 duration-100">
                      {canEdit && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setMenuOpen(false);
                            setEditOpen(true);
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer text-left"
                        >
                          <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          Rename / Edit
                        </button>
                      )}
                      {isOwner && (
                        <>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setMenuOpen(false);
                              setShareOpen(true);
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer text-left"
                          >
                            <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            Share Board
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setMenuOpen(false);
                              setDeleteOpen(true);
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer text-left"
                          >
                            <svg className="h-3.5 w-3.5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete Board
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <Link href={`/boards/${board.id}`} className="block">
            <p className="mt-1 line-clamp-2 text-xs text-slate-500 min-h-[2rem]">
              {board.description || "No description"}
            </p>
          </Link>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5 border-t border-slate-100 pt-3 text-xs font-medium text-slate-500">
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
            {/* Role / Owner Badge */}
            <span
              className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                isOwner
                  ? "bg-purple-50 text-purple-700 ring-1 ring-purple-600/20"
                  : "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20"
              }`}
            >
              {isOwner ? "Owner" : board.role}
            </span>

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
      </div>

      <EditBoardModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        board={{ id: board.id, title: board.title, description: board.description }}
      />

      <DeleteBoardModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        board={{ id: board.id, title: board.title }}
      />

      {isOwner && (
        <ShareBoardModal
          open={shareOpen}
          onClose={() => setShareOpen(false)}
          boardId={board.id}
          currentUserId={user?.id ?? ""}
        />
      )}
    </>
  );
}
