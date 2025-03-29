import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  Radio,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
} from "@mui/material";
import Tachogram from "./Tachogram";

const CSVReader = () => {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [error, setError] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [selectedColumnNo, setSelectedColumnNo] = useState(null);
  const [colWidth, setColWidth] = useState(120);
  const [fullData, setFullData] = useState(null);
  const [filename, setFilename] = useState(null);
  const [separator, setSeparator] = useState("\t"); // Default separator (whitespace)
  const [customFilename, setCustomFilename] = useState("_cut"); // Custom filename input
  const rowsToShow = 6;

  // File input ref to trigger the hidden input
  const fileInputRef = React.useRef(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setError(null);
    setFilename(file.name);
    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const content = e.target.result;
          const lines = content
            .split(/\r?\n/)
            .filter((line) => line.trim().length > 0);

          if (lines.length === 0) {
            throw new Error("File is empty");
          }
          console.log("e.target.result", Object.getOwnPropertyNames(e.target));
          // parsing all lines with the selected separator
          const parsedLines = lines.map((line) =>
            line
              .split(new RegExp(separator))
              .filter((part) => part.trim().length > 0),
          );

          const parsedHeaders = parsedLines[0];
          const parsedData = parsedLines.slice(1);
          setFullData(parsedLines);
          setHeaders(parsedHeaders);

          // creating grid data
          const gridData = parsedData.slice(0, rowsToShow).map((row, index) => {
            const rowData = { id: index };

            parsedHeaders.forEach((header, colIndex) => {
              rowData[header] = colIndex < row.length ? row[colIndex] : "";
            });

            return rowData;
          });

          setData(gridData);
        } catch (err) {
          setError(`Failed to process file: ${err.message}`);
          console.error("Error processing file:", err);
        }
      };

      reader.onerror = () => {
        setError("Error reading file");
      };

      reader.readAsText(file);
    }
  };

  useEffect(() => {
    const maxHeader =
      headers.reduce((acc, elem) => Math.max(elem.length, acc), 0) * 15;
    setColWidth(maxHeader);
  }, [headers]);

  useEffect(() => {
    const selectedColumnNumber = headers.indexOf(selectedColumn);
    setSelectedColumnNo(selectedColumnNumber);
  }, [headers, selectedColumn]);
  // Define columns for DataGrid
  const columns = headers.map((header) => ({
    field: header,
    headerName: header.charAt(0).toUpperCase() + header.slice(1),
    width: Math.max(colWidth, header.length * 12),
    headerAlign: "center",
    align: "center",
    renderHeader: (params) => (
      <div style={{ display: "flex", alignItems: "center" }}>
        <Radio
          checked={selectedColumn === header}
          size="small"
          onChange={(e) => setSelectedColumn(header)}
        />
        {params.colDef.headerName}
      </div>
    ),
  }));
  return (
    <div>
      <Typography variant="h4">Data File Reader</Typography>
      <Typography variant="h6" gutterBottom>
        Your data are analyzed in your browser, they never leave your computer
      </Typography>

      {/* Input controls in a single row */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "20px",
          flexWrap: "wrap",
          marginBottom: 2,
        }}
      >
        <Box>
          <input
            type="file"
            accept=".txt,.csv,.tsv,.dat,.rea"
            onChange={handleFileUpload}
            style={{ display: "none" }}
            id="file-input"
            ref={fileInputRef}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => fileInputRef.current.click()}
          >
            Select a file
          </Button>
        </Box>

        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel id="separator-label">Separator</InputLabel>
          <Select
            labelId="separator-label"
            id="separator"
            value={separator}
            label="Separator"
            onChange={(e) => setSeparator(e.target.value)}
          >
            <MenuItem value="\\t">Tab</MenuItem>
            <MenuItem value="\\s+">Whitespace</MenuItem>
            <MenuItem value=",">Comma (,)</MenuItem>
            <MenuItem value=";">Semicolon (;)</MenuItem>
          </Select>
        </FormControl>

        <TextField
          id="customFilename"
          label="Custom filename"
          variant="outlined"
          size="small"
          value={customFilename}
          onChange={(e) => setCustomFilename(e.target.value)}
          placeholder="Enter a text"
        />
      </Box>

      {/* error display */}
      {error && <Typography color="error">{error}</Typography>}

      {/* DataGrid display */}
      {data.length > 0 && (
        <div>
          <div style={{ height: 420, width: "100%" }}>
            <DataGrid
              rows={data}
              columns={columns}
              pageSizeOptions={[5, 10, 25]}
              initialState={{
                pagination: null,
              }}
              disableColumnMenu
            />
          </div>
          <Tachogram
            selectedColumn={selectedColumnNo}
            data={fullData}
            filename={customFilename || filename} // Use custom filename if provided
          />
        </div>
      )}

      {/* debug info */}
      {headers.length > 0 && (
        <Box sx={{ marginTop: 2, fontSize: "0.8rem", color: "#666" }}>
          <Typography variant="body2">
            Detected columns: {headers.join(", ")}
          </Typography>
        </Box>
      )}
    </div>
  );
};

export default CSVReader;
