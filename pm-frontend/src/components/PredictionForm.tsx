import React from "react";
import { useForm, Controller } from "react-hook-form";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { predictOne } from "../api/predict";
import { usePredictionStore } from "../stores/predictionStore";
import { useAlertStore } from "../stores/alertStore";
import type { PredictInput, PredictResponse, PredictionRecord } from "../types";
type Props = { onResult?: (r: PredictResponse | null) => void };

const defaultFields = {
sensor_1: 50,
sensor_2: 80,
sensor_3: 100,
};

const PredictionForm: React.FC<Props> = ({ onResult }) => {
const { control, handleSubmit } = useForm({ defaultValues: defaultFields });
const addPrediction = usePredictionStore((state) => state.addPrediction);
const addAlert = useAlertStore((state) => state.addAlert);

const onSubmit = async (data: any) => {
const payload: PredictInput = { features: data };
try {
const resp = await predictOne(payload);
onResult?.(resp);

// Add to history
const record: PredictionRecord = {
id: Date.now().toString(),
input: payload,
result: resp,
timestamp: new Date().toLocaleString(),
};
addPrediction(record);

// Show alert for high probability
if (resp.failure_probability && resp.failure_probability > 0.7) {
addAlert({
type: "warning",
message: `High failure probability detected: ${(resp.failure_probability * 100).toFixed(1)}%`,
});
} else {
addAlert({
type: "success",
message: "Prediction completed successfully.",
});
}
} catch (err) {
console.error(err);
const errorResp = { error: "Request failed" } as PredictResponse;
onResult?.(errorResp);
addAlert({
type: "error",
message: "Prediction failed. Please try again.",
});
}
};

return (
<form onSubmit={handleSubmit(onSubmit)}>
<Box sx={{ display: "grid", gap: 1 }}>
<Controller name="sensor_1" control={control} render={({ field }) => <TextField label="sensor_1" {...field} />} />
<Controller name="sensor_2" control={control} render={({ field }) => <TextField label="sensor_2" {...field} />} />
<Controller name="sensor_3" control={control} render={({ field }) => <TextField label="sensor_3" {...field} />} />
<Button type="submit" variant="contained">Predict</Button>
</Box>
</form>
);
};

export default PredictionForm;