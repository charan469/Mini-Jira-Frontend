"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCan } from "@/lib/helpers";
import { PERMISSIONS } from "@/lib/constants";

export default function AdminLayout({ children }) {
  const can = useCan();
  const router = useRouter();

  useEffect(() => {
    if (!can(PERMISSIONS.USER_MANAGE)) {
      router.replace("/dashboard");
    }
  }, [can, router]);

  if (!can(PERMISSIONS.USER_MANAGE)) return null;

  return <div>{children}</div>;
}