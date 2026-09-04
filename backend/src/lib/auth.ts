import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma.js";

const isProd = process.env.NODE_ENV === "production" || !!process.env.RENDER;

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  baseURL:
    process.env.BETTER_AUTH_URL ||
    (isProd
      ? "https://abulbashar-kanban-task-management.vercel.app"
      : "http://localhost:5000"),
  emailAndPassword: { enabled: true },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      prompt: "select_account",
    },
  },
  trustedOrigins: [
    process.env.FRONTEND_URL,
    "https://abulbashar-kanban-task-management.vercel.app",
    "https://*.vercel.app",
    "http://localhost:3000",
  ].filter(Boolean) as string[],
  advanced: {
    cookiePrefix: "kanban",
    cookies: {
      session_token: {
        name: "kanban.session_token",
        attributes: {
          sameSite: "lax",
          secure: isProd,
          httpOnly: true,
          path: "/",
        },
      },
    },
  },
});
