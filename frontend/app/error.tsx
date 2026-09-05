"use client";

import { useEffect } from "react";

type ErrorBoundaryProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    console.error("Uncaught client error:", error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center sm:p-8">
      <h1 className="text-xl font-bold text-text sm:text-2xl">Something went wrong</h1>
      <p className="max-w-sm break-words text-sm text-muted">
        {error.message || "An unexpected error occurred."}
      </p>
      <button
        onClick={reset}
        className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover sm:w-auto"
      >
        Try again
      </button>
    </div>
  );
}
