import React from "react";
import Button from "@mui/material/Button";
import DownloadIcon from "@mui/icons-material/Download";
import Papa from "papaparse";

interface ExportButtonProps {
  data: any[];
  filename: string;
  label?: string;
}

const ExportButton: React.FC<ExportButtonProps> = ({
  data,
  filename,
  label = "Export CSV",
}) => {
  const handleExport = () => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button
      variant="outlined"
      startIcon={<DownloadIcon />}
      onClick={handleExport}
      size="small"
    >
      {label}
    </Button>
  );
};

export default ExportButton;
