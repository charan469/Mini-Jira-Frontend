"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import FullScreenLoader from "@/components/FullScreenLoader";
import { PERMISSIONS } from "@/lib/constants";
import { useCan } from "@/lib/helpers";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { useNotification } from "@/components/NotificationProvider";

const ProjectDetailsPage = () => {
  const router = useRouter();
  const { projectId } = useParams();
  const user = useAuthStore((state) => state.user);
  const { notify } = useNotification();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmDeleteTask, setConfirmDeleteTask] = useState(null);
  const [savingTask, setSavingTask] = useState(false);

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    due_date: "",
  });

  const can = useCan();

  // Fetch project + tasks
  const fetchData = async () => {
    setLoading(true);
    setError("");

    try {
      const projectData = await apiRequest(`/projects/${projectId}`);
      const taskData = await apiRequest(`/tasks/?project_id=${projectId}`);

      setProject(projectData);
      setTasks(taskData || []);
    } catch (err) {
      const message = err?.message || "Unable to load project details.";
      setError(message);
      notify(message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchData();
    }
  }, [projectId]);

  const handleTaskChange = (e) => {
    setTaskForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setSavingTask(true);

    try {
      const newTask = await apiRequest("/tasks/", {
        method: "POST",
        body: JSON.stringify({
          ...taskForm,
          project_id: projectId,
          created_by_user_id: user.id,
        }),
      });

      setTasks((prev) => [...prev, newTask]);
      setTaskForm({
        title: "",
        description: "",
        due_date: "",
      });
      setShowTaskForm(false);
      notify("Task created successfully.", "success");
    } catch (err) {
      notify(err?.message || "Unable to create task.", "error");
    } finally {
      setSavingTask(false);
    }
  };

  const handleDeleteTask = (task) => {
    setConfirmDeleteTask(task);
  };

  const confirmDeleteTaskAction = async () => {
    if (!confirmDeleteTask) return;

    try {
      await apiRequest(`/tasks/${confirmDeleteTask.id}`, {
        method: "DELETE",
      });
      setTasks((prev) =>
        prev.filter((task) => task.id !== confirmDeleteTask.id)
      );
      notify("Task deleted successfully.", "success");
    } catch (err) {
      notify(err?.message || "Unable to delete task.", "error");
    } finally {
      setConfirmDeleteTask(null);
    }
  };

  if (loading) return <FullScreenLoader />;

  return (
    <div className="px-6 py-4">
      <button
        onClick={() => router.push("/projects")}
        className="text-sm text-black-600 hover:underline mb-4 inline-block"
      >
        ← Back to Projects
      </button>

      {error && (
        <div className="mb-6 rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Project Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{project?.name}</h1>
        <p className="text-gray-600">{project?.description}</p>
      </div>

      {/* Create Task Button */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
        <h2 className="text-xl font-semibold">Tasks</h2>
        {can(PERMISSIONS.TASK_CREATE) && (
          <button
            onClick={() => setShowTaskForm(true)}
            className="rounded-full bg-black px-5 py-2 text-white hover:bg-slate-900 transition"
          >
            Create Task
          </button>
        )}
      </div>

      {/* Task Form */}
      {showTaskForm && (
        <form
          onSubmit={handleCreateTask}
          className="bg-white p-6 rounded-3xl shadow-sm mb-6 space-y-4"
        >
          <input
            name="title"
            placeholder="Task Title"
            value={taskForm.title}
            onChange={handleTaskChange}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 focus:border-black focus:outline-none"
          />

          <textarea
            name="description"
            placeholder="Task Description"
            value={taskForm.description}
            onChange={handleTaskChange}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 focus:border-black focus:outline-none min-h-[120px]"
          />

          <input
            type="date"
            name="due_date"
            value={taskForm.due_date}
            onChange={handleTaskChange}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 focus:border-black focus:outline-none"
          />

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={savingTask}
              className="rounded-full bg-green-600 px-5 py-2 text-white hover:bg-green-700 transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              Save Task
            </button>

            <button
              type="button"
              onClick={() => setShowTaskForm(false)}
              className="rounded-full bg-gray-200 px-5 py-2 text-slate-700 hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600">
          No tasks yet. Create a task to start tracking work on this project.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => {
                router.push(`/tasks/${task.id}`);
              }}
              className="group cursor-pointer rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <h3 className="text-lg font-semibold text-slate-900">
                {task.title}
              </h3>

              <p className="text-gray-600 mt-2">
                {task.description}
              </p>

              <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500">
                <span>Status: {task.status}</span>
                {task.due_date && <span>Due: {task.due_date}</span>}
              </div>

              {can(PERMISSIONS.TASK_DELETE) && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTask(task);
                    }}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmationDialog
        open={Boolean(confirmDeleteTask)}
        title="Delete Task"
        description={
          confirmDeleteTask
            ? `Are you sure you want to delete ${confirmDeleteTask.title}? This action cannot be undone.`
            : ""
        }
        onClose={() => setConfirmDeleteTask(null)}
        onConfirm={confirmDeleteTaskAction}
        confirmLabel="Delete"
      />
    </div>
  );
};

export default ProjectDetailsPage;