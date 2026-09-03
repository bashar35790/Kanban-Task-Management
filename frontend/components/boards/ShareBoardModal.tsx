"use client";

import { useState } from "react";
import { useMembers } from "@/hooks/useMembers";
import type { Member } from "@/hooks/useBoard";
import type { BoardRole } from "@/hooks/useBoards";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { Spinner } from "@/components/ui/Spinner";

const roles: BoardRole[] = ["VIEWER", "EDITOR", "OWNER"];

const roleLabels: Record<BoardRole, string> = {
  OWNER: "Owner",
  EDITOR: "Editor",
  VIEWER: "Viewer",
};

type ShareBoardModalProps = {
  open: boolean;
  onClose: () => void;
  boardId: string;
  currentUserId: string;
};

export function ShareBoardModal({
  open,
  onClose,
  boardId,
  currentUserId,
}: ShareBoardModalProps) {
  const { query, invite, changeRole, removeMember } = useMembers(boardId);

  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<BoardRole>("VIEWER");

  const members = query.data ?? [];

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    await invite.mutateAsync({ email: email.trim(), role: selectedRole });
    setEmail("");
    setSelectedRole("VIEWER");
  };

  return (
    <Modal open={open} onClose={onClose} title="Share Board">
      <form onSubmit={handleInvite} className="mb-6 flex flex-col gap-4">
        <Input
          name="email"
          type="email"
          label="Invite teammate by email"
          placeholder="colleague@task.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={invite.isPending}
        />

        <div className="flex items-end gap-3">
          <div className="flex flex-col gap-1.5 flex-1">
            <span className="text-xs font-bold tracking-wide text-slate-700">
              Role
            </span>
            <div className="flex overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50/60 p-1">
              {roles.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setSelectedRole(role)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    selectedRole === role
                      ? "bg-white text-indigo-600 shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {roleLabels[role]}
                </button>
              ))}
            </div>
          </div>
          <Button
            type="submit"
            loading={invite.isPending}
            className="h-11 px-6 text-xs font-bold rounded-2xl"
          >
            Invite
          </Button>
        </div>

        {invite.isError ? (
          <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-medium text-rose-600">
            {(invite.error as Error)?.message ?? "Failed to invite member"}
          </p>
        ) : null}
      </form>

      <div>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
          Board Members ({members.length})
        </h3>
        {query.isPending ? (
          <div className="flex justify-center py-6">
            <Spinner className="h-6 w-6 text-indigo-600" />
          </div>
        ) : (
          <ul className="flex flex-col gap-2.5 max-h-60 overflow-y-auto pr-1">
            {members.map((member) => (
              <MemberRow
                key={member.id}
                member={member}
                isSelf={member.userId === currentUserId}
                onChangeRole={(role) =>
                  changeRole.mutate({ userId: member.userId, role })
                }
                onRemove={() => removeMember.mutate(member.userId)}
                removing={removeMember.isPending}
              />
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
}

type MemberRowProps = {
  member: Member;
  isSelf: boolean;
  onChangeRole: (role: BoardRole) => void;
  onRemove: () => void;
  removing: boolean;
};

function MemberRow({
  member,
  isSelf,
  onChangeRole,
  onRemove,
  removing,
}: MemberRowProps) {
  const name = member.user?.name ?? "Unknown";
  const email = member.user?.email ?? "";

  return (
    <li className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-3">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar name={name} size="sm" />
        <div className="min-w-0">
          <p className="truncate text-xs font-bold text-slate-800">
            {name}
            {isSelf ? <span className="ml-1 text-[10px] text-slate-400 font-normal">(you)</span> : null}
          </p>
          <p className="truncate text-[11px] text-slate-400">{email}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <select
          value={member.role}
          onChange={(e) => onChangeRole(e.target.value as BoardRole)}
          disabled={removing || isSelf}
          className="h-8 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 focus:outline-none disabled:opacity-60 cursor-pointer shadow-2xs"
        >
          {roles.map((role) => (
            <option key={role} value={role}>
              {roleLabels[role]}
            </option>
          ))}
        </select>
        {!isSelf && member.role !== "OWNER" ? (
          <button
            onClick={onRemove}
            disabled={removing}
            aria-label={`Remove ${name}`}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 cursor-pointer disabled:opacity-50"
          >
            ✕
          </button>
        ) : null}
      </div>
    </li>
  );
}

