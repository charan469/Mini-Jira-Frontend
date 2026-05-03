"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SignInButton, useUser } from "@clerk/nextjs";

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && user) {
      router.replace("/sso-callback");
    }
  }, [isLoaded, user, router]);

  if (!isLoaded) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (user) {
    return <div className="flex min-h-screen items-center justify-center">Redirecting...</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Task Tracker Login
        </h1>

        <SignInButton mode="redirect">
          <button className="w-full bg-black text-white py-3 rounded">
            Login with SSO
          </button>
        </SignInButton>
      </div>
    </div>
  );
}