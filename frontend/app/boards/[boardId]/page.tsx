"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useBoard } from "@/hooks/useBoard";
import {
  useMoveTask,
  useAddColumn,
  useDeleteColumn,
  useAddTask,
  useDeleteTask,
} from "@/hooks/useKanban";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { SidebarWidgets } from "@/components/kanban/SidebarWidgets";
import { ShareBoardModal } from "@/components/boards/ShareBoardModal";
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
  const [searchTaskQuery, setSearchTaskQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"position" | "title" | "date">(
    "position",
  );

  const moveTask = useMoveTask(boardId);
  const addColumn = useAddColumn(boardId);
  const deleteColumn = useDeleteColumn(boardId);
  const addTask = useAddTask(boardId);
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
    <div className="flex min-h-screen flex-col items-center justify-center p-3 sm:p-6 lg:p-8">
      <div className="relative flex min-h-[90vh] w-full max-w-[1400px] flex-col rounded-[2rem] border border-white/80 bg-white/80 shadow-2xl shadow-purple-950/5 backdrop-blur-xl overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-slate-100 px-8 select-none">
          <div className="flex items-center gap-6">
            <Link
              href="/boards"
              className="flex items-center gap-2 group cursor-pointer"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-pink-500 font-black text-xs text-white shadow-sm shadow-pink-200">
                T
              </span>
              <span className="text-xs font-black tracking-wider text-pink-500 group-hover:text-pink-600 transition-colors">
                TASK
              </span>
            </Link>

            <div className="relative w-64">
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
          <div className="flex items-center gap-4">
            <button className="relative text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
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
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>

            <button
              onClick={async () => {
                await signOut();
                router.push("/login");
              }}
              className="text-xs font-medium text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Sign out
            </button>

            <Avatar name={user?.name || user?.email || "User"} size="sm" />
          </div>
        </header>

        {/* 2. Main Work Area: Board Columns (Left/Center) + Sidebar Widgets (Right) */}
        <div className="flex flex-1 overflow-hidden">
          <main className="flex flex-1 flex-col overflow-hidden p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900">
                  {board?.title || "Homepage Design"}
                </h1>
                {board?.description ? (
                  <p className="text-xs text-slate-400 mt-0.5">
                    {board.description}
                  </p>
                ) : null}
              </div>

              {/* Members Avatar Stack + Add (+) matching Image 1 & 3 */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 shadow-xs">
                    <span>Filter:</span>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="bg-transparent focus:outline-none cursor-pointer"
                    >
                      <option value="ALL">All Categories</option>
                      <option value="UI Design">UI Design</option>
                      <option value="Copywriting">Copywriting</option>
                      <option value="Illustration">Illustration</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 shadow-xs">
                    <span>Sort:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="bg-transparent focus:outline-none cursor-pointer"
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
              <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
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
              <div className="flex-1 overflow-x-auto min-h-0">
                <KanbanBoard
                  columns={filteredColumns}
                  canEdit={canEdit}
                  onMoveTask={moveTask.mutate}
                  onAddColumn={addColumn.mutate}
                  onDeleteColumn={handleDeleteColumn}
                  onAddTask={(columnId, title, category, assignee) =>
                    addTask.mutate({
                      columnId,
                      title,
                      category,
                      assigneeId: assignee,
                    })
                  }
                  onDeleteTask={(task) => deleteTask.mutate(task.id)}
                />
              </div>
            ) : null}
          </main>

          <SidebarWidgets
            tasks={allTasks}
            activities={board?.activities || []}
          />
        </div>
      </div>

      <ShareBoardModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        boardId={boardId}
        currentUserId={user?.id ?? ""}
      />
    </div>
  );
}
