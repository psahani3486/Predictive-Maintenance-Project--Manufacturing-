import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import PredictionForm from "../components/PredictionForm";
import BatchUpload from "../components/BatchUpload";
import ResultsPanel from "../components/ResultsPanel";
import BatchResultsPanel from "../components/BatchResultsPanel";
import PredictionHistory from "../components/PredictionHistory";
import ProbTimeSeries from "../components/charts/ProbTimeSeries";
import PRCurve from "../components/charts/PRCurve";
import FeatureImportanceChart from "../components/charts/FeatureImportanceChart";
import RealTimeMonitor from "../components/RealTimeMonitor";
import AlertBanner from "../components/AlertBanner";
import type { PredictResponse, BatchResult } from "../types";

const Dashboard = () => {
  const [latest, setLatest] = useState<PredictResponse | null>(null);
  const [batchResults, setBatchResults] = useState<BatchResult[] | null>(null);
  const [backendStatus, setBackendStatus] = useState<string>("Checking...");

  // Real-time polling for backend health
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch("/api/health");
        if (response.ok) {
          const data = await response.json();
          setBackendStatus("Online");
        } else {
          setBackendStatus("Error");
        }
      } catch (error) {
        setBackendStatus("Offline");
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <AlertBanner />
      <Box sx={{ p: 2 }}>
        <Typography variant="h4" gutterBottom>
          Predictive Maintenance Dashboard
        </Typography>
        <Chip
          label={`Backend Status: ${backendStatus}`}
          color={backendStatus === "Online" ? "success" : "error"}
          sx={{ mb: 2 }}
        />
      </Box>
      <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", md: "row" } }}>
        <Box sx={{ flex: { xs: 1, md: "0 0 33%" } }}>
          <Paper sx={{ p: 2 }}>
            <PredictionForm onResult={(r) => setLatest(r)} />
          </Paper>
          <Paper sx={{ p: 2, mt: 2 }}>
            <BatchUpload onResults={(rs) => setBatchResults(rs)} />
          </Paper>
          <Paper sx={{ p: 2, mt: 2 }}>
            <RealTimeMonitor />
          </Paper>
        </Box>

        <Box sx={{ flex: { xs: 1, md: "0 0 67%" } }}>
          <Paper sx={{ p: 2 }}>
            <ResultsPanel result={latest} />
          </Paper>
          {batchResults && (
            <Paper sx={{ p: 2, mt: 2 }}>
              <BatchResultsPanel results={batchResults} />
            </Paper>
          )}
          <Paper sx={{ p: 2, mt: 2 }}>
            <ProbTimeSeries />
          </Paper>
          <Paper sx={{ p: 2, mt: 2 }}>
            <PRCurve />
          </Paper>
          <Paper sx={{ p: 2, mt: 2 }}>
            <FeatureImportanceChart />
          </Paper>
          <Paper sx={{ p: 2, mt: 2 }}>
            <PredictionHistory />
          </Paper>
        </Box>
      </Box>
    </>
  );
};

export default Dashboard;
