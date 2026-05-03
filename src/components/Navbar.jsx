"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useClerk } from "@clerk/nextjs";

const Navbar = () => {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const { signOut } = useClerk();

  const handleLogout = async () => {
    // 1. logout from Clerk (IMPORTANT)
    await signOut();

    // 2. clear your app state
    logout();

    // 3. redirect
    router.replace("/login");
  };

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-card border-b border-border shadow-sm">
      <h1 className="text-xl font-semibold text-foreground">Task Tracker</h1>

      <button
        onClick={handleLogout}
        className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors focus-visible focus-visible:ring-2 focus-visible:ring-ring"
      >
        Logout
      </button>
    </div>
  );
};

export default Navbar;