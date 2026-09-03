"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

type AddColumnFormProps = {
  onSubmit: (title: string) => void;
};

export function AddColumnForm({ onSubmit }: AddColumnFormProps) {
  const [title, setTitle] = useState("");
  const [active, setActive] = useState(false);

  if (!active) {
    return (
      <button
        onClick={() => setActive(true)}
        className="flex h-12 w-72 shrink-0 items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300/80 bg-white/40 text-xs font-bold text-slate-500 transition-all hover:border-indigo-400 hover:text-indigo-600 hover:bg-white cursor-pointer"
      >
        <span className="text-base leading-none">+</span> Add column
      </button>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit(title.trim());
    setTitle("");
    setActive(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-72 shrink-0 flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm"
    >
      <input
        type="text"
        placeholder="Column title (e.g. In Review)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        autoFocus
        className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-indigo-400 focus:outline-none"
      />
      <div className="flex gap-2">
        <Button type="submit" size="sm" className="flex-1 text-xs">
          Add
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setActive(false)} className="text-xs">
          Cancel
        </Button>
      </div>
    </form>
  );
}
