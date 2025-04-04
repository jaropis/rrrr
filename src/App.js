import "./App.css";
import React, { useState, useEffect } from "react";
import { Typography } from "@mui/material";
import CSVReader from "./components/CSVReader";
import Tachogram from "./components/Tachogram";

const parseDiff = (data, selectedColumn, scaleDataBy) => {
  const localPlottingData = [];
  for (let i = 1; i < data.length - 1; i++) {
    const value =
      (parseFloat(data[i + 1][selectedColumn]) -
        parseFloat(data[i][selectedColumn])) *
      scaleDataBy;
    localPlottingData.push([data[i + 1][selectedColumn], value]);
  }
  return localPlottingData;
};

const parseNoDiff = (data, selectedColumn, scaleDataBy) => {
  const localPlottingData = [];
  let cumulativeTime = 0;
  for (let i = 1; i < data.length; i++) {
    const value = parseFloat(data[i][selectedColumn]) * scaleDataBy;
    cumulativeTime = cumulativeTime + data[i][selectedColumn];
    localPlottingData.push([cumulativeTime, value]);
  }
  return localPlottingData;
};

function App() {
  const [fullData, setFullData] = useState(null);
  const [selectedColumnNo, setSelectedColumnNo] = useState(null);
  const [filename, setFilename] = useState(null);
  const [customFilename, setCustomFilename] = useState("Cut_");
  const [diff, setDiff] = useState(true);
  const [scaleDataBy, setScaleDataBy] = useState(1);
  const [generatePlot, setGeneratePlot] = useState(false);
  const [plottingData, setPlottingData] = useState(null);

  useEffect(() => {
    if (fullData && selectedColumnNo >= 0) {
      if (diff) {
        setPlottingData(parseDiff(fullData, selectedColumnNo, scaleDataBy));
      } else {
        setPlottingData(parseNoDiff(fullData, selectedColumnNo), scaleDataBy);
      }
    }
  }, [fullData, selectedColumnNo, diff, scaleDataBy]);

  useEffect(() => {
    if (plottingData && plottingData.length > 0) {
      const meanRRms =
        plottingData.reduce((sum, point) => sum + point[1], 0) /
        plottingData.length;

      if (meanRRms > 300 && meanRRms < 3000) {
        setGeneratePlot(true);
      } else {
        setGeneratePlot(false);
      }
    }
  }, [plottingData, setGeneratePlot]);
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
      {generatePlot && selectedColumnNo >= 0 && (
        <Tachogram
          data={fullData}
          plottingData={plottingData}
          selectedColumn={selectedColumnNo}
          filename={customFilename ? customFilename + filename : filename} // using custom filename if provided
          diff={diff}
          generatePlot={generatePlot}
        />
      )}
    </div>
  );
}

export default App;
