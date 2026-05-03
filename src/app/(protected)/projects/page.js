"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { useRouter } from "next/navigation";
import FullScreenLoader from "@/components/FullScreenLoader";
import { useCan } from "@/lib/helpers";
import { PERMISSIONS } from "@/lib/constants";

const ProjectsPage = () => {
  const router = useRouter();

  const [projects, setProjects] = useState();
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
  });

  const can = useCan();

  const fetchProjects = async () => {
    try {
      const data = await apiRequest("/projects/");
      setProjects(data);
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (formData.id) {
        await apiRequest(`/projects/${formData.id}`, {
          method: "PUT",
          body: JSON.stringify(formData),
        });
      } else {
        await apiRequest("/projects/", {
          method: "POST",
          body: JSON.stringify(formData),
        });
      }

      setShowForm(false);

      setFormData({
        name: "",
        description: "",
        start_date: "",
        end_date: "",
      });

      fetchProjects();
    } catch (err) {
      throw err;
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      await apiRequest(`/projects/${id}`, {
        method: "DELETE",
      });

      fetchProjects();
    } catch (err) {
      throw err;
    }
  };

  const handleEdit = (project) => {
    setShowForm(true);
    setFormData(project);
  };

  if (loading) return <FullScreenLoader />;

  return (
    <div className="px-6 py-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Projects</h1>

        {can(PERMISSIONS.PROJECT_CREATE) && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-black text-white px-4 py-2 rounded"
          >
            Create Project
          </button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded shadow mb-6 space-y-4"
        >
          <input
            name="name"
            placeholder="Project Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />

          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />

          <input
            type="date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />

          <input
            type="date"
            name="end_date"
            value={formData.end_date}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />

          <div className="flex gap-3">
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Save
            </button>

            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-gray-300 px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {projects.length === 0 ? (
        <p>No projects found.</p>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() =>
                router.push(`/projects/${project.id}`)
              }
              className="bg-white p-4 rounded shadow cursor-pointer hover:shadow-lg transition"
            >
              <h2 className="text-xl font-semibold">
                {project.name}
              </h2>

              {/* <p className="text-gray-600">
                Description: {project.description}
              </p> */}

              <p className="text-sm text-gray-500 mt-2">
                Start: {project.start_date} | End: {project.end_date}
              </p>

              <div className="flex justify-end gap-3 mt-3">
                {can(PERMISSIONS.PROJECT_UPDATE) && (
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      handleEdit(project);
                    }}
                    className="text-blue-600"
                  >
                    Edit
                  </button>
                )}

                {can(PERMISSIONS.PROJECT_DELETE) && (
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      handleDelete(project.id);
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

export default ProjectsPage;