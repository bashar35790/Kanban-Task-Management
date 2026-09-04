import { Router } from "express";
import { body, param, validationResult } from "express-validator";
import { authenticate } from "../middleware/authenticate";
import { requireBoardAccess } from "../middleware/boardAccess";
import { prisma } from "../lib/prisma";
import { computePosition } from "../utils/fractional";

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


// POST /api/v1/boards — create board; creator becomes OWNER
router.post(
  "/",
  authenticate,
  body("title").notEmpty().withMessage("Title is required").trim(),
  body("description").optional().trim(),
  async (req, res) => {
    if (sendValidationErrors(req, res)) return;

    try {
      const board = await prisma.$transaction(async (tx) => {
        const newBoard = await tx.board.create({
          data: {
            title: req.body.title,
            description: req.body.description ?? null,
            ownerId: req.user!.id,
          },
        });

        await tx.boardMember.create({
          data: {
            boardId: newBoard.id,
            userId: req.user!.id,
            role: "OWNER",
          },
        });

        await tx.boardActivity.create({
          data: {
            boardId: newBoard.id,
            userName: req.user!.name || "User",
            action: "created this board",
            iconColor: "blue",
          },
        });

        return newBoard;
      });

      res.status(201).json({
        board: {
          ...board,
          role: "OWNER",
          memberCount: 1,
          taskCount: 0,
        },
      });
    } catch (error) {
      console.error("Create board error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// GET /api/v1/boards — list all boards the user owns or is a member of
router.get("/", authenticate, async (req, res) => {
  try {
    const rawBoards = await prisma.board.findMany({
      where: {
        OR: [
          { ownerId: req.user!.id },
          { members: { some: { userId: req.user!.id } } },
        ],
      },
      include: {
        members: {
          where: { userId: req.user!.id },
          select: { role: true },
        },
        _count: {
          select: {
            members: true,
          },
        },
        columns: {
          select: {
            _count: {
              select: { tasks: true },
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const boards = await Promise.all(
      rawBoards.map(async (b) => {
        const taskCount = b.columns.reduce(
          (sum, col) => sum + col._count.tasks,
          0
        );

        const ownerUser = await prisma.user.findUnique({
          where: { id: b.ownerId },
          select: { id: true, name: true, email: true, image: true },
        });

        const isOwner = b.ownerId === req.user!.id;
        const role = isOwner ? "OWNER" : (b.members[0]?.role || "VIEWER");

        const { columns, _count, members, ...boardData } = b;
        return {
          ...boardData,
          role,
          memberCount: _count.members,
          taskCount,
          owner: ownerUser,
        };
      })
    );

    res.json({ boards });
  } catch (error) {
    console.error("List boards error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/v1/boards/:boardId - board detail with columns + tasks ordered by position
router.get(
  "/:boardId",
  authenticate,
  param("boardId").isUUID().withMessage("Invalid boardId"),
  requireBoardAccess("VIEWER"),
  async (req, res) => {
    if (sendValidationErrors(req, res)) return;

    try {
      const board = await prisma.board.findUnique({
        where: { id: p(req.params.boardId) },
        include: {
          columns: {
            orderBy: { position: "asc" },
            include: {
              tasks: {
                orderBy: { position: "asc" },
              },
            },
          },
          members: {
            select: {
              id: true,
              userId: true,
              role: true,
              createdAt: true,
            },
          },
          activities: {
            orderBy: { createdAt: "desc" },
            take: 20,
          },
        },
      });

      if (!board) {
        res.status(404).json({ error: "Board not found" });
        return;
      }

      const ownerUser = await prisma.user.findUnique({
        where: { id: board.ownerId },
        select: { id: true, name: true, email: true, image: true },
      });

      const enrichedMembers = await Promise.all(
        board.members.map(async (m) => {
          const user = await prisma.user.findUnique({
            where: { id: m.userId },
            select: { id: true, name: true, email: true, image: true },
          });
          return { ...m, user };
        })
      );

      res.json({
        board: { ...board, owner: ownerUser, members: enrichedMembers },
        yourRole: req.boardMember?.role,
      });
    } catch (error) {
      console.error("Get board error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// PATCH /api/v1/boards/:boardId/favorite - toggle favorite flag (VIEWER+)
router.patch(
  "/:boardId/favorite",
  authenticate,
  param("boardId").isUUID().withMessage("Invalid boardId"),
  requireBoardAccess("VIEWER"),
  async (req, res) => {
    if (sendValidationErrors(req, res)) return;

    try {
      const current = await prisma.board.findUnique({
        where: { id: p(req.params.boardId) },
        select: { isFavorite: true },
      });

      const board = await prisma.board.update({
        where: { id: p(req.params.boardId) },
        data: { isFavorite: !current?.isFavorite },
      });

      res.json({ board });
    } catch (error) {
      console.error("Toggle favorite error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// PATCH /api/v1/boards/:boardId - update title/description (EDITOR+)
router.patch(
  "/:boardId",
  authenticate,
  param("boardId").isUUID().withMessage("Invalid boardId"),
  body("title").optional().notEmpty().trim().withMessage("Title cannot be empty"),
  body("description").optional().trim(),
  requireBoardAccess("EDITOR"),
  async (req, res) => {
    if (sendValidationErrors(req, res)) return;

    try {
      const existing = await prisma.board.findUnique({
        where: { id: p(req.params.boardId) },
        select: { title: true },
      });

      const board = await prisma.board.update({
        where: { id: p(req.params.boardId) },
        data: {
          ...(req.body.title !== undefined && { title: req.body.title }),
          ...(req.body.description !== undefined && { description: req.body.description }),
        },
      });

      if (req.body.title && req.body.title !== existing?.title) {
        await prisma.boardActivity.create({
          data: {
            boardId: board.id,
            userName: req.user!.name || "User",
            action: `renamed board to "${board.title}"`,
            iconColor: "purple",
          },
        }).catch((err) => console.error("Board activity error:", err));
      }

      res.json({ board });
    } catch (error) {
      console.error("Update board error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// DELETE /api/v1/boards/:boardId - delete board (OWNER; cascades columns/tasks/members)
router.delete(
  "/:boardId",
  authenticate,
  param("boardId").isUUID().withMessage("Invalid boardId"),
  requireBoardAccess("OWNER"),
  async (req, res) => {
    if (sendValidationErrors(req, res)) return;

    try {
      await prisma.board.delete({ where: { id: p(req.params.boardId) } });
      res.status(204).send();
    } catch (error) {
      console.error("Delete board error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);


// GET /api/v1/boards/:boardId/members — list members with roles (VIEWER+)
router.get(
  "/:boardId/members",
  authenticate,
  param("boardId").isUUID().withMessage("Invalid boardId"),
  requireBoardAccess("VIEWER"),
  async (req, res) => {
    if (sendValidationErrors(req, res)) return;

    try {
      const members = await prisma.boardMember.findMany({
        where: { boardId: p(req.params.boardId) },
        orderBy: { createdAt: "asc" },
      });

      // Enrich with user info from Better Auth user table
      const enriched = await Promise.all(
        members.map(async (m) => {
          const user = await prisma.user.findUnique({
            where: { id: m.userId },
            select: { id: true, name: true, email: true, image: true },
          });
          return { ...m, user };
        })
      );

      res.json({ members: enriched });
    } catch (error) {
      console.error("List members error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// POST /api/v1/boards/:boardId/members — invite user by email (OWNER)
router.post(
  "/:boardId/members",
  authenticate,
  param("boardId").isUUID().withMessage("Invalid boardId"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("role")
    .isIn(["EDITOR", "VIEWER"])
    .withMessage("Role must be EDITOR or VIEWER"),
  requireBoardAccess("OWNER"),
  async (req, res) => {
    if (sendValidationErrors(req, res)) return;

    try {
      const targetUser = await prisma.user.findUnique({
        where: { email: req.body.email },
        select: { id: true, name: true, email: true },
      });

      if (!targetUser) {
        res.status(404).json({ error: "User with that email is not registered" });
        return;
      }

      try {
        const member = await prisma.boardMember.create({
          data: {
            boardId: p(req.params.boardId),
            userId: targetUser.id,
            role: req.body.role,
          },
        });
        res.status(201).json({ member, user: targetUser });
      } catch (createError: any) {
        if (createError?.code === "P2002") {
          res.status(409).json({ error: "User is already a member of this board" });
          return;
        }
        throw createError;
      }
    } catch (error) {
      console.error("Invite member error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// PATCH /api/v1/boards/:boardId/members/:userId — change member role (OWNER)
router.patch(
  "/:boardId/members/:userId",
  authenticate,
  param("boardId").isUUID().withMessage("Invalid boardId"),
  param("userId").notEmpty().withMessage("userId is required"),
  body("role")
    .isIn(["EDITOR", "VIEWER", "OWNER"])
    .withMessage("Role must be EDITOR, VIEWER, or OWNER"),
  requireBoardAccess("OWNER"),
  async (req, res) => {
    if (sendValidationErrors(req, res)) return;

    try {
      const member = await prisma.boardMember.update({
        where: {
          boardId_userId: {
            boardId: p(req.params.boardId),
            userId: p(req.params.userId),
          },
        },
        data: { role: req.body.role },
      });

      res.json({ member });
    } catch (error: any) {
      if (error?.code === "P2025") {
        res.status(404).json({ error: "Member not found" });
        return;
      }
      console.error("Change role error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.delete(
  "/:boardId/members/:userId",
  authenticate,
  param("boardId").isUUID().withMessage("Invalid boardId"),
  param("userId").notEmpty().withMessage("userId is required"),
  requireBoardAccess("OWNER"),
  async (req, res) => {
    if (sendValidationErrors(req, res)) return;

    if (p(req.params.userId) === req.user!.id) {
      res.status(400).json({
        error: "Cannot remove yourself from a board. Ownership transfer is not supported.",
      });
      return;
    }

    try {
      await prisma.boardMember.delete({
        where: {
          boardId_userId: {
            boardId: p(req.params.boardId),
            userId: p(req.params.userId),
          },
        },
      });

      res.status(204).send();
    } catch (error: any) {
      if (error?.code === "P2025") {
        res.status(404).json({ error: "Member not found" });
        return;
      }
      console.error("Remove member error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// GET /api/v1/boards/:boardId/columns - read columns for a board (VIEWER+)
router.get(
  "/:boardId/columns",
  authenticate,
  param("boardId").isUUID().withMessage("Invalid boardId"),
  requireBoardAccess("VIEWER"),
  async (req, res) => {
    if (sendValidationErrors(req, res)) return;

    try {
      const columns = await prisma.column.findMany({
        where: { boardId: p(req.params.boardId) },
        orderBy: { position: "asc" },
        include: {
          tasks: {
            orderBy: { position: "asc" },
          },
        },
      });

      res.json({ columns });
    } catch (error) {
      console.error("Get columns error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.post(
  "/:boardId/columns",
  authenticate,
  param("boardId").isUUID().withMessage("Invalid boardId"),
  body("title").notEmpty().withMessage("Title is required").trim(),
  requireBoardAccess("EDITOR"),
  async (req, res) => {
    if (sendValidationErrors(req, res)) return;

    try {
      const lastColumn = await prisma.column.findFirst({
        where: { boardId: p(req.params.boardId) },
        orderBy: { position: "desc" },
        select: { position: true },
      });

      const position = computePosition(lastColumn?.position ?? null, null);

      const column = await prisma.column.create({
        data: {
          boardId: p(req.params.boardId),
          title: req.body.title,
          position,
        },
      });

      res.status(201).json({ column });
    } catch (error) {
      console.error("Create column error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
