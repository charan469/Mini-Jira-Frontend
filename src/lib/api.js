import { useAuthStore } from "@/store/authStore";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class ApiError extends Error {
  constructor(message, status, details = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export const apiRequest = async (endpoint, options = {}) => {
  const token = useAuthStore.getState().token;

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message =
      errorData.detail || errorData.message || "Something went wrong";

    if (response.status === 401) {
      const hadToken = !!token;
      if (hadToken) {
        useAuthStore.getState().logout();
      }
    }

    throw new ApiError(message, response.status, errorData);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};