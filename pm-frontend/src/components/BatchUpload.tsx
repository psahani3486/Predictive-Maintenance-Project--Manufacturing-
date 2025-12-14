import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Papa from "papaparse";
import { predictOne } from "../api/predict";
const BatchUpload: React.FC<{ onResults?: (r: any[]) => void }> = ({ onResults }) => {
const onDrop = useCallback((files: File[]) => {
const f = files[0];
Papa.parse(f, {
header: true,
dynamicTyping: true,
complete: async (results: any) => {
const rows = results.data;
const out = [];
for (const r of rows) {
try {
const resp = await predictOne({ features: r });
out.push({ input: r, resp });
} catch (e) {
out.push({ input: r, resp: { error: "request failed" } });
}
}
onResults?.(out);
},
});
}, []);

const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'text/csv': ['.csv'] } });

return (
<Box sx={{ p: 1 }}>
<div {...getRootProps()} style={{ border: "1px dashed #2b3948", padding: 12, borderRadius: 8 }}>
<input {...getInputProps()} />
<Typography>{isDragActive ? "Drop CSV here..." : "Drag & drop CSV or click to upload"}</Typography>
<Typography variant="caption">CSV must have columns matching your model feature names (sensor_1, ...)</Typography>
</div>
<Button sx={{ mt: 1 }} variant="outlined">Upload</Button>
</Box>
);
};

export default BatchUpload;