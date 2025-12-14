import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  ReferenceLine,
} from "recharts";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

type PRPoint = { recall: number; precision: number; threshold?: number };

type Props = {
  data?: PRPoint[];
  auc?: number | null;
  height?: number;
  showThresholds?: boolean;
};

const PRCurve: React.FC<Props> = ({ data, auc = null, height = 320, showThresholds = false }) => {
  const fallback: PRPoint[] = [
    { recall: 0, precision: 1 },
    { recall: 0.2, precision: 0.8 },
    { recall: 0.4, precision: 0.6 },
    { recall: 0.6, precision: 0.45 },
    { recall: 0.8, precision: 0.3 },
    { recall: 1, precision: 0.2 },
  ];

  const plotData = (data && data.length > 0 ? data : fallback).map((d) => ({
    recall: Number(d.recall.toFixed(3)),
    precision: Number(d.precision.toFixed(3)),
    threshold: d.threshold ?? undefined,
  }));

  return (
    <Paper sx={{ p: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="h6">Precision-Recall Curve</Typography>
        <Typography variant="body2" color="text.secondary">
          AUC: {auc !== null ? auc.toFixed(3) : "—"}
        </Typography>
      </Box>

      <Box style={{ width: "100%", height }}>
        <ResponsiveContainer>
          <LineChart data={plotData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#112022" />
            <XAxis
              dataKey="recall"
              type="number"
              domain={[0, 1]}
              tickFormatter={(v) => `${Math.round((v as number) * 100)}%`}
              label={{ value: "Recall", position: "insideBottomRight", offset: -5 }}
              stroke="#9fb2c5"
            />
            <YAxis
              domain={[0, 1]}
              tickFormatter={(v) => `${Math.round((v as number) * 100)}%`}
              label={{ value: "Precision", angle: -90, position: "insideLeft" }}
              stroke="#9fb2c5"
            />
            <Tooltip
              formatter={(value: any, name: any) => {
                if (name === "precision" || name === "recall") {
                  return [`${(Number(value) * 100).toFixed(2)}%`, name.charAt(0).toUpperCase() + name.slice(1)];
                }
                return [value, name];
              }}
            />
            <Area dataKey="precision" fill="#0ea5a5" stroke="#0ea5a5" fillOpacity={0.06} />
            <Line type="monotone" dataKey="precision" stroke="#90caf9" strokeWidth={2} dot />
            {showThresholds &&
              plotData
                .filter((p) => p.threshold !== undefined)
                .slice(-3)
                .map((p, idx) => (
                  <ReferenceLine
                    key={idx}
                    x={p.recall}
                    strokeDasharray="3 3"
                    stroke="#ffa726"
                    label={{ position: "top", value: `t=${(p.threshold ?? 0).toFixed(2)}` }}
                  />
                ))}
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default PRCurve;