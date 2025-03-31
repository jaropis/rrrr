import "./App.css";
import React, { useState } from "react";
import { Typography } from "@mui/material";
import CSVReader from "./components/CSVReader";
import Tachogram from "./components/Tachogram";
function App() {
  const [fullData, setFullData] = useState(null);
  const [selectedColumnNo, setSelectedColumnNo] = useState(null);
  const [filename, setFilename] = useState(null);
  const [customFilename, setCustomFilename] = useState("Cut_");
  const [diff, setDiff] = useState(true);
  const [scaleDataBy, setScaleDataBy] = useState(1);
  return (
    <div className="App">
      <Typography variant="h4">R-RR-eR</Typography>
      <Typography variant="h6" gutterBottom>
        Your data are analyzed in your browser, they never leave your computer
      </Typography>
      <CSVReader
        fullData={fullData}
        setFullData={setFullData}
        setSelectedColumnNo={setSelectedColumnNo}
        filename={filename}
        setFilename={setFilename}
        customFilename={customFilename}
        setCustomFilename={setCustomFilename}
        diff={diff}
        setDiff={setDiff}
        scaleDataBy={scaleDataBy}
        setScaleDataBy={setScaleDataBy}
      />
      {selectedColumnNo >= 0 && (
        <Tachogram
          selectedColumn={selectedColumnNo}
          data={fullData}
          filename={customFilename ? customFilename + filename : filename} // Use custom filename if provided
          diff={diff}
          scaleDataBy={scaleDataBy}
        />
      )}
    </div>
  );
}

export default App;
