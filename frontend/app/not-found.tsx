import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center sm:p-8">
      <h1 className="text-5xl font-bold text-primary sm:text-6xl">404</h1>
      <p className="text-base font-medium text-text sm:text-lg">Page not found</p>
      <p className="max-w-sm text-sm text-muted">
        The page you&apos;re looking for doesn&apos;t exist or was moved.
      </p>
      <Link
        href="/boards"
        className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover sm:w-auto"
      >
        Back to boards
      </Link>
    </div>
  );
}
