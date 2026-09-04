import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Sign up - TASK Kanban",
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-1 items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-4xl border border-white/80 bg-white/85 p-8 shadow-2xl shadow-purple-950/5 backdrop-blur-xl">
        <div className="mb-8 text-center flex flex-col items-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-500 font-black text-sm text-white shadow-sm shadow-pink-200">
              T
            </span>
            <span className="text-sm font-black tracking-wider text-pink-500">
              TASK
            </span>
          </Link>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Create account</h1>
          <p className="text-xs text-slate-400 mt-1">Start organizing your team and tasks</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}

