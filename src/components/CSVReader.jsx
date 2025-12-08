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
  Chip,
  Alert,
  Collapse,
} from "@mui/material";
import {
  CloudUploadOutlined,
  KeyboardArrowDown,
  KeyboardArrowUp,
  TableChartOutlined,
  TuneOutlined,
  DescriptionOutlined,
} from "@mui/icons-material";

const findCharacterIndex = (arr) => {
  return arr.findIndex((item) => typeof item === "string" && item.length > 0);
};

const getHeaderAndData = (
  parsedLines,
  headerPresent,
  setHeaderPresent,
  rowsToRemove,
) => {
  const linesAfterRemoval = parsedLines.slice(rowsToRemove);
  if (linesAfterRemoval.length === 0) {
    setHeaderPresent(false);
    return { parsedHeaders: [], parsedData: [] };
  }

  let parsedHeaders = linesAfterRemoval[0];
  let parsedData;
  const someHeadersAreNumbers = parsedHeaders.some((headerItem) => {
    const parsedHeader = parseFloat(headerItem);
    return !isNaN(parsedHeader) && isFinite(parseFloat(parsedHeader));
  });

  if (someHeadersAreNumbers) {
    const firstLine = linesAfterRemoval[0];
    const firstLineIndex = findCharacterIndex(firstLine);
    setHeaderPresent(false);
    for (let i = 1; i < Math.min(3, linesAfterRemoval.length); i++) {
      const line = linesAfterRemoval[i];
      if (
        line.length === firstLine.length &&
        findCharacterIndex(line) === firstLineIndex
      ) {
        continue;
      } else {
        setHeaderPresent(true);
        break;
      }
    }
    if (!headerPresent) {
      parsedHeaders = parsedHeaders.map(
        (header, index) => `Column ${index + 1}`,
      );
      parsedData = linesAfterRemoval;
    } else {
      parsedData = linesAfterRemoval.slice(1);
    }
  } else {
    setHeaderPresent(true);
    parsedData = linesAfterRemoval.slice(1);
  }
  return { parsedHeaders, parsedData };
};

const isColumnValid = (selectedColumn, fullData) => {
  let columnIsValid = false;
  for (let idx = 0; idx < Math.min(100, fullData.length); idx++) {
    if (parseFloat(fullData[idx][selectedColumn])) {
      columnIsValid = true;
    }
  }
  return columnIsValid;
};

const getAnnotations = (fullData, seelctedColumnNo) => {
  const theOtherColumn = 1 - seelctedColumnNo;
  const annotations = [];
  for (let i = 0; i < fullData.length; i++) {
    const value = fullData[i][theOtherColumn];
    if (value && !annotations.includes(value)) {
      annotations.push(value);
    }
  }
  return annotations;
};

