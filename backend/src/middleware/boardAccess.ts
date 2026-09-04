import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";

const roleRank = {
  VIEWER: 1,
  EDITOR: 2,
  OWNER: 3,
};

type Role = keyof typeof roleRank;

export function requireBoardAccess(minRole: Role) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      const boardId = req.params.boardId || req.body.boardId;

      if (!boardId) {
        res.status(400).json({ error: "boardId is required" });
        return;
      }

      // First check if user is the owner defined in the board schema
      const board = await prisma.board.findUnique({
        where: { id: boardId },
        select: { ownerId: true },
      });

      if (!board) {
        res.status(404).json({ error: "Board not found" });
        return;
      }

      if (board.ownerId === req.user.id) {
        req.boardMember = {
          boardId,
          userId: req.user.id,
          role: "OWNER",
        };
        next();
        return;
      }

      const member = await prisma.boardMember.findUnique({
        where: {
          boardId_userId: {
            boardId,
            userId: req.user.id,
          },
        },
      });

      if (!member) {
        res.status(403).json({ error: "Forbidden: You are not a member of this board" });
        return;
      }

      const memberRank = roleRank[member.role as Role];
      const requiredRank = roleRank[minRole];

      if (memberRank < requiredRank) {
        res.status(403).json({ error: "Forbidden: Insufficient permissions" });
        return;
      }

      req.boardMember = member;
      next();
    } catch (error) {
      console.error("Board access middleware error:", error);
      res.status(500).json({ error: "Internal server error during authorization" });
    }
  };
}
