import { Router } from "express";
import { body, param, validationResult } from "express-validator";
import { authenticate } from "../middleware/authenticate";
import { requireBoardAccess } from "../middleware/boardAccess";
import { prisma } from "../lib/prisma";

const router = Router();

function sendValidationErrors(req: any, res: any): boolean {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return true;
  }
  return false;
}
const p = (v: string | string[]): string => v as string;

async function getBoardIdForColumn(columnId: string): Promise<string | null> {
  const column = await prisma.column.findUnique({
    where: { id: columnId },
    select: { boardId: true },
  });
  return column?.boardId ?? null;
}

async function requireColumnEditor(
  boardId: string,
  userId: string,
  res: any,
): Promise<boolean> {
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    select: { ownerId: true },
  });

  if (board && board.ownerId === userId) {
    return true;
  }

  const member = await prisma.boardMember.findUnique({
    where: { boardId_userId: { boardId, userId } },
  });

  if (!member || member.role === "VIEWER") {
    res.status(403).json({ error: "Forbidden: EDITOR or OWNER required" });
    return false;
  }
  return true;
}

// PATCH /api/v1/columns/:columnId - update title and/or position (EDITOR+)
router.patch(
  "/:columnId",
  authenticate,
  param("columnId").isUUID().withMessage("Invalid columnId"),
  body("title").optional().notEmpty().trim(),
  body("position").optional().isFloat().withMessage("Position must be a number"),
  async (req, res) => {
    if (sendValidationErrors(req, res)) return;

    try {
      const boardId = await getBoardIdForColumn(p(req.params.columnId));
      if (!boardId) {
        res.status(404).json({ error: "Column not found" });
        return;
      }

      if (!(await requireColumnEditor(boardId, req.user!.id, res))) return;

      const column = await prisma.column.update({
        where: { id: p(req.params.columnId) },
        data: {
          ...(req.body.title !== undefined && { title: req.body.title }),
          ...(req.body.position !== undefined && { position: req.body.position }),
        },
      });

      res.json({ column });
    } catch (error: any) {
      if (error?.code === "P2025") {
        res.status(404).json({ error: "Column not found" });
        return;
      }
      console.error("Update column error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// DELETE /api/v1/columns/:columnId - delete column + tasks cascade (EDITOR+)
router.delete(
  "/:columnId",
  authenticate,
  param("columnId").isUUID().withMessage("Invalid columnId"),
  async (req, res) => {
    if (sendValidationErrors(req, res)) return;

    try {
      const boardId = await getBoardIdForColumn(p(req.params.columnId));
      if (!boardId) {
        res.status(404).json({ error: "Column not found" });
        return;
      }

      if (!(await requireColumnEditor(boardId, req.user!.id, res))) return;

      await prisma.column.delete({ where: { id: p(req.params.columnId) } });
      res.status(204).send();
    } catch (error: any) {
      if (error?.code === "P2025") {
        res.status(404).json({ error: "Column not found" });
        return;
      }
      console.error("Delete column error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// POST /api/v1/columns/:columnId/tasks - create task in a column (EDITOR+)
export { getBoardIdForColumn };
export default router;
