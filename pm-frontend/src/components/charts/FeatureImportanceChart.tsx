import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

type FeatureData = { feature: string; importance: number };

type Props = {
  data?: FeatureData[];
  height?: number;
};

const FeatureImportanceChart: React.FC<Props> = ({ data, height = 320 }) => {
  const fallback: FeatureData[] = [
    { feature: "sensor_1", importance: 0.4 },
    { feature: "sensor_2", importance: 0.35 },
    { feature: "sensor_3", importance: 0.25 },
  ];

  const plotData = (data && data.length > 0 ? data : fallback).map((d) => ({
    feature: d.feature,
    importance: Number(d.importance.toFixed(3)),
  }));

  return (
    <Paper sx={{ p: 2 }}>
      <Box mb={1}>
        <Typography variant="h6">Feature Importance</Typography>
      </Box>

      <Box style={{ width: "100%", height }}>
        <ResponsiveContainer>
          <BarChart data={plotData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#112022" />
            <XAxis
              dataKey="feature"
              label={{ value: "Features", position: "insideBottomRight", offset: -5 }}
              stroke="#9fb2c5"
            />
            <YAxis
              domain={[0, 1]}
              tickFormatter={(v) => `${Math.round((v as number) * 100)}%`}
              label={{ value: "Importance", angle: -90, position: "insideLeft" }}
              stroke="#9fb2c5"
            />
            <Tooltip
              formatter={(value: any) => [
                `${(Number(value) * 100).toFixed(2)}%`,
                "Importance",
              ]}
            />
            <Bar dataKey="importance" fill="#0ea5a5" />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default FeatureImportanceChart;
