"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { Task } from "@/hooks/useBoard";

type EditTaskModalProps = {
  open: boolean;
  onClose: () => void;
  task: Task | null;
  onSave: (taskId: string, data: {
    title: string;
    description?: string | null;
    category?: string;
    dueDate?: string | null;
    assigneeId?: string | null;
  }) => Promise<void>;
};

const DEFAULT_CATEGORIES = ["UI Design", "Copywriting", "Illustration", "Development", "QA"];

export function EditTaskModal({ open, onClose, task, onSave }: EditTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [category, setCategory] = useState("UI Design");
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      const taskCategory = task.category || "UI Design";
      setCategories((prev) =>
        prev.some((c) => c.toLowerCase() === taskCategory.toLowerCase())
          ? prev
          : [...prev, taskCategory]
      );
      setCategory(taskCategory);
      setAddingCategory(false);
      setNewCategory("");
      setDueDate(task.dueDate || "");
      setAssigneeId(task.assigneeId || "");
      setError(null);
    }
  }, [task, open]);

  if (!task) return null;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setSaving(true);
      setError(null);
      await onSave(task.id, {
        title: title.trim(),
        description: description.trim() || null,
        category,
        dueDate: dueDate.trim() || null,
        assigneeId: assigneeId.trim() || null,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to save task");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit Task">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          name="title"
          label="Task Title"
          placeholder="e.g. Design hero section"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          autoFocus
        />

        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-xs font-bold tracking-wide text-slate-700">
            Description
          </label>
          <textarea
            name="description"
            rows={3}
            placeholder="Add task details or checklist..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full resize-none rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 text-xs font-medium text-slate-800 placeholder:text-slate-400 shadow-xs transition-all duration-150 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100/60"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold tracking-wide text-slate-700">
                Category
              </label>
              <button
                type="button"
                onClick={() => {
                  setAddingCategory((v) => !v);
                  setNewCategory("");
                }}
                title={addingCategory ? "Cancel adding category" : "Add new category"}
                aria-label={addingCategory ? "Cancel adding category" : "Add new category"}
                className={`flex h-5 w-5 items-center justify-center rounded-full border border-dashed transition-colors cursor-pointer ${
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
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-11 rounded-2xl border border-slate-200/80 bg-slate-50/60 px-3.5 text-xs font-medium text-slate-800 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100/60 cursor-pointer shadow-2xs"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {addingCategory ? (
              <div className="flex items-center gap-1.5">
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
                  className="h-9 min-w-0 flex-1 rounded-xl border border-indigo-200 bg-white px-2.5 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
                <button
                  type="button"
                  onClick={confirmNewCategory}
                  disabled={!newCategory.trim()}
                  title="Confirm new category"
                  className="h-9 shrink-0 rounded-xl bg-indigo-500 px-3 text-xs font-bold text-white hover:bg-indigo-600 disabled:opacity-40 cursor-pointer"
                >
                  Add
                </button>
              </div>
            ) : null}
          </div>

          <Input
            name="dueDate"
            label="Due Date"
            placeholder="e.g. Nov 24"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <Input
          name="assigneeId"
          label="Assignee"
          placeholder="e.g. Samantha or user name"
          value={assigneeId}
          onChange={(e) => setAssigneeId(e.target.value)}
        />

        {error ? (
          <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-medium text-rose-600">
            {error}
          </p>
        ) : null}

        <div className="mt-2 flex flex-col-reverse gap-2.5 pt-2 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
          <Button type="button" variant="secondary" onClick={onClose} disabled={saving} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button type="submit" loading={saving} className="w-full sm:w-auto">
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
