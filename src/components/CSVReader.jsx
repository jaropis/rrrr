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
  Card,
  CardContent,
  Chip,
  Fade,
  Alert,
} from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Analytics as AnalyticsIcon,
} from "@mui/icons-material";

const getHeaderAndData = (parsedLines, setHeaderPresent) => {
  let parsedHeaders = parsedLines[0];
  let parsedData;
  // checking if all headers can be cast to numbers
  const allHeadersAreNumbers = parsedHeaders.every((header) => {
    const parsedHeader = parseFloat(header);
    return !isNaN(parsedHeader) && isFinite(parseFloat(parsedHeader));
  });
  if (allHeadersAreNumbers) {
    setHeaderPresent(false);
    parsedHeaders = parsedHeaders.map((header, index) => `Column ${index + 1}`);
    parsedData = parsedLines;
  } else {
    setHeaderPresent(true);
    parsedData = parsedLines.slice(1);
  }
  return { parsedHeaders, parsedData };
};
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
  generatePlot,
  setGeneratePlot,
  setHeaderPresent,
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
          const { parsedHeaders, parsedData } = getHeaderAndData(
            parsedLines,
            setHeaderPresent,
          );

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
    [
      separator,
      setFullData,
      setHeaders,
      setData,
      setError,
      rowsToShow,
      setHeaderPresent,
    ],
  );

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setError(null);
    setFilename(file.name);
    setCurrentFile(file);
    setSelectedColumn(null);
    setIsTableExpanded(true);
    processFile(file);
    setGeneratePlot(false);
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

  useEffect(() => {
    if (generatePlot) {
      setIsTableExpanded(false);
    } else {
      setIsTableExpanded(true);
    }
  }, [generatePlot]);

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
    <Box>
      {/* Enhanced Input controls section */}
      <Card
        elevation={0}
        sx={{
          mb: 3,
          background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
          borderRadius: 3,
          border: "1px solid rgba(148, 163, 184, 0.2)",
        }}
      >
        <CardContent>
          <Typography
            variant="h6"
            sx={{
              mb: 3,
              color: "#475569",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <AnalyticsIcon color="primary" />
            Data Configuration
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
              flexWrap: "wrap",
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
                size="large"
                startIcon={<CloudUploadIcon />}
                onClick={() => fileInputRef.current.click()}
                sx={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  boxShadow: "0 8px 32px rgba(102, 126, 234, 0.3)",
                  borderRadius: 2,
                  px: 3,
                  py: 1.5,
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
                    boxShadow: "0 12px 40px rgba(102, 126, 234, 0.4)",
                  },
                }}
              >
                Select File
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
                sx={{ borderRadius: 2 }}
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
              size="medium"
              value={customFilename}
              onChange={(e) => setCustomFilename(e.target.value)}
              placeholder="Enter prefix"
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: 2 },
              }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={diff}
                  onChange={(e) => setDiff(e.target.checked)}
                  color="primary"
                  sx={{
                    "&.Mui-checked": {
                      color: "#667eea",
                    },
                  }}
                />
              }
              label="Extract RRs"
            />

            <TextField
              id="scaleDataBy"
              label="Scale data by"
              variant="outlined"
              size="medium"
              type="number"
              inputProps={{
                step: "10",
                min: "1",
              }}
              value={scaleDataBy}
              onChange={(e) => setScaleDataBy(Number(e.target.value))}
              sx={{
                width: 150,
                "& .MuiOutlinedInput-root": { borderRadius: 2 },
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Enhanced error display */}
      {error && (
        <Fade in={true}>
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        </Fade>
      )}

      {/* Enhanced DataGrid display */}
      {data.length > 0 && (
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: "1px solid rgba(148, 163, 184, 0.2)",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 2,
              background: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
              borderBottom: "1px solid rgba(148, 163, 184, 0.2)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography
                variant="h6"
                sx={{ color: "#475569", fontWeight: 600 }}
              >
                Data Preview
              </Typography>
              {filename && (
                <Chip
                  label={filename}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              )}
            </Box>
            <IconButton
              onClick={toggleTableExpansion}
              sx={{
                background: "rgba(102, 126, 234, 0.1)",
                "&:hover": {
                  background: "rgba(102, 126, 234, 0.2)",
                },
              }}
            >
              {isTableExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>

          <Fade in={isTableExpanded}>
            <Box sx={{ display: isTableExpanded ? "block" : "none" }}>
              <Box sx={{ height: 420 }}>
                <DataGrid
                  rows={data}
                  columns={columns}
                  pageSizeOptions={[5, 10, 25]}
                  initialState={{
                    pagination: null,
                  }}
                  disableColumnMenu
                  sx={{
                    border: "none",
                    "& .MuiDataGrid-cell": {
                      borderBottom: "1px solid rgba(148, 163, 184, 0.1)",
                    },
                    "& .MuiDataGrid-columnHeaders": {
                      background:
                        "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                      borderBottom: "2px solid rgba(148, 163, 184, 0.2)",
                    },
                    "& .MuiDataGrid-row:hover": {
                      background: "rgba(102, 126, 234, 0.05)",
                    },
                  }}
                />
              </Box>
            </Box>
          </Fade>
        </Card>
      )}

      {/* Enhanced debug info */}
      {headers.length > 0 && (
        <Fade in={true}>
          <Card
            elevation={0}
            sx={{
              mt: 2,
              background: "rgba(102, 126, 234, 0.05)",
              border: "1px solid rgba(102, 126, 234, 0.1)",
              borderRadius: 2,
            }}
          >
            <CardContent sx={{ py: 1.5 }}>
              <Typography variant="body2" sx={{ color: "#64748b" }}>
                <strong>Detected columns:</strong> {headers.join(", ")}
              </Typography>
            </CardContent>
          </Card>
        </Fade>
      )}
    </Box>
  );
};

export default CSVReader;
