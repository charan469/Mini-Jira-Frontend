"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Checkbox,
  FormControlLabel,
  Typography,
  MenuItem,
} from "@mui/material";
import { useState } from "react";

export default function CreateUserModal({
  open,
  onClose,
  roles,
  onCreate,
}) {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    auth_provider: "",
    provider_user_id: "",
  });

  const [selectedRoles, setSelectedRoles] = useState([]);

  const handleSubmit = () => {
    if (!form.auth_provider || !form.provider_user_id) return;

    onCreate(form, selectedRoles);

    setForm({
      full_name: "",
      email: "",
      auth_provider: "",
      provider_user_id: "",
    });
    setSelectedRoles([]);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Create User</DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Full Name"
            value={form.full_name}
            onChange={(e) =>
              setForm({ ...form, full_name: e.target.value })
            }
            fullWidth
          />

          <TextField
            label="Email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            fullWidth
          />

          <TextField
            select
            label="Auth Provider"
            value={form.auth_provider}
            onChange={(e) =>
              setForm({ ...form, auth_provider: e.target.value })
            }
            fullWidth
          >
            <MenuItem value="local">Local</MenuItem>
            <MenuItem value="google">Google</MenuItem>
            <MenuItem value="azure">Azure</MenuItem>
            <MenuItem value="okta">Okta</MenuItem>
          </TextField>

          <TextField
            label="Provider User ID"
            helperText="For Google/Azure/Okta use email or provider ID"
            value={form.provider_user_id}
            onChange={(e) =>
              setForm({
                ...form,
                provider_user_id: e.target.value,
              })
            }
            fullWidth
          />

          <Typography variant="subtitle2">
            Assign Roles
          </Typography>

          {roles.map((role) => (
            <FormControlLabel
              key={role.id}
              control={
                <Checkbox
                  checked={selectedRoles.includes(role.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedRoles((prev) => [
                        ...prev,
                        role.id,
                      ]);
                    } else {
                      setSelectedRoles((prev) =>
                        prev.filter((id) => id !== role.id)
                      );
                    }
                  }}
                />
              }
              label={role.name}
            />
          ))}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}