"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { useRouter } from "next/navigation";
import FullScreenLoader from "@/components/FullScreenLoader";
import { useCan } from "@/lib/helpers";
import { PERMISSIONS } from "@/lib/constants";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { useNotification } from "@/components/NotificationProvider";

const ProjectsPage = () => {
  const router = useRouter();
  const { notify } = useNotification();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
  });

  const can = useCan();

  const fetchProjects = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest("/projects/");
      setProjects(data || []);
    } catch (err) {
      const message = err?.message || "Unable to load projects.";
      setError(message);
      notify(message, "error");
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

    if (!formData.name || !formData.start_date || !formData.end_date) {
      notify("Please complete the project form before saving.", "warning");
      return;
    }

    setSubmitting(true);

    try {
      if (formData.id) {
        await apiRequest(`/projects/${formData.id}`, {
          method: "PUT",
          body: JSON.stringify(formData),
        });
        notify("Project updated successfully.", "success");
      } else {
        await apiRequest("/projects/", {
          method: "POST",
          body: JSON.stringify(formData),
        });
        notify("Project created successfully.", "success");
      }

      setShowForm(false);
      setFormData({
        name: "",
        description: "",
        start_date: "",
        end_date: "",
      });
      await fetchProjects();
    } catch (err) {
      notify(err?.message || "Unable to save project.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (project) => {
    setConfirmDelete(project);
  };

  const confirmDeleteProject = async () => {
    if (!confirmDelete) return;

    try {
      await apiRequest(`/projects/${confirmDelete.id}`, {
        method: "DELETE",
      });
      setProjects((prev) => prev.filter((item) => item.id !== confirmDelete.id));
      notify("Project deleted.", "success");
    } catch (err) {
      notify(err?.message || "Failed to delete project.", "error");
    } finally {
      setConfirmDelete(null);
    }
  };

  const handleEdit = (project) => {
    setShowForm(true);
    setFormData(project);
  };

  if (loading) return <FullScreenLoader />;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground">
            Manage your projects and review timelines in one clean dashboard.
          </p>
        </div>

        {can(PERMISSIONS.PROJECT_CREATE) && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors focus-visible focus-visible:ring-2 focus-visible:ring-ring"
          >
            Create Project
          </button>
        )}
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Project Name
              </label>
              <input
                name="name"
                placeholder="Enter project name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Description
              </label>
              <textarea
                name="description"
                placeholder="Enter project description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring min-h-[120px]"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors focus-visible focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formData.id ? "Update Project" : "Create Project"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setFormData({
                    name: "",
                    description: "",
                    start_date: "",
                    end_date: "",
                  });
                }}
                className="bg-secondary text-secondary-foreground px-6 py-2 rounded-md hover:bg-secondary/80 transition-colors focus-visible focus-visible:ring-2 focus-visible:ring-ring"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="bg-muted/50 border border-dashed border-border rounded-lg p-12 text-center">
          <p className="text-muted-foreground text-lg">No projects found.</p>
          <p className="text-muted-foreground mt-2">Create a new project to get started.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => router.push(`/projects/${project.id}`)}
              className="bg-card rounded-lg border border-border p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                    {project.name}
                  </h3>
                  {project.description && (
                    <p className="text-muted-foreground mt-2 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(project.start_date).toLocaleDateString()} - {new Date(project.end_date).toLocaleDateString()}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  {can(PERMISSIONS.PROJECT_UPDATE) && (
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        handleEdit(project);
                      }}
                      className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
                    >
                      Edit
                    </button>
                  )}

                  {can(PERMISSIONS.PROJECT_DELETE) && (
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        handleDelete(project);
                      }}
                      className="text-destructive hover:text-destructive/80 text-sm font-medium transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmationDialog
        open={Boolean(confirmDelete)}
        title="Delete Project"
        description={
          confirmDelete
            ? `Are you sure you want to delete "${confirmDelete.name}"? This action cannot be undone.`
            : ""
        }
        onClose={() => setConfirmDelete(null)}
        onConfirm={confirmDeleteProject}
        confirmLabel="Delete"
      />
    </div>
  );
};

export default ProjectsPage;