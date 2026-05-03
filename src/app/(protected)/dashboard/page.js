"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { useRouter } from "next/navigation";
import FullScreenLoader from "@/components/FullScreenLoader";
import { useAuthStore } from "@/store/authStore";

const DashboardPage = () => {
  const router = useRouter();
  const { user, isHydrated } = useAuthStore();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyTasks = async (userId) => {
    try {
      const data = await apiRequest(
        `/tasks?assigned_user_id=${userId}`
      );
      setTasks(data);
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isHydrated) return;
    if (!user?.id) {
      setLoading(false);
      return;
    }

    fetchMyTasks(user.id);
  }, [user, isHydrated]);

  if (!isHydrated || loading) return <FullScreenLoader />;

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">
        My Tasks
      </h1>

      {tasks.length === 0 ? (
        <p className="text-gray-600">
          No tasks assigned to you.
        </p>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => router.push(`/tasks/${task.id}`)}
              className="bg-white p-4 rounded shadow cursor-pointer hover:shadow-lg transition"
            >
              <h2 className="text-lg font-semibold">
                {task.title}
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Status: {task.status}
              </p>

              {task.due_date && (
                <p className="text-sm text-gray-500">
                  Due: {task.due_date}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;