const CSVReader = ({
  fullData,
  setFullData,
  selectedColumnNo,
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
  headerPresent,
  setHeaderPresent,
  rowsToRemove,
  setRowsToRemove,
  annotValues,
  setAnnotValues,
  normalAnnot,
  setNormalAnnot,
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

          const parsedLines = lines.map((line) =>
            line
              .split(new RegExp(getSeparatorValue(separator)))
              .filter((part) => part.trim().length > 0),
          );
          const { parsedHeaders, parsedData } = getHeaderAndData(
            parsedLines,
            headerPresent,
            setHeaderPresent,
            rowsToRemove,
          );

          setFullData(parsedLines);
          setHeaders(parsedHeaders);
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
      rowsToRemove,
      headerPresent,
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
    if (selectedColumnNo !== null && selectedColumnNo >= 0) {
      const annotations = getAnnotations(fullData, selectedColumnNo).filter(
        (elem) => !headers.includes(elem),
      );
      setAnnotValues(annotations);
    }
  }, [fullData, selectedColumnNo, setAnnotValues, headers]);

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

  const toggleTableExpansion = () => {
    setIsTableExpanded(!isTableExpanded);
  };

  const columns = headers.map((header) => ({
    field: header,
    headerName: header.charAt(0).toUpperCase() + header.slice(1),
    width: Math.max(colWidth, header.length * 12),
    headerAlign: "center",
    align: "center",
    renderHeader: (params) => (
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
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
            }
          }}
        />
        <span>{params.colDef.headerName}</span>
      </Box>
    ),
  }));

  return (
    <Box>
      {/* Configuration Section */}
      <Box className="section" sx={{ mb: 2 }}>
        <Box className="section__header">
          <Box className="section__title">
            <TuneOutlined className="section__title-icon" />
            <span>Configuration</span>
          </Box>
        </Box>
        <Box className="section__content">
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
                lg: "repeat(6, 1fr)",
              },
              gap: 2,
              alignItems: "end",
            }}
          >
            {/* File Upload */}
            <Box>
              <input
                type="file"
                accept=".txt,.csv,.tsv,.dat,.rea,.rri"
                onChange={handleFileUpload}
                style={{ display: "none" }}
                id="file-input"
                ref={fileInputRef}
              />
              <Button
                variant="contained"
                fullWidth
                startIcon={<CloudUploadOutlined />}
                onClick={() => fileInputRef.current.click()}
                sx={{ height: 48 }}
              >
                Select File
              </Button>
            </Box>

            {/* Separator */}
            <FormControl fullWidth size="small">
              <InputLabel>Separator</InputLabel>
              <Select
                value={separator}
                label="Separator"
                onChange={(e) => setSeparator(e.target.value)}
              >
                <MenuItem value="tab">Tab</MenuItem>
                <MenuItem value="whitespace">Whitespace</MenuItem>
                <MenuItem value="comma">Comma</MenuItem>
                <MenuItem value="semicolon">Semicolon</MenuItem>
              </Select>
            </FormControl>

            {/* Custom Filename */}
            <TextField
              label="Output prefix"
              variant="outlined"
              size="small"
              value={customFilename}
              onChange={(e) => setCustomFilename(e.target.value)}
              placeholder="Cut_"
            />

            {/* Extract RRs */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={diff}
                  onChange={(e) => setDiff(e.target.checked)}
                  size="small"
                />
              }
              label={
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Extract RRs
                </Typography>
              }
              sx={{ ml: 0 }}
            />

            {/* Sinus Beat */}
            {diff && annotValues && annotValues.length > 0 && (
              <FormControl fullWidth size="small">
                <InputLabel>Sinus beat</InputLabel>
                <Select
                  value={normalAnnot}
                  label="Sinus beat"
                  onChange={(e) => setNormalAnnot(e.target.value)}
                >
                  {annotValues.map((value, index) => (
                    <MenuItem key={index} value={value}>
                      {value}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Scale */}
            <TextField
              label="Scale factor"
              variant="outlined"
              size="small"
              type="number"
              slotProps={{
                htmlInput: {
                  step: "any",
                  min: "0.001",
                },
              }}
              value={scaleDataBy}
              onChange={(e) => setScaleDataBy(Number(e.target.value))}
            />

            {/* Rows to Remove */}
            <TextField
              label="Skip rows"
              variant="outlined"
              size="small"
              type="number"
              slotProps={{
                htmlInput: {
                  min: "0",
                  step: "1",
                },
              }}
              value={rowsToRemove}
              onChange={(e) =>
                setRowsToRemove(Math.max(0, parseInt(e.target.value) || 0))
              }
            />
          </Box>
        </Box>
      </Box>

      {/* Error Alert */}
      <Collapse in={!!error}>
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      </Collapse>

      {/* Data Preview Section */}
      {data.length > 0 && (
        <Box className="section">
          <Box
            className="section__header"
            sx={{ cursor: "pointer" }}
            onClick={toggleTableExpansion}
          >
            <Box className="section__title">
              <TableChartOutlined className="section__title-icon" />
              <span>Data Preview</span>
              {filename && (
                <Chip
                  icon={<DescriptionOutlined sx={{ fontSize: 14 }} />}
                  label={filename}
                  size="small"
                  sx={{ ml: 1 }}
                />
              )}
            </Box>
            <IconButton size="small">
              {isTableExpanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </IconButton>
          </Box>

          <Collapse in={isTableExpanded}>
            <Box sx={{ height: 380 }}>
              <DataGrid
                rows={data}
                columns={columns}
                pageSizeOptions={[5, 10, 25]}
                initialState={{
                  pagination: null,
                }}
                disableColumnMenu
                hideFooter
              />
            </Box>
          </Collapse>

          {/* Column Info */}
          {headers.length > 0 && (
            <Box
              className="section__content--compact"
              sx={{
                borderTop: "1px solid",
                borderColor: "divider",
                bgcolor: "grey.50",
              }}
            >
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                <strong>Columns detected:</strong> {headers.join(", ")}
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default CSVReader;
