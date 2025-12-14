import React from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ElectricalServicesIcon from "@mui/icons-material/ElectricalServices";
import DashboardIcon from "@mui/icons-material/Dashboard";
import StorageIcon from "@mui/icons-material/Storage";
import SettingsIcon from "@mui/icons-material/Settings";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const drawerWidth = 260;

const Sidebar: React.FC = () => {
  const loc = useLocation();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          background: "transparent",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" noWrap>
          PM Predictor
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Predictive Maintenance
        </Typography>
      </Box>
      <Divider />
      <List>
        <ListItemButton component={RouterLink} to="/" selected={loc.pathname === "/"}>
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItemButton>

        <ListItemButton component={RouterLink} to="/model" selected={loc.pathname === "/model"}>
          <ListItemIcon>
            <StorageIcon />
          </ListItemIcon>
          <ListItemText primary="Model Status" />
        </ListItemButton>

        <ListItemButton component={RouterLink} to="/features" selected={loc.pathname === "/features"}>
          <ListItemIcon>
            <ElectricalServicesIcon />
          </ListItemIcon>
          <ListItemText primary="Features Explorer" />
        </ListItemButton>

        <ListItemButton component={RouterLink} to="/settings" selected={loc.pathname === "/settings"}>
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItemButton>
      </List>
    </Drawer>
  );
};

export default Sidebar;