import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import LogoutIcon from "@mui/icons-material/Logout";
import GitHubIcon from "@mui/icons-material/GitHub";
import { useAuthStore } from "../stores/authStore";
const NavBar = () => {
const { user, logout } = useAuthStore();

return (
<AppBar position="static" elevation={2}>
<Toolbar>
<Typography variant="h6" sx={{ flexGrow: 1 }}>
Predictive Maintenance — Predictor
</Typography>
<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
{user && (
<Typography variant="body1" sx={{ mr: 2 }}>
Welcome, {user.username}
</Typography>
)}
<Button
color="inherit"
startIcon={<LogoutIcon />}
onClick={logout}
>
Logout
</Button>
<IconButton color="inherit" href="https://github.com/your/repo" target="_blank">
<GitHubIcon />
</IconButton>
</Box>
</Toolbar>
</AppBar>
);
};

export default NavBar;