"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useDeleteBoard } from "@/hooks/useBoards";

type DeleteBoardModalProps = {
  open: boolean;
  onClose: () => void;
  board: {
    id: string;
    title: string;
  };
  onDeleted?: () => void;
};

export function DeleteBoardModal({
  open,
  onClose,
  board,
  onDeleted,
}: DeleteBoardModalProps) {
  const deleteBoard = useDeleteBoard();

  const handleDelete = async () => {
    try {
      await deleteBoard.mutateAsync(board.id);
      onClose();
      if (onDeleted) {
        onDeleted();
      }
    } catch (err) {
      console.error("Failed to delete board:", err);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Delete Board">
      <div className="flex flex-col gap-5">
        <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>
            <div>
              <h4 className="text-xs font-bold text-rose-900">
                Are you sure you want to delete &ldquo;{board.title}&rdquo;?
              </h4>
              <p className="mt-1 text-xs text-rose-700">
                This action is permanent and cannot be undone. All columns, tasks,
                and activities associated with this board will be removed.
              </p>
            </div>
          </div>
        </div>

        {deleteBoard.isError ? (
          <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-medium text-rose-600">
            {(deleteBoard.error as Error)?.message ?? "Failed to delete board"}
          </p>
        ) : null}

        <div className="mt-2 flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={deleteBoard.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleDelete}
            loading={deleteBoard.isPending}
          >
            Delete Board
          </Button>
        </div>
      </div>
    </Modal>
  );
}
