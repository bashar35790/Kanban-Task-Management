"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Spinner } from "@/components/ui/Spinner";

export default function Home() {
  const router = useRouter();
  const { data, isPending } = useSession();

  useEffect(() => {
    if (isPending) return;
    router.replace(data?.session ? "/boards" : "/login");
  }, [data, isPending, router]);

  return (
    <div className="flex flex-1 items-center justify-center">
      <Spinner className="h-8 w-8 text-primary" />
    </div>
  );
}
