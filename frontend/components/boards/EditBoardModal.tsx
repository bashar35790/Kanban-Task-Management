"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useUpdateBoard } from "@/hooks/useBoards";

type EditBoardModalProps = {
  open: boolean;
  onClose: () => void;
  board: {
    id: string;
    title: string;
    description?: string | null;
  };
};

export function EditBoardModal({ open, onClose, board }: EditBoardModalProps) {
  const [title, setTitle] = useState(board.title);
  const [description, setDescription] = useState(board.description || "");
  const updateBoard = useUpdateBoard();

  useEffect(() => {
    if (open) {
      setTitle(board.title);
      setDescription(board.description || "");
    }
  }, [open, board.title, board.description]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await updateBoard.mutateAsync({
      boardId: board.id,
      title: title.trim(),
      description: description.trim() || null,
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit Board Details">
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

        {updateBoard.isError ? (
          <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-medium text-rose-600">
            {(updateBoard.error as Error)?.message ?? "Failed to update board"}
          </p>
        ) : null}

        <div className="mt-2 flex flex-col-reverse gap-2.5 pt-2 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
          <Button type="button" variant="secondary" onClick={onClose} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button type="submit" loading={updateBoard.isPending} className="w-full sm:w-auto">
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
