import { Router } from "express";
import { query, validationResult } from "express-validator";
import { authenticate } from "../middleware/authenticate.js";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.get("/me", authenticate, (req, res) => {
  res.json({ user: req.user });
});

router.get(
  "/search",
  authenticate,
  query("email").isEmail().withMessage("Valid email is required"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const email = req.query.email as string;

    try {
      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, name: true, email: true, image: true },
      });

      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      res.json({ user });
    } catch (error) {
      console.error("User search error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
