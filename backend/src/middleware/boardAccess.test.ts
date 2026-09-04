import test from "node:test";
import assert from "node:assert";
import { requireBoardAccess } from "./boardAccess";

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
});
