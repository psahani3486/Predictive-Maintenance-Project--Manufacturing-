import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import ExportButton from "./ExportButton";
import { usePredictionStore } from "../stores/predictionStore";

const PredictionHistory = () => {
  const history = usePredictionStore((state) => state.history);

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6">Recent Predictions</Typography>
        <ExportButton data={history} filename="prediction_history.csv" />
      </Box>
      {history.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No predictions yet.
        </Typography>
        
      ) : (
        <Box sx={{ overflowX: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Time</TableCell>
                <TableCell>ID</TableCell>
                <TableCell>Failure Probability</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.slice(0, 10).map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.timestamp}</TableCell>
                  <TableCell>{record.input.id || "N/A"}</TableCell>
                  <TableCell>
                    {record.result?.failure_probability !== undefined
                      ? `${(record.result.failure_probability * 100).toFixed(1)}%`
                      : "N/A"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </Paper>
  );
};

export default PredictionHistory;
