import "./App.css";
import React, { useState, useEffect } from "react";
import { ThemeProvider, CssBaseline, Box, Typography } from "@mui/material";
import {
  FavoriteBorderOutlined,
  SecurityOutlined,
} from "@mui/icons-material";
import CSVReader from "./components/CSVReader";
import Tachogram from "./components/Tachogram";
import theme from "./theme";

const parseDiff = (
  data,
  selectedColumn,
  scaleDataBy,
  headerPresent,
  rowsToRemove,
) => {
  let cumulativeTime = 0;
  const localPlottingData = [];
  const loopStart = headerPresent ? 1 + rowsToRemove : rowsToRemove;
  for (let i = loopStart; i < data.length - 1; i++) {
    const value =
      (parseFloat(data[i + 1][selectedColumn]) -
        parseFloat(data[i][selectedColumn])) *
      scaleDataBy;
    cumulativeTime = cumulativeTime + value;
    localPlottingData.push([cumulativeTime / 1000, value]);
  }
  return localPlottingData;
};

const parseNoDiff = (
  data,
  selectedColumn,
  scaleDataBy,
  headerPresent,
  rowsToRemove,
) => {
  const localPlottingData = [];
  let cumulativeTime = 0;
  const loopStart = headerPresent ? 1 + rowsToRemove : rowsToRemove;
  for (let i = loopStart; i < data.length; i++) {
    const value = parseFloat(data[i][selectedColumn]) * scaleDataBy;
    cumulativeTime = cumulativeTime + value;
    localPlottingData.push([cumulativeTime / 1000, value]);
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
  const [headerPresent, setHeaderPresent] = useState(null);
  const [rowsToRemove, setRowsToRemove] = useState(0);
  const [annotValues, setAnnotValues] = useState([]);
  const [normalAnnot, setNormalAnnot] = useState("");

  useEffect(() => {
    if (fullData && selectedColumnNo >= 0) {
      if (diff) {
        setPlottingData(
          parseDiff(
            fullData,
            selectedColumnNo,
            scaleDataBy,
            headerPresent,
            rowsToRemove,
          ),
        );
      } else {
        setPlottingData(
          parseNoDiff(
            fullData,
            selectedColumnNo,
            scaleDataBy,
            headerPresent,
            rowsToRemove,
          ),
        );
      }
    }
  }, [
    fullData,
    selectedColumnNo,
    diff,
    scaleDataBy,
    headerPresent,
    rowsToRemove,
  ]);

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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App">
        <Box className="app-layout">
          {/* Header */}
          <header className="app-header">
            <Box className="app-header__brand">
              <Box className="app-header__logo">
                <FavoriteBorderOutlined sx={{ fontSize: 20 }} />
              </Box>
              <Box>
                <Typography className="app-header__title">R-RR-eR</Typography>
                <Typography className="app-header__subtitle">
                  RR Interval Analysis Tool
                </Typography>
              </Box>
            </Box>
            <Box className="app-header__badge">
              <SecurityOutlined sx={{ fontSize: 14 }} />
              Data stays in your browser
            </Box>
          </header>

          {/* Main Content */}
          <main className="app-main">
            <CSVReader
              fullData={fullData}
              setFullData={setFullData}
              selectedColumnNo={selectedColumnNo}
              setSelectedColumnNo={setSelectedColumnNo}
              filename={filename}
              setFilename={setFilename}
              customFilename={customFilename}
              setCustomFilename={setCustomFilename}
              diff={diff}
              setDiff={setDiff}
              scaleDataBy={scaleDataBy}
              setScaleDataBy={setScaleDataBy}
              generatePlot={generatePlot}
              setGeneratePlot={setGeneratePlot}
              headerPresent={headerPresent}
              setHeaderPresent={setHeaderPresent}
              rowsToRemove={rowsToRemove}
              setRowsToRemove={setRowsToRemove}
              annotValues={annotValues}
              setAnnotValues={setAnnotValues}
              normalAnnot={normalAnnot}
              setNormalAnnot={setNormalAnnot}
            />

            {generatePlot && selectedColumnNo >= 0 && (
              <Tachogram
                data={fullData}
                plottingData={plottingData}
                selectedColumn={selectedColumnNo}
                filename={customFilename ? customFilename + filename : filename}
                diff={diff}
                generatePlot={generatePlot}
                normalAnnot={normalAnnot}
                headerPresent={headerPresent}
              />
            )}
          </main>
        </Box>
      </div>
    </ThemeProvider>
  );
}

export default App;
