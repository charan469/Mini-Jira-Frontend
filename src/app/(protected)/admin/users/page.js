"use client";

import { useEffect, useState } from "react";
import AssignRoleModal from "@/components/AssignRoleModal";
import { apiRequest } from "@/lib/api";
import CreateUserModal from "@/components/CreateUserModal";
import { useNotification } from "@/components/NotificationProvider";

export default function UsersPage() {
  const { notify } = useNotification();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [usersRes, rolesRes] = await Promise.all([
        apiRequest("/users"),
        apiRequest("/roles"),
      ]);

      setUsers(usersRes || []);
      setRoles(rolesRes || []);
    } catch (err) {
      notify(err?.message || "Failed to load users and roles.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveRole = async (userId, roleId) => {
    try {
      await apiRequest(`/users/${userId}/roles/${roleId}`, {
        method: "DELETE",
      });

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, roles: u.roles.filter((r) => r.id !== roleId) }
            : u
        )
      );
      notify("Role removed successfully.", "success");
    } catch (err) {
      notify(err?.message || "Failed to remove role.", "error");
    }
  };

  const handleAssignRole = async (userId, roleId) => {
    try {
      await apiRequest(`/users/${userId}/roles/${roleId}`, {
        method: "POST",
      });

      const role = roles.find((r) => r.id === roleId);

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, roles: [...u.roles, role] }
            : u
        )
      );
      notify("Role assigned successfully.", "success");
    } catch (err) {
      notify(err?.message || "Failed to assign role.", "error");
    }
  };

  const handleCreateUser = async (form, selectedRoles) => {
    try {
      const newUser = await apiRequest("/users/", {
        method: "POST",
        body: JSON.stringify(form),
      });

      for (let roleId of selectedRoles) {
        await apiRequest(`/users/${newUser.id}/roles/${roleId}`, {
          method: "POST",
        });
      }

      await fetchData();
      setOpenCreateModal(false);
      notify("User created successfully.", "success");
    } catch (err) {
      notify(err?.message || "Failed to create user.", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Users</h1>
          <p className="text-muted-foreground">Manage user accounts and roles</p>
        </div>

        <button
          onClick={() => setOpenCreateModal(true)}
          className="bg-black text-primary-foreground px-6 py-2 rounded-md hover:bg-black/90 transition-colors focus-visible:ring-2 focus-visible:ring-ring flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create User
        </button>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Roles
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-muted/20">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    {user.full_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.is_active
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {user.roles?.map((role) => (
                        <span
                          key={role.id}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-secondary text-secondary-foreground"
                        >
                          {role.name}
                          <button
                            onClick={() => handleRemoveRole(user.id, role.id)}
                            className="hover:text-destructive transition-colors"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setOpenModal(true);
                      }}
                      className="text-primary hover:text-primary/80 transition-colors"
                    >
                      Assign Role
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AssignRoleModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        roles={roles}
        user={selectedUser}
        onAssign={handleAssignRole}
      />

      <CreateUserModal
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        roles={roles}
        onCreate={handleCreateUser}
      />
    </div>
  );
}