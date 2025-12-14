import React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
const ResultsPanel: React.FC<{ result: any }> = ({ result }) => {
if (!result) return <Typography>No prediction yet</Typography>;
if (result.error) return <Typography color="error">Error: {result.error}</Typography>;

const prob = result.failure_probability ?? 0;

return (
<Box>
<Typography variant="h6">Failure probability</Typography>
<Typography variant="h3" sx={{ fontWeight: 600 }}>{(prob * 100).toFixed(1)}%</Typography>
<Box sx={{ mt: 2 }}>
<LinearProgress variant="determinate" value={prob * 100} />
</Box>
<Typography sx={{ mt: 1 }} color="text.secondary">Interpretation: higher = more likely to fail within horizon</Typography>
</Box>
);
};

export default ResultsPanel;