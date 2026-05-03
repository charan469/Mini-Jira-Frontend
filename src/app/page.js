"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    if (user) {
      router.replace("/sso-callback");
    } else {
      router.replace("/login");
    }
  }, [isLoaded, user]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      Loading...
    </div>
  );
}