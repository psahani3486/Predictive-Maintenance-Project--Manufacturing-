import React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import LinearProgress from "@mui/material/LinearProgress";
import ExportButton from "./ExportButton";
import type { BatchResult } from "../types";

const BatchResultsPanel: React.FC<{ results: BatchResult[] }> = ({ results }) => {
  if (!results || results.length === 0) {
    return <Typography>No batch predictions yet</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6">
          Batch Prediction Results
        </Typography>
        <ExportButton data={results} filename="batch_results.csv" />
      </Box>
      {results.map((item, index) => {
        const prob = item.resp.failure_probability ?? 0;
        const error = item.resp.error;
        return (
          <Paper key={index} sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1">Input #{index + 1}</Typography>
            {error ? (
              <Typography color="error">Error: {error}</Typography>
            ) : (
              <>
                <Typography>
                  Failure probability: {(prob * 100).toFixed(1)}%
                </Typography>
                <LinearProgress variant="determinate" value={prob * 100} />
              </>
            )}
          </Paper>
        );
      })}
    </Box>
  );
};

export default BatchResultsPanel;
