"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type AddTaskFormProps = {
  onSubmit: (title: string, description?: string) => void;
  onCancel: () => void;
};

export function AddTaskForm({ onSubmit, onCancel }: AddTaskFormProps) {
  const [title, setTitle] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit(title.trim());
    setTitle("");
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2">
      <Input
        name="taskTitle"
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        autoFocus
        className="h-9"
      />
      <div className="flex gap-2">
        <Button type="submit" size="sm" className="flex-1">
          Add
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
