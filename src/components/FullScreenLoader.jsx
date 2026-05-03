'use client'

import { CircularProgress, Box } from "@mui/material";

export default function FullScreenLoader() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f9fafb",
      }}
    >
      <CircularProgress />
    </Box>
  );
}