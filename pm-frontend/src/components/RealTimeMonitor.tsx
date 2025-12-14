import React, { useState, useEffect } from "react";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Button from "@mui/material/Button";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import { predictOne } from "../api/predict";
import { usePredictionStore } from "../stores/predictionStore";
import { useAlertStore } from "../stores/alertStore";
import { getSetting } from "../utils/storage";
import type { PredictInput, PredictionRecord } from "../types";

const RealTimeMonitor: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentData, setCurrentData] = useState<PredictInput>({ features: { sensor_1: 50, sensor_2: 80, sensor_3: 100 } });
  const [latestProb, setLatestProb] = useState<number | null>(null);
  const addPrediction = usePredictionStore((state) => state.addPrediction);
  const addAlert = useAlertStore((state) => state.addAlert);

  const generateRandomData = () => {
    return {
      sensor_1: Math.floor(Math.random() * 100) + 20,
      sensor_2: Math.floor(Math.random() * 100) + 30,
      sensor_3: Math.floor(Math.random() * 100) + 40,
    };
  };

  const predict = async (data: PredictInput) => {
    try {
      const resp = await predictOne(data);
      setLatestProb(resp.failure_probability || 0);

      // Add to history
      const record: PredictionRecord = {
        id: Date.now().toString(),
        input: data,
        result: resp,
        timestamp: new Date().toLocaleString(),
      };
      addPrediction(record);

      // Check alert threshold
      const threshold = getSetting("alertThreshold", 70) / 100;
      if (resp.failure_probability && resp.failure_probability > threshold) {
        addAlert({
          type: "warning",
          message: `Real-time alert: High failure probability ${(resp.failure_probability * 100).toFixed(1)}%`,
        });
      }
    } catch (err) {
      console.error(err);
      addAlert({
        type: "error",
        message: "Real-time prediction failed.",
      });
    }
  };

  useEffect(() => {
    let interval: any;
    if (isRunning) {
      interval = setInterval(() => {
        const newData = generateRandomData();
        setCurrentData({ features: newData });
        predict({ features: newData });
      }, 5000); // Every 5 seconds
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const toggleMonitoring = () => {
    const autoRefresh = getSetting("autoRefresh", true);
    if (!autoRefresh) {
      addAlert({
        type: "info",
        message: "Auto-refresh is disabled in settings.",
      });
      return;
    }
    setIsRunning(!isRunning);
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6">Real-Time Monitoring</Typography>
        <Button
          variant="outlined"
          startIcon={isRunning ? <StopIcon /> : <PlayArrowIcon />}
          onClick={toggleMonitoring}
          color={isRunning ? "error" : "primary"}
        >
          {isRunning ? "Stop" : "Start"}
        </Button>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Sensor Values: {JSON.stringify(currentData.features)}
        </Typography>
      </Box>

      {latestProb !== null && (
        <Box>
          <Typography>
            Current Failure Probability: {(latestProb * 100).toFixed(1)}%
          </Typography>
          <LinearProgress variant="determinate" value={latestProb * 100} />
        </Box>
      )}

      {!isRunning && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Click Start to begin real-time monitoring.
        </Typography>
      )}
    </Paper>
  );
};

export default RealTimeMonitor;
