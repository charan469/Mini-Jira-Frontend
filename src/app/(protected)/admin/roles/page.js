"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  const fetchData = async () => {
    const rolesData = await apiRequest("/roles/");
    const permissionsData = await apiRequest("/permissions/");

    setRoles(rolesData);
    setPermissions(permissionsData);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateRole = async (e) => {
    e.preventDefault();

    const role = await apiRequest("/roles/", {
      method: "POST",
      body: JSON.stringify(form),
    });

    for (let permissionId of selectedPermissions) {
      await apiRequest("/role-permissions/", {
        method: "POST",
        body: JSON.stringify({
          role_id: role.id,
          permission_id: permissionId,
        }),
      });
    }

    fetchData();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Roles</h1>

      <form onSubmit={handleCreateRole} className="space-y-4">
        <input
          placeholder="Role Name"
          className="border p-2 rounded w-full"
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        <textarea
          placeholder="Description"
          className="border p-2 rounded w-full"
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
        />

        <div className="grid grid-cols-3 gap-2">
          {permissions.map((p) => (
            <label key={p.id}>
              <input
                type="checkbox"
                value={p.id}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedPermissions((prev) => [
                      ...prev,
                      p.id,
                    ]);
                  } else {
                    setSelectedPermissions((prev) =>
                      prev.filter((id) => id !== p.id)
                    );
                  }
                }}
              />
              {p.name}
            </label>
          ))}
        </div>

        <button className="bg-black text-white px-4 py-2 rounded">
          Create Role
        </button>
      </form>
    </div>
  );
}