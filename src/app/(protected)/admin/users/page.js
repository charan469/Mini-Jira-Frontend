"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Button,
  Stack
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import AssignRoleModal from "@/components/AssignRoleModal";
import { apiRequest } from "@/lib/api";
import CreateUserModal from "@/components/CreateUserModal";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openModal, setOpenModal] = useState(false);

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

      console.log("users--------------------->", usersRes);
      console.log("rolesRes--------------------->", rolesRes);

      setUsers(usersRes);
      setRoles(rolesRes);
    } catch (err) {
      console.error("Failed to load users/roles", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveRole = async (userId, roleId) => {
    try {
      await apiRequest(`/users/${userId}/roles/${roleId}`, {
        method: "DELETE"
      });

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, roles: u.roles.filter((r) => r.id !== roleId) }
            : u
        )
      );
    } catch (err) {
      console.error("Failed to remove role", err);
    }
  };

  const handleAssignRole = async (userId, roleId) => {
    try {
      await apiRequest(`/users/${userId}/roles/${roleId}`, {
        method: "POST"
      });

      const role = roles.find((r) => r.id === roleId);

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, roles: [...u.roles, role] }
            : u
        )
      );
    } catch (err) {
      console.error("Failed to assign role", err);
    }
  };

  const [openCreateModal, setOpenCreateModal] = useState(false);

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
    } catch (err) {
      console.error("Failed to create user", err);
    }
  };

  if (loading) {
    return (
      <Box p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h5">
          Users
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenCreateModal(true)}
          style={{ backgroundColor: "#000000" }}
        >
          Create User
        </Button>
      </Box>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Active</TableCell>
            <TableCell>Roles</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.full_name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                {user.is_active ? "Yes" : "No"}
              </TableCell>

              <TableCell>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {user.roles?.map((role) => (
                    <Chip
                      key={role.id}
                      label={role.name}
                      onDelete={() =>
                        handleRemoveRole(user.id, role.id)
                      }
                      deleteIcon={<DeleteIcon />}
                    />
                  ))}
                </Stack>
              </TableCell>

              <TableCell align="right">
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setSelectedUser(user);
                    setOpenModal(true);
                  }}
                  style={{ borderColor: "#000000", color: "#000000" }}
                >
                  Assign Role
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

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
    </Box>
  );
}