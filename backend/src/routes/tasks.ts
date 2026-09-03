import { Router } from "express";
import { body, param, validationResult } from "express-validator";
import { authenticate } from "../middleware/authenticate";
import { prisma } from "../lib/prisma";
import {
  computePosition,
  needsRebalance,
  rebalancePositions,
} from "../utils/fractional";

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

async function getBoardIdForTask(taskId: string): Promise<string | null> {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { columnId: true },
  });
  if (!task) return null;
  const column = await prisma.column.findUnique({
    where: { id: task.columnId },
    select: { boardId: true },
  });
  return column?.boardId ?? null;
}

async function requireEditor(
  boardId: string,
  userId: string,
  res: any,
): Promise<boolean> {
  const member = await prisma.boardMember.findUnique({
    where: { boardId_userId: { boardId, userId } },
  });
  if (!member || member.role === "VIEWER") {
    res.status(403).json({ error: "Forbidden: EDITOR or OWNER required" });
    return false;
  }
  return true;
}

router.post(
  "/columns/:columnId/tasks",
  authenticate,
  param("columnId").isUUID().withMessage("Invalid columnId"),
  body("title").notEmpty().withMessage("Title is required").trim(),
  body("description").optional().trim(),
  body("category").optional().trim(),
  body("dueDate").optional().trim(),
  body("commentsCount").optional().isInt({ min: 0 }),
  body("attachmentsCount").optional().isInt({ min: 0 }),
  body("assigneeId").optional().trim(),
  async (req, res) => {
    if (sendValidationErrors(req, res)) return;

    try {
      const boardId = await getBoardIdForColumn(p(req.params.columnId));
      if (!boardId) {
        res.status(404).json({ error: "Column not found" });
        return;
      }

      if (!(await requireEditor(boardId, req.user!.id, res))) return;

      const lastTask = await prisma.task.findFirst({
        where: { columnId: p(req.params.columnId) },
        orderBy: { position: "desc" },
        select: { position: true },
      });

      const position = computePosition(lastTask?.position ?? null, null);

      const task = await prisma.task.create({
        data: {
          columnId: p(req.params.columnId),
          title: req.body.title,
          description: req.body.description ?? null,
          category: req.body.category || "UI Design",
          dueDate: req.body.dueDate ?? "Nov 24",
          commentsCount: req.body.commentsCount ?? 0,
          attachmentsCount: req.body.attachmentsCount ?? 0,
          assigneeId: req.body.assigneeId ?? req.user!.name ?? "You",
          position,
          createdById: req.user!.id,
        },
      });

      await prisma.boardActivity
        .create({
          data: {
            boardId,
            userName: req.user!.name || "Someone",
            action: "added task",
            target: task.title,
            iconColor: "green",
          },
        })
        .catch((e) => console.error("Activity logging error:", e));

      res.status(201).json({ task });
    } catch (error) {
      console.error("Create task error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

router.patch(
  "/:taskId",
  authenticate,
  param("taskId").isUUID().withMessage("Invalid taskId"),
  body("title").optional().notEmpty().trim(),
  body("description").optional().trim(),
  body("category").optional().trim(),
  body("dueDate").optional().trim(),
  body("commentsCount").optional().isInt({ min: 0 }),
  body("attachmentsCount").optional().isInt({ min: 0 }),
  body("assigneeId").optional().trim(),
  async (req, res) => {
    if (sendValidationErrors(req, res)) return;

    try {
      const boardId = await getBoardIdForTask(p(req.params.taskId));
      if (!boardId) {
        res.status(404).json({ error: "Task not found" });
        return;
      }

      if (!(await requireEditor(boardId, req.user!.id, res))) return;

      const task = await prisma.task.update({
        where: { id: p(req.params.taskId) },
        data: {
          ...(req.body.title !== undefined && { title: req.body.title }),
          ...(req.body.description !== undefined && {
            description: req.body.description,
          }),
          ...(req.body.category !== undefined && {
            category: req.body.category,
          }),
          ...(req.body.dueDate !== undefined && { dueDate: req.body.dueDate }),
          ...(req.body.commentsCount !== undefined && {
            commentsCount: req.body.commentsCount,
          }),
          ...(req.body.attachmentsCount !== undefined && {
            attachmentsCount: req.body.attachmentsCount,
          }),
          ...(req.body.assigneeId !== undefined && {
            assigneeId: req.body.assigneeId,
          }),
        },
      });

      res.json({ task });
    } catch (error: any) {
      if (error?.code === "P2025") {
        res.status(404).json({ error: "Task not found" });
        return;
      }
      console.error("Update task error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

router.delete(
  "/:taskId",
  authenticate,
  param("taskId").isUUID().withMessage("Invalid taskId"),
  async (req, res) => {
    if (sendValidationErrors(req, res)) return;

    try {
      const boardId = await getBoardIdForTask(p(req.params.taskId));
      if (!boardId) {
        res.status(404).json({ error: "Task not found" });
        return;
      }

      if (!(await requireEditor(boardId, req.user!.id, res))) return;

      await prisma.task.delete({ where: { id: p(req.params.taskId) } });
      res.status(204).send();
    } catch (error: any) {
      if (error?.code === "P2025") {
        res.status(404).json({ error: "Task not found" });
        return;
      }
      console.error("Delete task error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

router.post(
  "/:taskId/move",
  authenticate,
  param("taskId").isUUID().withMessage("Invalid taskId"),
  body("targetColumnId")
    .isUUID()
    .withMessage("targetColumnId must be a valid UUID"),
  body("afterTaskId")
    .optional({ nullable: true })
    .isUUID()
    .withMessage("afterTaskId must be a UUID or null"),
  body("beforeTaskId")
    .optional({ nullable: true })
    .isUUID()
    .withMessage("beforeTaskId must be a UUID or null"),
  async (req, res) => {
    if (sendValidationErrors(req, res)) return;

    const taskId = p(req.params.taskId);
    const { targetColumnId, afterTaskId, beforeTaskId } = req.body;

    try {
      const task = await prisma.task.findUnique({
        where: { id: taskId },
        select: { id: true, columnId: true },
      });

      if (!task) {
        res.status(404).json({ error: "Task not found" });
        return;
      }

      const column = await prisma.column.findUnique({
        where: { id: task.columnId },
        select: { boardId: true },
      });
      const boardId = column?.boardId ?? "";
      if (!boardId) {
        res.status(404).json({ error: "Column for task not found" });
        return;
      }

      if (!(await requireEditor(boardId, req.user!.id, res))) return;

      const targetColumn = await prisma.column.findUnique({
        where: { id: targetColumnId },
        select: { boardId: true },
      });

      if (!targetColumn || targetColumn.boardId !== boardId) {
        res
          .status(400)
          .json({ error: "targetColumnId does not belong to the same board" });
        return;
      }

      const afterTask = afterTaskId
        ? await prisma.task.findUnique({
            where: { id: afterTaskId },
            select: { position: true },
          })
        : null;

      const beforeTask = beforeTaskId
        ? await prisma.task.findUnique({
            where: { id: beforeTaskId },
            select: { position: true },
          })
        : null;

      const prevPos = afterTask?.position ?? null;
      const nextPos = beforeTask?.position ?? null;

      const newPosition = computePosition(prevPos, nextPos);

      const updatedTask = await prisma.$transaction(async (tx) => {
        const updated = await tx.task.update({
          where: { id: taskId },
          data: {
            columnId: targetColumnId as string,
            position: newPosition,
          },
        });

        const allPositions = await tx.task.findMany({
          where: { columnId: targetColumnId as string },
          select: { id: true, position: true },
          orderBy: { position: "asc" },
        });

        if (needsRebalance(allPositions.map((t) => t.position))) {
          const newPositions = rebalancePositions(allPositions.length);
          await Promise.all(
            allPositions.map((t, i) =>
              tx.task.update({
                where: { id: t.id },
                data: { position: newPositions[i] },
              }),
            ),
          );
          console.log(
            `Rebalanced ${allPositions.length} tasks in column ${targetColumnId}`,
          );
        }

        return updated;
      });

      res.json({ task: updatedTask });
    } catch (error) {
      console.error("Move task error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

export default router;
