import "./App.css";
import React, { useState } from "react";
import CSVReader from "./components/CSVReader";
import Tachogram from "./components/Tachogram";
function App() {
  const [fullData, setFullData] = useState(null);
  const [selectedColumnNo, setSelectedColumnNo] = useState(null);
  const [filename, setFilename] = useState(null);
  const [customFilename, setCustomFilename] = useState("Cut_");
  const [diff, setDiff] = useState(false);
  return (
    <div className="App">
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
      />
      {selectedColumnNo >= 0 && (
        <Tachogram
          selectedColumn={selectedColumnNo}
          data={fullData}
          filename={customFilename ? customFilename + filename : filename} // Use custom filename if provided
          diff={diff}
        />
      )}
    </div>
  );
}

export default App;
