import "dotenv/config";
import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import usersRouter from "./routes/users";
import boardsRouter from "./routes/boards";
import columnsRouter from "./routes/columns";
import tasksRouter from "./routes/tasks";

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));

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

app.listen(process.env.PORT || 5000, () => {
  console.log(`Backend listening on ${process.env.PORT || 5000}`);
});
