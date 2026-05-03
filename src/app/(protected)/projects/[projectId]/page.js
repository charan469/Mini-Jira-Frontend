"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import FullScreenLoader from "@/components/FullScreenLoader";
import { PERMISSIONS } from "@/lib/constants";
import { useCan } from "@/lib/helpers";

const ProjectDetailsPage = () => {
  const router = useRouter();
  const { projectId } = useParams();
  const user = useAuthStore((state) => state.user);

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    due_date: "",
    // status: "TODO",
  });

  const can = useCan();

  // Fetch project + tasks
  const fetchData = async () => {
    try {
      const projectData = await apiRequest(`/projects/${projectId}`);
      const taskData = await apiRequest(`/tasks/?project_id=${projectId}`);

      setProject(projectData);
      setTasks(taskData);
    } catch (err) {
      throw err;
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
        // status: "new",
      });

      setShowTaskForm(false);
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm("Delete this task?")) return;

    try {
      await apiRequest(`/tasks/${taskId}`, {
        method: "DELETE",
      });

      setTasks((prev) =>
        prev.filter((task) => task.id !== taskId)
      );
    } catch (err) {
      throw err;
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

      {/* Project Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          {project?.name}
        </h1>
        <p className="text-gray-600">
          {project?.description}
        </p>
      </div>

      {/* Create Task Button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Tasks</h2>
        {can(PERMISSIONS.TASK_CREATE) && (
          <button
            onClick={() => setShowTaskForm(true)}
            className="bg-black text-white px-4 py-2 rounded"
          >
            Create Task
          </button>
        )}
      </div>

      {/* Task Form */}
      {showTaskForm && (
        <form
          onSubmit={handleCreateTask}
          className="bg-white p-6 rounded shadow mb-6 space-y-4"
        >
          <input
            name="title"
            placeholder="Task Title"
            value={taskForm.title}
            onChange={handleTaskChange}
            required
            className="w-full border p-2 rounded"
          />

          <textarea
            name="description"
            placeholder="Task Description"
            value={taskForm.description}
            onChange={handleTaskChange}
            required
            className="w-full border p-2 rounded"
          />

          <input
            type="date"
            name="due_date"
            value={taskForm.due_date}
            onChange={handleTaskChange}
            className="w-full border p-2 rounded"
          />

          {/* <select
            name="status"
            value={taskForm.status}
            onChange={handleTaskChange}
            className="w-full border p-2 rounded"
          >
            <option value="TODO">TODO</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="DONE">DONE</option>
          </select> */}

          <div className="flex gap-3">
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Save
            </button>

            <button
              type="button"
              onClick={() => setShowTaskForm(false)}
              className="bg-gray-300 px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <p>No tasks yet.</p>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => {
                router.push(`/tasks/${task.id}`);
              }}
              className="bg-white p-4 rounded shadow cursor-pointer hover:shadow-md transition"
            >
              <h3 className="text-lg font-semibold">
                {task.title}
              </h3>

              <p className="text-gray-600">
                {task.description}
              </p>

              <p className="text-sm text-gray-500 mt-2">
                Status: {task.status}
              </p>

              {task.due_date && (
                <p className="text-sm text-gray-500">
                  Due: {task.due_date}
                </p>
              )}

              <div className="flex justify-end mt-3">
                {can(PERMISSIONS.TASK_DELETE) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTask(task.id);
                    }}
                    className="text-red-600"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectDetailsPage;