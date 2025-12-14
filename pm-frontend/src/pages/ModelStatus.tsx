import React, { useEffect, useState } from "react";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { api } from "../api/client";

type ModelInfo = {
  name?: string;
  version?: string;
  artifacts?: string[];
  trained_at?: string;
  feature_columns?: string[];
};

const ModelStatus: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<ModelInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await api.get("/model/info");
      setInfo(resp.data as ModelInfo);
    } catch (err: any) {
      setError("Model info endpoint not available. Backend may not expose /model/info");
    } finally {
      setLoading(false);
    }
  };

  const quickHealthCheck = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await api.get("/");
      if (resp.status === 200) {
        setInfo((prev) => ({ ...prev, name: prev?.name ?? "Predictive Maintenance API", version: prev?.version ?? "unknown" }));
        setError(null);
      }
    } catch (err: any) {
      setError("Backend unreachable. Ensure server is running and CORS allows frontend origin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Model Status
      </Typography>

      <Paper sx={{ p: 3, mb: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h6">Status</Typography>
            <Typography variant="body2" color="text.secondary">
              Check whether backend has loaded model artifacts and (optionally) retrieve metadata.
            </Typography>
          </Box>

          <Box>
            <Button variant="contained" onClick={quickHealthCheck} startIcon={loading ? <CircularProgress size={16} /> : null}>
              Quick Health Check
            </Button>
            <Button sx={{ ml: 1 }} variant="outlined" onClick={fetchInfo}>
              Refresh Info
            </Button>
          </Box>
        </Box>

        <Box mt={2}>
          {loading && <Typography>Loading...</Typography>}
          {error && (
            <Typography color="error" mt={1}>
              {error}
            </Typography>
          )}

          {!loading && !error && info && (
            <Box mt={1}>
              <Typography>Model name: {info.name ?? "unknown"}</Typography>
              <Typography>Model version: {info.version ?? "unknown"}</Typography>
              <Typography>Trained at: {info.trained_at ?? "unknown"}</Typography>
              <Typography>Artifacts:</Typography>
              <ul>
                {(info.artifacts ?? []).map((a) => (
                  <li key={a}>
                    <Typography component="span">{a}</Typography>
                  </li>
                ))}
              </ul>

              <Typography>Number of features: {info.feature_columns?.length ?? "unknown"}</Typography>
            </Box>
          )}

          {!loading && !error && !info && (
            <Typography color="text.secondary" mt={1}>
              Model info not available. Consider adding a GET /model/info endpoint in your Flask app that returns metadata:
              name, version, artifacts list, trained_at, and feature_columns (JSON).
            </Typography>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default ModelStatus;