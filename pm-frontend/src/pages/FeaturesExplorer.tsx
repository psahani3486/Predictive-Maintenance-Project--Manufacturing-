import React, { useState } from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import { parseCSVToRows } from "../utils/csv";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

type NumericSummary = {
  feature: string;
  count: number;
  mean: number;
  std: number;
  min: number;
  max: number;
};

const FeaturesExplorer: React.FC = () => {
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [summaries, setSummaries] = useState<NumericSummary[]>([]);
  const [featureToPlot, setFeatureToPlot] = useState<string | null>(null);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const f = e.target.files[0];
    const parsed = await parseCSVToRows(f);
    setRows(parsed);
    computeSummaries(parsed);
  };

  const computeSummaries = (data: Record<string, any>[]) => {
    if (!data || data.length === 0) {
      setSummaries([]);
      return;
    }
    const keys = Object.keys(data[0]);
    const numericKeys = keys.filter((k) => data.some((r) => typeof r[k] === "number"));
    const out: NumericSummary[] = numericKeys.map((k) => {
      const vals = data.map((r) => Number(r[k])).filter((v) => !Number.isNaN(v));
      const count = vals.length;
      const mean = count ? vals.reduce((a, b) => a + b, 0) / count : 0;
      const std = count ? Math.sqrt(vals.reduce((a, b) => a + (b - mean) ** 2, 0) / count) : 0;
      const min = count ? Math.min(...vals) : 0;
      const max = count ? Math.max(...vals) : 0;
      return { feature: k, count, mean, std, min, max };
    });
    setSummaries(out);
    setFeatureToPlot(out.length > 0 ? out[0].feature : null);
  };

  const histogramData = () => {
    if (!featureToPlot || rows.length === 0) return [];
    const vals = rows.map((r) => Number(r[featureToPlot])).filter((v) => !Number.isNaN(v));
    const bins = 20;
    if (vals.length === 0) return [];
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const binSize = (max - min) / bins || 1;
    const counts = new Array(bins).fill(0);
    vals.forEach((v) => {
      let idx = Math.floor((v - min) / binSize);
      if (idx < 0) idx = 0;
      if (idx >= bins) idx = bins - 1;
      counts[idx] += 1;
    });
    return counts.map((c, i) => ({ bin: `${(min + i * binSize).toFixed(2)}`, count: c }));
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Features Explorer
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1">Upload CSV with features (sensor_*)</Typography>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center", mt: 1 }}>
          <input id="upload" type="file" accept=".csv" onChange={onUpload} style={{ display: "inline-block" }} />
          <Button
            variant="outlined"
            onClick={() => {
              setRows([]);
              setSummaries([]);
              setFeatureToPlot(null);
            }}
          >
            Clear
          </Button>
        </Box>
        <Typography variant="caption" color="text.secondary" display="block" mt={1}>
          The explorer computes simple numeric summaries and histograms for each numeric feature.
        </Typography>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6">Numeric Feature Summaries</Typography>
        <Divider sx={{ my: 1 }} />
        {summaries.length === 0 ? (
          <Typography color="text.secondary">No numeric features found. Upload a CSV with numeric sensor columns.</Typography>
        ) : (
          <>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
              {summaries.map((s) => (
                <Paper key={s.feature} sx={{ p: 1.5, minWidth: 180 }}>
                  <Typography variant="subtitle2">{s.feature}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    mean: {s.mean.toFixed(3)} • std: {s.std.toFixed(3)}
                  </Typography>
                  <Typography variant="body2">
                    min: {s.min.toFixed(3)}, max: {s.max.toFixed(3)}
                  </Typography>
                  <Box mt={1}>
                    <Button size="small" onClick={() => setFeatureToPlot(s.feature)}>
                      Plot
                    </Button>
                  </Box>
                </Paper>
              ))}
            </Box>

            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Histogram: {featureToPlot}
            </Typography>
            <Box sx={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={histogramData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#112022" />
                  <XAxis dataKey="bin" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#90caf9" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default FeaturesExplorer;