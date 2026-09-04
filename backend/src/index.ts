import "dotenv/config";
import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import usersRouter from "./routes/users.js";
import boardsRouter from "./routes/boards.js";
import columnsRouter from "./routes/columns.js";
import tasksRouter from "./routes/tasks.js";

const app = express();

app.set("trust proxy", true);

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://abulbashar-kanban-task-management.vercel.app",
  "http://localhost:3000",
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app")
      ) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  })
);

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/v1/users", usersRouter);
app.use("/api/v1/boards", boardsRouter);
app.use("/api/v1/columns", columnsRouter);
app.use("/api/v1/tasks", tasksRouter);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" }); 
});

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend listening on 0.0.0.0:${PORT}`);
});

