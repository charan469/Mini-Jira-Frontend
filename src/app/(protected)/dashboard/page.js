"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { useRouter } from "next/navigation";
import FullScreenLoader from "@/components/FullScreenLoader";
import { useAuthStore } from "@/store/authStore";
import { useNotification } from "@/components/NotificationProvider";

const DashboardPage = () => {
  const router = useRouter();
  const { user, isHydrated } = useAuthStore();
  const { notify } = useNotification();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyTasks = async (userId) => {
    try {
      const data = await apiRequest(
        `/tasks?assigned_user_id=${userId}`
      );
      setTasks(data || []);
    } catch (err) {
      notify(err?.message || "Failed to fetch tasks.", "error");
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
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's an overview of your tasks.</p>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-6">My Tasks</h2>

        {tasks.length === 0 ? (
          <div className="bg-card rounded-lg border border-border p-8 text-center">
            <p className="text-muted-foreground text-lg">No tasks assigned to you yet.</p>
            <p className="text-muted-foreground mt-2">Check back later or contact your project manager.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => router.push(`/tasks/${task.id}`)}
                className="bg-card rounded-lg border border-border p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-foreground line-clamp-2">
                    {task.title}
                  </h3>

                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      task.status === 'completed' ? 'bg-green-100 text-green-800' :
                      task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      task.status === 'blocked' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {task.status === 'not_started' ? 'To Do' :
                       task.status === 'in_progress' ? 'In Progress' :
                       task.status === 'blocked' ? 'On Hold' :
                       'Done'}
                    </span>
                  </div>

                  {task.due_date && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;