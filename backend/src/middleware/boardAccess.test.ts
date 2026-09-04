import test from "node:test";
import assert from "node:assert";
import { requireBoardAccess } from "./boardAccess.js";
import { prisma } from "../lib/prisma.js";

test("requireBoardAccess middleware", async (t) => {
  await t.test("returns 401 when req.user is undefined", async () => {
    const middleware = requireBoardAccess("VIEWER");
    const req: any = { params: { boardId: "test-id" } };
    let statusSent = 0;
    let jsonSent: any = null;
    const res: any = {
      status(code: number) {
        statusSent = code;
        return this;
      },
      json(data: any) {
        jsonSent = data;
        return this;
      },
    };
    let nextCalled = false;
    const next = () => {
      nextCalled = true;
    };

    await middleware(req, res, next);
    assert.strictEqual(statusSent, 401);
    assert.strictEqual(jsonSent.error, "Unauthorized");
    assert.strictEqual(nextCalled, false);
  });

  await t.test("returns 400 when boardId is missing", async () => {
    const middleware = requireBoardAccess("VIEWER");
    const req: any = { user: { id: "user-1" }, params: {}, body: {} };
    let statusSent = 0;
    let jsonSent: any = null;
    const res: any = {
      status(code: number) {
        statusSent = code;
        return this;
      },
      json(data: any) {
        jsonSent = data;
        return this;
      },
    };
    let nextCalled = false;
    const next = () => {
      nextCalled = true;
    };

    await middleware(req, res, next);
    assert.strictEqual(statusSent, 400);
    assert.strictEqual(jsonSent.error, "boardId is required");
    assert.strictEqual(nextCalled, false);
  });

  await t.test("blocks cross-board access: returns 403 when user is not member or owner", async () => {
    const originalFindBoard = prisma.board.findUnique;
    const originalFindMember = prisma.boardMember.findUnique;

    (prisma.board as any).findUnique = async () => ({ ownerId: "other-user" });
    (prisma.boardMember as any).findUnique = async () => null;

    try {
      const middleware = requireBoardAccess("VIEWER");
      const req: any = { user: { id: "user-attacker" }, params: { boardId: "board-victim" } };
      let statusSent = 0;
      let jsonSent: any = null;
      const res: any = {
        status(code: number) {
          statusSent = code;
          return this;
        },
        json(data: any) {
          jsonSent = data;
          return this;
        },
      };
      let nextCalled = false;
      await middleware(req, res, () => { nextCalled = true; });

      assert.strictEqual(statusSent, 403);
      assert.strictEqual(nextCalled, false);
      assert.match(jsonSent.error, /Forbidden/);
    } finally {
      (prisma.board as any).findUnique = originalFindBoard;
      (prisma.boardMember as any).findUnique = originalFindMember;
    }
  });

  await t.test("enforces minimum role: returns 403 when user is VIEWER but EDITOR is required", async () => {
    const originalFindBoard = prisma.board.findUnique;
    const originalFindMember = prisma.boardMember.findUnique;

    (prisma.board as any).findUnique = async () => ({ ownerId: "owner-user" });
    (prisma.boardMember as any).findUnique = async () => ({ role: "VIEWER", userId: "viewer-user", boardId: "b1" });

    try {
      const middleware = requireBoardAccess("EDITOR");
      const req: any = { user: { id: "viewer-user" }, params: { boardId: "b1" } };
      let statusSent = 0;
      let jsonSent: any = null;
      const res: any = {
        status(code: number) {
          statusSent = code;
          return this;
        },
        json(data: any) {
          jsonSent = data;
          return this;
        },
      };
      let nextCalled = false;
      await middleware(req, res, () => { nextCalled = true; });

      assert.strictEqual(statusSent, 403);
      assert.strictEqual(nextCalled, false);
      assert.match(jsonSent.error, /Insufficient permissions/);
    } finally {
      (prisma.board as any).findUnique = originalFindBoard;
      (prisma.boardMember as any).findUnique = originalFindMember;
    }
  });

  await t.test("automatically grants access when user is the board schema owner", async () => {
    const originalFindBoard = prisma.board.findUnique;

    (prisma.board as any).findUnique = async () => ({ ownerId: "owner-user" });

    try {
      const middleware = requireBoardAccess("OWNER");
      const req: any = { user: { id: "owner-user" }, params: { boardId: "b1" } };
      let statusSent = 0;
      const res: any = {
        status(code: number) {
          statusSent = code;
          return this;
        },
        json() {
          return this;
        },
      };
      let nextCalled = false;
      await middleware(req, res, () => { nextCalled = true; });

      assert.strictEqual(nextCalled, true);
      assert.strictEqual(statusSent, 0);
      assert.strictEqual(req.boardMember?.role, "OWNER");
    } finally {
      (prisma.board as any).findUnique = originalFindBoard;
    }
  });
});
