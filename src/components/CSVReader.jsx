import React, { useState } from "react";
import Papa from "papaparse";

const CSVReader = () => {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [error, setError] = useState(null);

  // number of rows to show (like head() in python)
  const rowsToShow = 6;

  const handleFileUpload = (event) => {
    const file = event.target.files[0];

    if (file) {
      Papa.parse(file, {
	delimiter: /\s+/,
        skipEmptyLines: true,
        complete: (result) => {
          if (result.errors.length > 0) {
            setError("Error parsing CSV file" + result.errors[0].message);
	    console.log(result.errors);
            return;
          }

          // getting headers from the first row
          setHeaders(result.data[0]);

          // getting the first rowsToShow rows (or less if file is smaller)
          const previewData = result.data.slice(1, rowsToShow + 1);
          setData(previewData);
        },
        error: (error) => {
          setError("Error reading file: " + error.message);
        },
      });
    }
  };

  return (
    <div>
      <h2>CSV Preview</h2>

      {/* file input */}
      <input type="file" accept=".csv,.txt" onChange={handleFileUpload} />

      {/* error display */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* table display */}
      {data.length > 0 && (
        <table>
          <thead>
            <tr>
              {headers.map((header, index) => (
                <th key={index}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, colIndex) => (
                  <td key={colIndex}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CSVReader;
