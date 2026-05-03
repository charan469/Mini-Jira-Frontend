"use client";

import { useRouter, usePathname } from "next/navigation";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Box
} from "@mui/material";
import { PERMISSIONS } from "@/lib/constants";
import { useCan } from "@/lib/helpers";

const drawerWidth = 240;
const navbarHeight = 64; // adjust if your navbar height differs

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const can = useCan();

  const menuItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Projects", path: "/projects" },
    ...(can(PERMISSIONS.USER_MANAGE)
      ? [{ label: "Admin", path: "/admin" }]
      : []),
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: "border-box",
          top: `${navbarHeight}px`,
          height: `calc(100vh - ${navbarHeight}px)`
        },
      }}
    >
      <Box sx={{ overflow: "auto" }}>
        <List>
          {menuItems.map((item) => (
            <ListItemButton
              key={item.path}
              selected={pathname.startsWith(item.path)}
              onClick={() => router.push(item.path)}
            >
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Box>
    </Drawer>
  );
}