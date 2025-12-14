import { createTheme } from "@mui/material/styles";
import { getSetting } from "../utils/storage";

const isDark = getSetting("darkTheme", true);

const theme = createTheme({
palette: {
mode: isDark ? "dark" : "light",
primary: {
main: "#90caf9",
},
secondary: {
main: "#f48fb1",
},
...(isDark && {
background: {
default: "#0f1720",
paper: "#0b1220",
},
text: {
primary: "#e6eef6",
secondary: "#a9bac8",
},
}),
},
components: {
MuiAppBar: {
styleOverrides: {
root: {
background: isDark ? "linear-gradient(90deg, rgba(14,24,35,1) 0%, rgba(5,10,17,1) 100%)" : undefined,
},
},
},
},
});

export default theme;
