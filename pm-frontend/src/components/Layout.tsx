import React from "react";
import Box from "@mui/material/Box";
import NavBar from "./NavBar";
import Sidebar from "./Sidebar";
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
return (
<Box sx={{ minHeight: "100vh", display: "flex" }}>
<Sidebar />
<Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
<NavBar />
<Box component="main" sx={{ p: 3, flexGrow: 1 }}>
{children}
</Box>
</Box>
</Box>
);
};

export default Layout;