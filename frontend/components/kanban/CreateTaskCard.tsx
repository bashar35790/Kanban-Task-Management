"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";

type CreateTaskCardProps = {
  columnTitle?: string;
  onCancel: () => void;
  onSubmit: (title: string, category: string, assignee: string) => void;
};

const DEFAULT_CATEGORIES = ["UI Design", "Copywriting", "Illustration"];
const DEFAULT_ASSIGNEES = ["Samantha", "Andrea", "Karen", "Bashar"];

export function CreateTaskCard({ onCancel, onSubmit }: CreateTaskCardProps) {
  const [title, setTitle] = useState("");
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [assignees, setAssignees] = useState<string[]>(DEFAULT_ASSIGNEES);
  const [category, setCategory] = useState("UI Design");
  const [assignee, setAssignee] = useState("Samantha");
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [addingAssignee, setAddingAssignee] = useState(false);
  const [newAssignee, setNewAssignee] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit(title.trim(), category, assignee);
  };

  const confirmNewCategory = () => {
    const value = newCategory.trim();
    if (!value) {
      setAddingCategory(false);
      setNewCategory("");
      return;
    }
    if (!categories.some((c) => c.toLowerCase() === value.toLowerCase())) {
      setCategories((prev) => [...prev, value]);
    }
    setCategory(value);
    setNewCategory("");
    setAddingCategory(false);
  };

  const confirmNewAssignee = () => {
    const value = newAssignee.trim();
    if (!value) {
      setAddingAssignee(false);
      setNewAssignee("");
      return;
    }
    if (!assignees.some((a) => a.toLowerCase() === value.toLowerCase())) {
      setAssignees((prev) => [...prev, value]);
    }
    setAssignee(value);
    setNewAssignee("");
    setAddingAssignee(false);
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
        className="w-full resize-none rounded-xl border border-slate-100 bg-slate-50/60 p-2.5 text-xs text-slate-800 caret-pink-500 placeholder:text-slate-400 focus:bg-white focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all mb-3 font-medium"
      />

      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <svg className="h-3.5 w-3.5 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Task category"
            className="min-w-0 max-w-[11rem] truncate rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-600 border border-blue-100 focus:outline-none cursor-pointer"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => {
            setAddingCategory((v) => !v);
            setNewCategory("");
          }}
          title={addingCategory ? "Cancel adding category" : "Add new category"}
          aria-label={addingCategory ? "Cancel adding category" : "Add new category"}
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-dashed transition-colors cursor-pointer ${
            addingCategory
              ? "border-indigo-400 bg-indigo-50 text-indigo-600"
              : "border-slate-300 text-slate-400 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600"
          }`}
        >
          <svg
            className={`h-3 w-3 transition-transform ${addingCategory ? "rotate-45" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      </div>

      {addingCategory ? (
        <div className="flex items-center gap-1.5 mb-3">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                confirmNewCategory();
              }
              if (e.key === "Escape") {
                setAddingCategory(false);
                setNewCategory("");
              }
            }}
            placeholder="New category name…"
            autoFocus
            maxLength={30}
            aria-label="New category name"
            className="h-7 min-w-0 flex-1 rounded-lg border border-indigo-200 bg-white px-2 text-[11px] font-medium text-slate-800 caret-pink-500 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
          <button
            type="button"
            onClick={confirmNewCategory}
            disabled={!newCategory.trim()}
            title="Confirm new category"
            className="h-7 shrink-0 rounded-lg bg-indigo-500 px-2 text-[11px] font-bold text-white hover:bg-indigo-600 disabled:opacity-40 cursor-pointer"
          >
            Add
          </button>
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2 min-w-0">
          <Avatar name={assignee} size="xs" />
          <select
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            aria-label="Task assignee"
            className="min-w-0 max-w-[11rem] truncate text-xs font-semibold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
          >
            {assignees.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => {
            setAddingAssignee((v) => !v);
            setNewAssignee("");
          }}
          title={addingAssignee ? "Cancel adding assignee" : "Add new assignee"}
          aria-label={addingAssignee ? "Cancel adding assignee" : "Add new assignee"}
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-dashed transition-colors cursor-pointer ${
            addingAssignee
              ? "border-indigo-400 bg-indigo-50 text-indigo-600"
              : "border-slate-300 text-slate-400 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600"
          }`}
        >
          <svg
            className={`h-3 w-3 transition-transform ${addingAssignee ? "rotate-45" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      </div>

      {addingAssignee ? (
        <div className="flex items-center gap-1.5 mb-4">
          <input
            type="text"
            value={newAssignee}
            onChange={(e) => setNewAssignee(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                confirmNewAssignee();
              }
              if (e.key === "Escape") {
                setAddingAssignee(false);
                setNewAssignee("");
              }
            }}
            placeholder="New assignee name…"
            autoFocus
            maxLength={30}
            aria-label="New assignee name"
            className="h-7 min-w-0 flex-1 rounded-lg border border-indigo-200 bg-white px-2 text-[11px] font-medium text-slate-800 caret-pink-500 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
          <button
            type="button"
            onClick={confirmNewAssignee}
            disabled={!newAssignee.trim()}
            title="Confirm new assignee"
            className="h-7 shrink-0 rounded-lg bg-indigo-500 px-2 text-[11px] font-bold text-white hover:bg-indigo-600 disabled:opacity-40 cursor-pointer"
          >
            Add
          </button>
        </div>
      ) : null}

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
