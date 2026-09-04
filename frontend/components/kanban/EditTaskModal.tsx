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

const CATEGORIES = ["UI Design", "Copywriting", "Illustration", "Development", "QA"];

export function EditTaskModal({ open, onClose, task, onSave }: EditTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("UI Design");
  const [dueDate, setDueDate] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setCategory(task.category || "UI Design");
      setDueDate(task.dueDate || "");
      setAssigneeId(task.assigneeId || "");
      setError(null);
    }
  }, [task, open]);

  if (!task) return null;

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
            <label className="text-xs font-bold tracking-wide text-slate-700">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-11 rounded-2xl border border-slate-200/80 bg-slate-50/60 px-3.5 text-xs font-medium text-slate-800 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100/60 cursor-pointer shadow-2xs"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
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

        <div className="mt-2 flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
