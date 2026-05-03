"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useRef } from "react";
import { apiRequest } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

export default function SSOCallbackPage() {
  const { user, isLoaded } = useUser();
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();
  const calledRef = useRef(false);

  const handleSSO = async (user) => {
    try {
      const data = await apiRequest("/auth/sso-login", {
        method: "POST",
        body: JSON.stringify({
          email: user.primaryEmailAddress.emailAddress,
          provider_user_id: user.id,
          full_name: user.fullName,
        }),
      });

      setAuth(data.access_token, data.user, data.permissions);
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      router.push("/login");
    }
  };

  useEffect(() => {
    if (isLoaded && user && !calledRef.current) {
      calledRef.current = true;
      handleSSO(user);
    }
  }, [isLoaded, user]);

  return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
}