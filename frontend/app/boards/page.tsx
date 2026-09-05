"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useBoards } from "@/hooks/useBoards";
import { BoardList } from "@/components/boards/BoardList";
import { CreateBoardModal } from "@/components/boards/CreateBoardModal";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Avatar } from "@/components/ui/Avatar";

export default function BoardsPage() {
  const router = useRouter();
  const { user, isPending: authPending, signOut } = useAuth();
  const { data: boards, isPending, isError, error } = useBoards();

  const [activeTab, setActiveTab] = useState<
    "all" | "my-boards" | "shared" | "favorites"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
    router.refresh();
  };

  const filteredBoards = useMemo(() => {
    if (!boards) return [];
    let list = [...boards];

    // Filter by tab
    if (activeTab === "favorites") {
      list = list.filter((b) => b.isFavorite);
    } else if (activeTab === "my-boards") {
      list = list.filter((b) => b.role === "OWNER");
    } else if (activeTab === "shared") {
      list = list.filter((b) => b.role !== "OWNER");
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          (b.description && b.description.toLowerCase().includes(q)),
      );
    }

    return list;
  }, [boards, activeTab, searchQuery]);

  if (authPending) {
    return (
      <div className="flex min-h-screen flex-1 items-center justify-center">
        <Spinner className="h-8 w-8 text-pink-500" />
      </div>
    );
  }

  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <div className="flex min-h-screen min-h-dvh flex-col items-center justify-center p-2 sm:p-6 lg:p-8">
      {/* Container matching Image 1: large soft rounded card with glass/frost styling */}
      <div className="relative flex min-h-[calc(100dvh-1rem)] w-full max-w-[1400px] flex-col overflow-hidden rounded-2xl border border-white/80 bg-white/80 shadow-2xl shadow-purple-950/5 backdrop-blur-xl sm:min-h-[90vh] sm:rounded-[2rem]">
        {/* Top Navigation Bar matching Image 1 */}
        <header className="flex min-h-16 flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-slate-100 px-4 py-2 select-none sm:px-6 lg:px-8">
          {/* Brand pill + Search bar */}
          <div className="flex min-w-0 flex-1 items-center gap-3 sm:flex-none sm:gap-6">
            {/* TASK Logo Pill */}
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

            {/* "Search everything" input pill matching Image 1 */}
            <div className="relative hidden w-48 sm:block lg:w-64">
              <input
                type="text"
                placeholder="Search boards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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

          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            {/* Notification bell with red badge matching Image 1 */}
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
              onClick={handleSignOut}
              className="hidden text-xs font-medium text-slate-400 hover:text-slate-600 cursor-pointer min-[400px]:inline"
            >
              Sign out
            </button>

            <Avatar name={user?.name || user?.email || "User"} size="sm" />
          </div>

          {/* Mobile search row — full width below header */}
          <div className="relative w-full pb-1 sm:hidden">
            <input
              type="text"
              placeholder="Search boards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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

        {/* Dashboard Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 xl:p-10">
          {/* Welcome Header */}
          <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-xl font-black tracking-tight break-words text-slate-900 sm:text-2xl">
                Good everything, {firstName}
              </h1>
              <p className="mt-1 text-xs text-slate-400">
                Manage your projects and keep your team moving.
              </p>
            </div>

            <Button
              onClick={() => setCreateOpen(true)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm px-4 py-2 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer sm:w-auto"
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
                  strokeWidth="2.5"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create Board
            </Button>
          </div>

          {/* Quick Filter Tabs */}
          <div className="no-scrollbar -mx-4 mb-6 flex items-center gap-2 overflow-x-auto border-b border-slate-100 px-4 pb-4 select-none sm:mx-0 sm:px-0">
            <button
              onClick={() => setActiveTab("all")}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "all"
                  ? "bg-pink-500 text-white shadow-xs shadow-pink-200"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80"
              }`}
            >
              All Boards
            </button>
            <button
              onClick={() => setActiveTab("my-boards")}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "my-boards"
                  ? "bg-pink-500 text-white shadow-xs shadow-pink-200"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80"
              }`}
            >
              My Boards
            </button>
            <button
              onClick={() => setActiveTab("shared")}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "shared"
                  ? "bg-pink-500 text-white shadow-xs shadow-pink-200"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80"
              }`}
            >
              Shared With Me
            </button>
            <button
              onClick={() => setActiveTab("favorites")}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "favorites"
                  ? "bg-pink-500 text-white shadow-xs shadow-pink-200"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80"
              }`}
            >
              <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              Favorites
            </button>
          </div>

          {/* Boards Grid */}
          {isPending ? (
            <div className="flex justify-center py-20">
              <Spinner className="h-8 w-8 text-pink-500" />
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <p className="text-rose-500 font-medium text-xs">
                {(error as Error)?.message ?? "Failed to load boards"}
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => router.refresh()}
              >
                Retry
              </Button>
            </div>
          ) : (
            <BoardList boards={filteredBoards} />
          )}
        </main>
      </div>

      <CreateBoardModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </div>
  );
}
