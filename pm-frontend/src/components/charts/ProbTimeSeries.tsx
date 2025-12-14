import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

const data = [
  { ts: "T-5", prob: 0.02 },
  { ts: "T-4", prob: 0.04 },
  { ts: "T-3", prob: 0.15 },
  { ts: "T-2", prob: 0.3 },
  { ts: "T-1", prob: 0.55 },
];

const ProbTimeSeries: React.FC = () => {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#10202b" />
        <XAxis dataKey="ts" stroke="#a9bac8" />
        <YAxis
          domain={[0, 1]}
          stroke="#a9bac8"
          tickFormatter={(v) => `${(Number(v) * 100).toFixed(0)}%`}
        />
        <Tooltip formatter={(v: number) => `${(v * 100).toFixed(1)}%`} />
        <Line type="monotone" dataKey="prob" stroke="#90caf9" strokeWidth={3} dot />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ProbTimeSeries;