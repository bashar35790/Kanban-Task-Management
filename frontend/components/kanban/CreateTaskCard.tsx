"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";

type CreateTaskCardProps = {
  columnTitle?: string;
  onCancel: () => void;
  onSubmit: (title: string, category: string, assignee: string) => void;
};

const CATEGORIES = ["UI Design", "Copywriting", "Illustration"];
const ASSIGNEES = ["Samantha", "Andrea", "Karen", "Bashar"];

export function CreateTaskCard({ onCancel, onSubmit }: CreateTaskCardProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("UI Design");
  const [assignee, setAssignee] = useState("Samantha");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit(title.trim(), category, assignee);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col rounded-2xl border border-blue-200/80 bg-white p-4 shadow-md transition-all animate-in fade-in zoom-in-95 duration-150"
    >
      <div className="flex items-center justify-between mb-2.5">
        <h5 className="text-xs font-bold text-slate-800">Create New Card</h5>
        <button
          type="button"
          onClick={onCancel}
          className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <textarea
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What is the task?"
        rows={2}
        autoFocus
        className="w-full resize-none rounded-xl border border-slate-100 bg-slate-50/60 p-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all mb-3 font-medium"
      />

      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5">
          <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-600 border border-blue-100 focus:outline-none cursor-pointer"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <span className="h-4 w-4 rounded-full border border-dashed border-slate-300 flex items-center justify-center text-[9px] text-slate-400">
          ⚙
        </span>
      </div>

      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Avatar name={assignee} size="xs" />
          <select
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            className="text-xs font-semibold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
          >
            {ASSIGNEES.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        <span className="h-4 w-4 rounded-full border border-dashed border-slate-300 flex items-center justify-center text-[9px] text-slate-400">
          +
        </span>
      </div>

      <button
        type="submit"
        disabled={!title.trim()}
        className="w-full rounded-xl bg-[#6366f1] py-2.5 text-xs font-bold text-white shadow-sm shadow-indigo-200 transition-all hover:bg-[#4f46e5] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
      >
        Done
      </button>
    </form>
  );
}
