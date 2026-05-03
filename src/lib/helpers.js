import { useAuthStore } from "@/store/authStore";

export const useCan = () => {
  const permissions = useAuthStore((s) => s.permissions);
  return (permission) => permissions?.includes(permission);
};