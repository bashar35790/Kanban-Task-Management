"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useCreateBoard } from "@/hooks/useBoards";

type CreateBoardModalProps = {
  open: boolean;
  onClose: () => void;
};

export function CreateBoardModal({ open, onClose }: CreateBoardModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const createBoard = useCreateBoard();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await createBoard.mutateAsync({
      title: title.trim(),
      description: description.trim() || undefined,
    });
    setTitle("");
    setDescription("");
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Create New Board">
      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <Input
          name="title"
          label="Board title"
          placeholder="e.g. Mobile App Redesign"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          autoFocus
        />

        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-xs font-bold tracking-wide text-slate-700">
            Description (optional)
          </label>
          <textarea
            name="description"
            rows={3}
            placeholder="What is this board for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full resize-none rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 text-xs font-medium text-slate-800 placeholder:text-slate-400 shadow-xs transition-all duration-150 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100/60"
          />
        </div>

        {createBoard.isError ? (
          <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-medium text-rose-600">
            {(createBoard.error as Error)?.message ?? "Failed to create board"}
          </p>
        ) : null}

        <div className="mt-2 flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={createBoard.isPending}>
            Create Board
          </Button>
        </div>
      </form>
    </Modal>
  );
}

