"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Select,
  MenuItem
} from "@mui/material";
import { useState, useEffect } from "react";

export default function AssignRoleModal({
  open,
  onClose,
  roles,
  user,
  onAssign
}) {
  const [selectedRole, setSelectedRole] = useState("");

  useEffect(() => {
    if (!open) {
      setSelectedRole("");
    }
  }, [open]);

  if (!user) return null;

  const availableRoles = roles.filter(
    (role) =>
      !user.roles?.some((r) => r.id === role.id)
  );

  const handleSubmit = async () => {
    if (!selectedRole) return;
    await onAssign(user.id, selectedRole);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>
        Assign Role to {user.name}
      </DialogTitle>

      <DialogContent>
        <Select
          fullWidth
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          disabled={availableRoles.length === 0}
        >
          {availableRoles.map((role) => (
            <MenuItem key={role.id} value={role.id}>
              {role.name}
            </MenuItem>
          ))}
        </Select>

        {availableRoles.length === 0 && (
          <div className="mt-4 text-sm text-gray-600">
            This user already has every available role.
          </div>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!selectedRole || availableRoles.length === 0}
        >
          Assign
        </Button>
      </DialogActions>
    </Dialog>
  );
}