"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiRequest } from "@/lib/api";
import EditableText from "@/components/inline/EditableText";
import EditableTextarea from "@/components/inline/EditableTextarea";
import EditableSelect from "@/components/inline/EditableSelect";
import FullScreenLoader from "@/components/FullScreenLoader";
import { PERMISSIONS } from "@/lib/constants";
import { useCan } from "@/lib/helpers";
import EditableDate from "@/components/inline/EditableDate";
import { useRouter } from "next/navigation";
import { useNotification } from "@/components/NotificationProvider";

const TaskDetailsPage = () => {
  const { taskId } = useParams();
  const { notify } = useNotification();
  const [users, setUsers] = useState([]);
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const can = useCan();
  const router = useRouter();

  const fetchTask = async () => {
    try {
      const data = await apiRequest(`/tasks/${taskId}`);
      setTask(data);
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    const data = await apiRequest("/users");
    setUsers(data);
  };

  useEffect(() => {
    if (taskId) fetchTask();
    fetchUsers();
  }, [taskId]);

  const getUserName = (userId) => {
    if (!userId) return "Unassigned";
    const user = users.find((u) => u.id === userId);
    return user ? user.full_name : "Unknown User";
  };

 const updateField = async (field, value) => {
  const payload = {
    [field]: value === "" ? null : value,
  };

  const previousValue = task?.[field];
  setTask((prev) => ({
    ...prev,
    [field]: value,
  }));

  try {
    await apiRequest(`/tasks/${taskId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    notify("Task updated successfully.", "success");
  } catch (err) {
    setTask((prev) => ({
      ...prev,
      [field]: previousValue,
    }));
    notify(err?.message || "Unable to update task.", "error");
  }
};

  if (loading) return <FullScreenLoader />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push(`/projects/${task.project_id}`)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Project
        </button>
      </div>

      <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              <EditableText
                value={task.title}
                onSave={(val) => updateField("title", val)}
                disabled={!can(PERMISSIONS.TASK_UPDATE)}
              />
            </h1>
            <p className="text-muted-foreground">Task #{task.id}</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Description
              </label>
              <EditableTextarea
                value={task.description}
                onSave={(val) => updateField("description", val)}
                disabled={!can(PERMISSIONS.TASK_UPDATE)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Status
                  </label>
                  <EditableSelect
                    value={task.status}
                    options={[
                      { value: "not_started", label: "To Do" },
                      { value: "in_progress", label: "In Progress" },
                      { value: "blocked", label: "On Hold" },
                      { value: "completed", label: "Done" },
                    ]}
                    onSave={(val) => updateField("status", val)}
                    disabled={!can(PERMISSIONS.TASK_UPDATE)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Due Date
                  </label>
                  <EditableDate
                    value={task.due_date}
                    onSave={(val) => updateField("due_date", val)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Assigned To
                  </label>
                  <EditableSelect
                    value={task.assigned_user_id || "Unassigned"}
                    options={[
                      { value: "", label: "Unassigned" },
                      ...users.map((u) => ({
                        value: u.id,
                        label: u.full_name,
                      })),
                    ]}
                    onSave={async (val) => {
                      const previous = task.assigned_user_id;

                      setTask((prev) => ({
                        ...prev,
                        assigned_user_id: val,
                      }));

                      try {
                        await apiRequest(
                          `/tasks/${taskId}/assign?assigned_user_id=${val}`,
                          { method: "POST" }
                        );
                      } catch (err) {
                        setTask((prev) => ({
                          ...prev,
                          assigned_user_id: previous,
                        }));
                        throw err;
                      }
                    }}
                    disabled={!can(PERMISSIONS.TASK_ASSIGN)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Created By
                  </label>
                  <p className="text-muted-foreground">{getUserName(task.created_by_user_id)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsPage;