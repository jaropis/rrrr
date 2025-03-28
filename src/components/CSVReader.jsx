import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Radio } from "@mui/material";
import Tachogram from "./Tachogram";

const CSVReader = () => {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [error, setError] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [selectedColumnNo, setSelectedColumnNo] = useState(null);
  const [colWidth, setColWidth] = useState(120);
  const [fullData, setFullData] = useState(null);
  const rowsToShow = 6;

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setError(null);

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

          // parsing all lines with the same approach - split on any whitespace
          // and filter out empty parts
          const parsedLines = lines.map((line) =>
            line.split(/\s+/).filter((part) => part.trim().length > 0),
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
      <h2>Data File Reader</h2>
      <h3>
        Your data are analyzed in your browser, they never leave your computer
      </h3>

      <div style={{ marginBottom: "16px" }}>
        <input
          type="file"
          accept=".txt,.csv,.tsv,.dat"
          onChange={handleFileUpload}
        />
      </div>

      {/* error display */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* upload prompt */}
      {data.length === 0 && !error && <p>Upload a file to see preview</p>}

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
          <Tachogram selectedColumn={selectedColumnNo} data={fullData} />
        </div>
      )}

      {/* debug info */}
      {headers.length > 0 && (
        <div style={{ marginTop: "16px", fontSize: "0.8rem", color: "#666" }}>
          <p>Detected columns: {headers.join(", ")}</p>
        </div>
      )}
    </div>
  );
};

export default CSVReader;
