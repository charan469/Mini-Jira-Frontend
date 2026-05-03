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

const TaskDetailsPage = () => {
  const { taskId } = useParams();
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

  setTask((prev) => ({
    ...prev,
    [field]: value,
  }));

  try {
    await apiRequest(`/tasks/${taskId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  } catch (err) {
    fetchTask();
    throw err;
  }
};

  if (loading) return <FullScreenLoader />;

  return (
    <div className="p-6 max-w-2xl">
      <button
        onClick={() => router.push(`/projects/${task.project_id}`)}
        className="text-sm text-black-600 hover:underline mb-4 inline-block"
      >
        ← Back to Project Details
      </button>

      <h1 className="text-2xl font-bold mb-2">
        <EditableText
          value={task.title}
          onSave={(val) => updateField("title", val)}
          disabled={!can(PERMISSIONS.TASK_UPDATE)}
        />
      </h1>

      Description:{" "}
      <EditableTextarea
        value={task.description}
        onSave={(val) => updateField("description", val)}
        disabled={!can(PERMISSIONS.TASK_UPDATE)}
      />

      <div className="space-y-2 text-sm text-gray-500 mb-4">
        <div className="mt-4 text-sm text-gray-600">
          Status:{" "}
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

        <div className="mt-4 text-sm text-gray-600">
          Due Date:{" "}
          <EditableDate
            value={task.due_date}
            onSave={(val) => updateField("due_date", val)}
            // disabled={!can(PERMISSIONS.TASK_UPDATE)}
          />
        </div>

        <p>Created By: {getUserName(task.created_by_user_id)}</p>

        <div className="flex gap-2 items-center">
          <span className="text-gray-500">Assigned to:</span>

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
      </div>
    </div>
  );
};

export default TaskDetailsPage;