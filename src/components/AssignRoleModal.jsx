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
        >
          {availableRoles.map((role) => (
            <MenuItem key={role.id} value={role.id}>
              {role.name}
            </MenuItem>
          ))}
        </Select>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
        >
          Assign
        </Button>
      </DialogActions>
    </Dialog>
  );
}