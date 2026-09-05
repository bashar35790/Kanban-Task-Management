"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useBoard } from "@/hooks/useBoard";
import {
  useMoveTask,
  useAddColumn,
  useUpdateColumn,
  useDeleteColumn,
  useAddTask,
  useUpdateTask,
  useDeleteTask,
} from "@/hooks/useKanban";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { SidebarWidgets } from "@/components/kanban/SidebarWidgets";
import { ShareBoardModal } from "@/components/boards/ShareBoardModal";
import { EditBoardModal } from "@/components/boards/EditBoardModal";
import { DeleteBoardModal } from "@/components/boards/DeleteBoardModal";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Avatar } from "@/components/ui/Avatar";

export default function BoardPage() {
  const params = useParams<{ boardId: string }>();
  const boardId = params.boardId;
  const router = useRouter();
  const { user, isPending: authPending, signOut } = useAuth();
  const { data, isPending, isError, error } = useBoard(boardId);

  const [shareOpen, setShareOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [searchTaskQuery, setSearchTaskQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"position" | "title" | "date">(
    "position",
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const moveTask = useMoveTask(boardId);
  const addColumn = useAddColumn(boardId);
  const updateColumn = useUpdateColumn(boardId);
  const deleteColumn = useDeleteColumn(boardId);
  const addTask = useAddTask(boardId);
  const updateTask = useUpdateTask(boardId);
  const deleteTask = useDeleteTask(boardId);

  const board = data?.board;
  const yourRole = data?.yourRole;
  const canEdit = yourRole === "EDITOR" || yourRole === "OWNER";
  const isOwner = yourRole === "OWNER";

  const filteredColumns = useMemo(() => {
    if (!board?.columns) return [];
    return board.columns.map((column) => {
      let tasks = [...column.tasks];

      if (filterCategory !== "ALL") {
        tasks = tasks.filter((t) =>
          (t.category || "")
            .toLowerCase()
            .includes(filterCategory.toLowerCase()),
        );
      }

      if (searchTaskQuery.trim()) {
        const q = searchTaskQuery.toLowerCase();
        tasks = tasks.filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            (t.description && t.description.toLowerCase().includes(q)) ||
            (t.category && t.category.toLowerCase().includes(q)),
        );
      }

      if (sortBy === "title") {
        tasks.sort((a, b) => a.title.localeCompare(b.title));
      } else if (sortBy === "date") {
        tasks.sort((a, b) => (a.dueDate || "").localeCompare(b.dueDate || ""));
      } else {
        tasks.sort((a, b) => a.position - b.position);
      }

      return {
        ...column,
        tasks,
      };
    });
  }, [board, filterCategory, searchTaskQuery, sortBy]);

  const allTasks = useMemo(() => {
    return board?.columns?.flatMap((c) => c.tasks) || [];
  }, [board]);

  // Drag anchors are computed from the visible task order. Disable dragging
  // while a filter/search/sort is active so positions can't be corrupted.
  const isViewModified =
    filterCategory !== "ALL" ||
    searchTaskQuery.trim() !== "" ||
    sortBy !== "position";

  if (authPending) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-screen">
        <Spinner className="h-8 w-8 text-pink-500" />
      </div>
    );
  }

  const handleDeleteColumn = async (columnId: string) => {
    if (window.confirm("Delete this column and all its tasks?")) {
      await deleteColumn.mutateAsync(columnId);
    }
  };

  return (
    <div className="flex min-h-screen min-h-dvh flex-col items-center justify-center p-2 sm:p-6 lg:p-8">
      <div className="relative flex min-h-[calc(100dvh-1rem)] w-full max-w-[1400px] flex-col overflow-hidden rounded-2xl border border-white/80 bg-white/80 shadow-2xl shadow-purple-950/5 backdrop-blur-xl sm:min-h-[90vh] sm:rounded-[2rem]">
        <header className="flex min-h-16 flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-slate-100 px-4 py-2 select-none sm:px-6 lg:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-3 sm:flex-none sm:gap-6">
            <Link
              href="/boards"
              className="flex shrink-0 items-center gap-2 group cursor-pointer"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-pink-500 font-black text-xs text-white shadow-sm shadow-pink-200">
                T
              </span>
              <span className="text-xs font-black tracking-wider text-pink-500 group-hover:text-pink-600 transition-colors">
                TASK
              </span>
            </Link>

            <div className="relative hidden w-48 sm:block lg:w-64">
              <input
                type="text"
                placeholder="Search everything"
                value={searchTaskQuery}
                onChange={(e) => setSearchTaskQuery(e.target.value)}
                className="h-8 w-full rounded-full border-none bg-slate-100/70 pl-8 pr-3 text-xs text-slate-700 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-pink-200 focus:outline-none transition-all"
              />
              <svg
                className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Center Links: Projects, Settings, Help */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold">
            <Link
              href="/boards"
              className="text-pink-500 hover:text-pink-600 transition-colors"
            >
              Projects
            </Link>
            <span className="text-slate-400 hover:text-slate-600 cursor-pointer transition-colors">
              Settings
            </span>
            <span className="text-slate-400 hover:text-slate-600 cursor-pointer transition-colors">
              Help
            </span>
          </nav>

          {/* Right: Notifications, Sign out, User avatar */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            {/* Insights toggle for < xl screens */}
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Open insights and activity"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100/80 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700 cursor-pointer xl:hidden"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </button>
            <button aria-label="Notifications" className="relative text-slate-400 hover:text-slate-600 p-1.5 cursor-pointer">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <span className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>

            <button
              onClick={async () => {
                await signOut();
                router.push("/login");
              }}
              className="hidden text-xs font-medium text-slate-400 hover:text-slate-600 cursor-pointer min-[400px]:inline"
            >
              Sign out
            </button>

            <Avatar name={user?.name || user?.email || "User"} size="sm" />
          </div>

          {/* Mobile search row */}
          <div className="relative w-full pb-1 sm:hidden">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTaskQuery}
              onChange={(e) => setSearchTaskQuery(e.target.value)}
              className="h-9 w-full rounded-full border-none bg-slate-100/70 pl-9 pr-3 text-xs text-slate-700 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-pink-200 focus:outline-none transition-all"
            />
            <svg
              className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </header>

        {/* 2. Main Work Area: Board Columns (Left/Center) + Sidebar Widgets (Right) */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden xl:flex-row">
          <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-4 sm:p-6 lg:p-8">
            <div className="mb-5 flex flex-col gap-4 sm:mb-8 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-2">
                  <h1 className="min-w-0 flex-1 truncate text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                    {board?.title || "Homepage Design"}
                  </h1>
                  {canEdit && board ? (
                    <button
                      onClick={() => setEditOpen(true)}
                      title="Rename / Edit Board"
                      aria-label="Rename board"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-indigo-600 transition-colors cursor-pointer"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </button>
                  ) : null}
                  {isOwner && board ? (
                    <button
                      onClick={() => setDeleteOpen(true)}
                      title="Delete Board"
                      aria-label="Delete board"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  ) : null}
                </div>
                {board?.description ? (
                  <p className="mt-0.5 line-clamp-2 text-xs break-words text-slate-400">
                    {board.description}
                  </p>
                ) : null}
              </div>

              {/* Members Avatar Stack + Add (+) matching Image 1 & 3 */}
              <div className="flex flex-col gap-3 min-[480px]:flex-row min-[480px]:flex-wrap min-[480px]:items-center lg:justify-end">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex min-w-0 items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 shadow-xs">
                    <span className="shrink-0">Filter:</span>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="min-w-0 max-w-[7rem] truncate bg-transparent focus:outline-none cursor-pointer sm:max-w-none"
                    >
                      <option value="ALL">All Categories</option>
                      <option value="UI Design">UI Design</option>
                      <option value="Copywriting">Copywriting</option>
                      <option value="Illustration">Illustration</option>
                    </select>
                  </div>

                  <div className="flex min-w-0 items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 shadow-xs">
                    <span className="shrink-0">Sort:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="min-w-0 max-w-[6rem] truncate bg-transparent focus:outline-none cursor-pointer sm:max-w-none"
                    >
                      <option value="position">Position</option>
                      <option value="title">Title</option>
                      <option value="date">Due Date</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center -space-x-1.5 overflow-hidden p-1">
                  {board?.members && board.members.length > 0 ? (
                    board.members
                      .slice(0, 4)
                      .map((m) => (
                        <Avatar
                          key={m.id}
                          name={m.user?.name || "Member"}
                          size="sm"
                          className="ring-2 ring-white shadow-xs"
                        />
                      ))
                  ) : (
                    <Avatar
                      name="Andrea"
                      size="sm"
                      className="ring-2 ring-white"
                    />
                  )}

                  {isOwner ? (
                    <button
                      onClick={() => setShareOpen(true)}
                      title="Invite members"
                      aria-label="Invite members"
                      className="flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-slate-300 bg-white text-xs font-bold text-slate-500 hover:border-pink-400 hover:text-pink-500 transition-colors shadow-xs cursor-pointer ml-1.5"
                    >
                      +
                    </button>
                  ) : null}
                </div>
              </div>
            </div>

            {isPending ? (
              <div className="flex flex-1 items-center justify-center">
                <Spinner className="h-8 w-8 text-pink-500" />
              </div>
            ) : isError ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4 text-center">
                <p className="text-sm font-medium text-rose-500">
                  {(error as Error)?.message ?? "Failed to load board"}
                </p>
                <Button
                  variant="secondary"
                  onClick={() => router.push("/boards")}
                >
                  Back to boards
                </Button>
              </div>
            ) : board ? (
              <div className="-mx-4 min-h-0 flex-1 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 sm:pb-0">
                <KanbanBoard
                  columns={filteredColumns}
                  canEdit={canEdit}
                  dragDisabled={!canEdit || isViewModified}
                  onMoveTask={moveTask.mutate}
                  onAddColumn={addColumn.mutate}
                  onDeleteColumn={handleDeleteColumn}
                  onUpdateColumn={(columnId, title) =>
                    updateColumn.mutate({ columnId, title })
                  }
                  onAddTask={(columnId, title, category, assignee) =>
                    addTask.mutate({
                      columnId,
                      title,
                      category,
                      assigneeId: assignee,
                    })
                  }
                  onDeleteTask={(task) => deleteTask.mutate(task.id)}
                  onUpdateTask={async (taskId, data) => {
                    await updateTask.mutateAsync({ taskId, ...data });
                  }}
                />
              </div>
            ) : null}
          </main>

          <SidebarWidgets
            tasks={allTasks}
            activities={board?.activities || []}
          />

          {/* Mobile / tablet insights drawer */}
          {sidebarOpen ? (
            <div className="fixed inset-0 z-40 xl:hidden">
              <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                onClick={() => setSidebarOpen(false)}
                aria-hidden="true"
              />
              <div className="absolute inset-y-0 right-0 w-full max-w-sm translate-x-0 transition-transform">
                <SidebarWidgets
                  tasks={allTasks}
                  activities={board?.activities || []}
                  isDrawer
                  onClose={() => setSidebarOpen(false)}
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <ShareBoardModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        boardId={boardId}
        currentUserId={user?.id ?? ""}
      />

      {board ? (
        <>
          <EditBoardModal
            open={editOpen}
            onClose={() => setEditOpen(false)}
            board={{
              id: board.id,
              title: board.title,
              description: board.description,
            }}
          />

          <DeleteBoardModal
            open={deleteOpen}
            onClose={() => setDeleteOpen(false)}
            board={{ id: board.id, title: board.title }}
            onDeleted={() => router.push("/boards")}
          />
        </>
      ) : null}
    </div>
  );
}
