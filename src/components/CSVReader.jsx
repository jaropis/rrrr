import React, { useState, useEffect, useCallback } from "react";
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
  IconButton,
  Checkbox,
  FormControlLabel,
} from "@mui/material";

const isColumnValid = (selectedColumn, fullData) => {
  let columnIsValid = false;
  // checking the first
  for (let idx = 0; idx < Math.min(100, fullData.length); idx++) {
    if (parseFloat(fullData[idx][selectedColumn])) {
      columnIsValid = true;
    }
  }
  return columnIsValid;
};
const CSVReader = ({
  fullData,
  setFullData,
  setSelectedColumnNo,
  filename,
  setFilename,
  customFilename,
  setCustomFilename,
  diff,
  setDiff,
  scaleDataBy,
  setScaleDataBy,
}) => {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [error, setError] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [colWidth, setColWidth] = useState(120);
  const [separator, setSeparator] = useState("tab");
  const [isTableExpanded, setIsTableExpanded] = useState(true);
  const [currentFile, setCurrentFile] = useState(null);
  const rowsToShow = 6;

  const getSeparatorValue = (sep) => {
    switch (sep) {
      case "tab":
        return "\t";
      case "whitespace":
        return "\\s+";
      case "comma":
        return ",";
      case "semicolon":
        return ";";
      default:
        return "\t";
    }
  };

  // file input ref to trigger the hidden input
  const fileInputRef = React.useRef(null);

  const processFile = useCallback(
    (file) => {
      if (!file) return;

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

          // parsing all lines with the selected separator
          const parsedLines = lines.map((line) =>
            line
              .split(new RegExp(getSeparatorValue(separator)))
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
    },
    [separator, setFullData, setHeaders, setData, setError, rowsToShow],
  );

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setError(null);
    setFilename(file.name);
    setCurrentFile(file);
    setSelectedColumn(null);
    setIsTableExpanded(true);
    processFile(file);
  };

  useEffect(() => {
    if (currentFile) {
      processFile(currentFile);
    }
  }, [separator, currentFile, processFile]);

  useEffect(() => {
    const maxHeader =
      headers.reduce((acc, elem) => Math.max(elem.length, acc), 0) * 15;
    setColWidth(maxHeader);
  }, [headers]);

  useEffect(() => {
    const selectedColumnNumber = headers.indexOf(selectedColumn);
    setSelectedColumnNo(selectedColumnNumber);
  }, [headers, selectedColumn, setSelectedColumnNo]);

  // toggling table expansion
  const toggleTableExpansion = () => {
    setIsTableExpanded(!isTableExpanded);
  };

  // defining columns for DataGrid
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
          onChange={(e) => {
            const columnIsValid = isColumnValid(
              headers.indexOf(header),
              fullData,
            );
            if (columnIsValid) {
              setIsTableExpanded(false);
              setSelectedColumn(header);
            } else {
              setIsTableExpanded(true);
              setSelectedColumn(null);
            } // automatically collapsing table when a column is selected
          }}
        />
        {params.colDef.headerName}
      </div>
    ),
  }));

  return (
    <div>
      <Typography variant="h4">RR TS Editor</Typography>
      <Typography variant="h6" gutterBottom>
        Your data are analyzed in your browser, they never leave your computer
      </Typography>

      {/* Input controls in a single row */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
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
            <MenuItem value="tab">Tab</MenuItem>
            <MenuItem value="whitespace">Whitespace</MenuItem>
            <MenuItem value="comma">Comma (,)</MenuItem>
            <MenuItem value="semicolon">Semicolon (;)</MenuItem>
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

        <FormControlLabel
          control={
            <Checkbox
              checked={diff}
              onChange={(e) => setDiff(e.target.checked)}
              color="primary"
            />
          }
          label="Extract RRs"
        />

        <TextField
          id="scaleDataBy"
          label="Scale data by"
          variant="outlined"
          size="small"
          type="number"
          inputProps={{
            step: "0.01",
            min: "0.01",
          }}
          value={scaleDataBy}
          onChange={(e) => setScaleDataBy(Number(e.target.value))}
        />
      </Box>

      {/* error display */}
      {error && <Typography color="error">{error}</Typography>}

      {/* DataGrid display with collapsible functionality */}
      {data.length > 0 && (
        <div>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 1,
              borderBottom: "1px solid #ddd",
              justifyContent: "space-between",
              width: "95%",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            <Typography variant="h6">Data Preview: {filename}</Typography>
            <IconButton onClick={toggleTableExpansion}>
              {isTableExpanded ? "−" : "+"}
            </IconButton>
          </Box>

          {isTableExpanded && (
            <div
              style={{
                height: 420,
                width: "95%",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
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
          )}
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
