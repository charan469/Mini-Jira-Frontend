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
    <div className="flex items-center justify-between px-4 py-4 bg-white shadow">
      <h1 className="text-xl font-semibold">Task Traker</h1>

      <button
        onClick={handleLogout}
        className="bg-black text-white px-4 py-2 rounded hover:opacity-90"
      >
        Logout
      </button>
    </div>
  );
};

export default Navbar;