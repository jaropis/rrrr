import React, { useState } from "react";
import Papa from "papaparse";
import { DataGrid } from "@mui/x-data-grid";
import { Radio } from "@mui/material";

const CSVReader = () => {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [error, setError] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState(null);
  // number of rows to show (like head() in python)
  const rowsToShow = 6;

  const handleFileUpload = (event) => {
    const file = event.target.files[0];

    if (file) {
      Papa.parse(file, {
        delimiter: "\t", // using explicit tab delimiter instead of regex
        skipEmptyLines: true,
        header: true, // automatically use first row as headers
        complete: (result) => {
          if (result.errors.length > 0) {
            setError("Error parsing CSV file: " + result.errors[0].message);
            console.log(result.errors);
            return;
          }

          // getting headers from the meta.fields
          setHeaders(result.meta.fields || []);

          // mapping the data with row ids
          const previewData = result.data
            .slice(0, rowsToShow)
            .map((row, index) => ({
              id: index,
              ...row,
            }));

          setData(previewData);
        },
        error: (error) => {
          setError("Error reading file: " + error.message);
        },
      });
    }
  };

  // defining columns for DataGrid based on headers
  const columns = headers.map((header) => ({
    field: header,
    headerName: header.charAt(0).toUpperCase() + header.slice(1),
    width: Math.max(100, header.length * 10),
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
      <h2>CSV Preview</h2>

      {/* file input */}
      <input type="file" accept=".csv,.txt" onChange={handleFileUpload} />

      {/* error display */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* DataGrid display */}
      {data.length > 0 && (
        <div style={{ height: 400, width: "100%" }}>
          <DataGrid
            rows={data}
            columns={columns}
            pageSizeOptions={[rowsToShow]} // Optional: control pagination
            initialState={{
              pagination: { paginationModel: { pageSize: rowsToShow } },
            }}
            disableColumnMenu
          />
        </div>
      )}
    </div>
  );
};

export default CSVReader;
