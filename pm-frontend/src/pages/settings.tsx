import React, { useEffect, useState } from "react";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Slider from "@mui/material/Slider";
import { getSetting, setSetting } from "../utils/storage";

const Settings: React.FC = () => {
  const [apiBase, setApiBase] = useState<string>("");
  const [enableDarkTheme, setEnableDarkTheme] = useState<boolean>(true);
  const [alertThreshold, setAlertThreshold] = useState<number>(70);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  useEffect(() => {
    setApiBase(getSetting("apiBase", (import.meta.env.VITE_API_BASE_URL as string) ?? "http://localhost:5000"));
    setEnableDarkTheme(getSetting("darkTheme", true));
    setAlertThreshold(getSetting("alertThreshold", 70));
    setAutoRefresh(getSetting("autoRefresh", true));
  }, []);

  const save = () => {
    setSetting("apiBase", apiBase);
    setSetting("darkTheme", enableDarkTheme);
    setSetting("alertThreshold", alertThreshold);
    setSetting("autoRefresh", autoRefresh);
    // quick apply
    window.location.reload();
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <Paper sx={{ p: 3, mb: 2 }}>
        <Typography variant="h6">API Configuration</Typography>
        <Box sx={{ mt: 1, display: "flex", gap: 2, alignItems: "center" }}>
          <TextField fullWidth label="Backend API Base URL" value={apiBase} onChange={(e) => setApiBase(e.target.value)} />
          <Button variant="contained" onClick={save}>
            Save
          </Button>
        </Box>
        <Typography variant="caption" color="text.secondary" display="block" mt={1}>
          This stores the value locally. For production set VITE_API_BASE_URL in your build/deployment pipeline.
        </Typography>
      </Paper>

      <Paper sx={{ p: 3, mb: 2 }}>
        <Typography variant="h6">Appearance</Typography>
        <FormControlLabel
          control={<Switch checked={enableDarkTheme} onChange={(e) => setEnableDarkTheme(e.target.checked)} />}
          label="Enable dark theme"
        />
        <Box mt={2}>
          <Button variant="outlined" onClick={save}>
            Save Appearance
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 2 }}>
        <Typography variant="h6">Alerts & Notifications</Typography>
        <Box sx={{ mt: 2 }}>
          <Typography gutterBottom>Alert Threshold (%)</Typography>
          <Slider
            value={alertThreshold}
            onChange={(_, value) => setAlertThreshold(value as number)}
            valueLabelDisplay="auto"
            min={0}
            max={100}
            marks={[
              { value: 0, label: "0%" },
              { value: 50, label: "50%" },
              { value: 100, label: "100%" },
            ]}
          />
          <Typography variant="body2" color="text.secondary">
            Show alerts when failure probability exceeds {alertThreshold}%
          </Typography>
        </Box>
        <Box mt={2}>
          <Button variant="outlined" onClick={save}>
            Save Alerts
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6">Dashboard</Typography>
        <FormControlLabel
          control={<Switch checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />}
          label="Enable auto-refresh for real-time monitoring"
        />
        <Box mt={2}>
          <Button variant="outlined" onClick={save}>
            Save Dashboard
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Settings;