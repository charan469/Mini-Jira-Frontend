"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { NotificationProvider } from "@/components/NotificationProvider";

export default function ProtectedLayout({ children }) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  useEffect(() => {
    if (isHydrated && !token) {
      router.replace("/login");
    }
  }, [token, isHydrated, router]);

  if (!isHydrated || !token) return null;

  return (
    <NotificationProvider>
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />

        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-8 bg-muted/20">{children}</main>
        </div>
      </div>
    </NotificationProvider>
  );
}