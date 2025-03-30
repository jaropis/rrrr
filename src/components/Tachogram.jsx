import React, { useState, useEffect, useRef } from "react";
import Dygraph from "dygraphs";
import Button from "@mui/material/Button";

const parseDiff = (data, selectedColumn) => {
  const localPlottingData = [];
  for (let i = 1; i < data.length - 1; i++) {
    const value =
      parseFloat(data[i + 1][selectedColumn]) -
      parseFloat(data[i][selectedColumn]);
    localPlottingData.push([i, value]);
  }
  return localPlottingData;
};

const parseNoDiff = (data, selectedColumn) => {
  const localPlottingData = [];
  for (let i = 1; i < data.length; i++) {
    const value = parseFloat(data[i][selectedColumn]);
    localPlottingData.push([i, value]);
  }
  return localPlottingData;
};

const Tachogram = ({ selectedColumn, data, filename }) => {
  const logRange = (min, max, label) => {
    setMinmax([min, max]);
  };
  const handleCut = (e) => {
    e.preventDefault();
    let cutData = data.slice(minmax[0], minmax[1]);

    console.log(plottingData);
    let header = data[0];
    if (diff) {
      header.push("RR");
      let cutPlottingData = plottingData.slice(minmax[0], minmax[1]);
      for (let idx = 0; idx < cutData.length; idx++) {
        cutData[idx].push(cutPlottingData[idx][1].toFixed(3));
      }
    }

    cutData.splice(0, 0, header);

    const csvContent = cutData.map((row) => row.join("\t")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    const cutFilename = filename.split(".");
    const downloadFilename =
      cutFilename[0] + (cutFilename[1] ? "." + cutFilename[1] : null);
    link.download = downloadFilename;
    document.body.append(link);
    link.click();
    document.body.removeChild(link);
    // cleanup
    URL.revokeObjectURL(url);
  };
  const diff = true;
  const [plottingData, setPlottingData] = useState(null);
  const [minmax, setMinmax] = useState([]);
  const tachoGraph = useRef();
  useEffect(() => {
    if (data && selectedColumn >= 0) {
      if (diff) {
        setPlottingData(parseDiff(data, selectedColumn));
      } else {
        setPlottingData(parseNoDiff(data, selectedColumn));
      }
    }
  }, [data, selectedColumn, diff]);

  useEffect(() => {
    if (plottingData && plottingData.length > 0) {
      tachoGraph.current = new Dygraph(
        document.getElementById("graphdiv"),
        plottingData,
        {
          title: "",
          legend: "always",
          labels: ["N", "RR"],
          xlabel: "Beat Index",
          ylabel: "RR",
          x: {
            axisLabelFormatter: function (x) {
              return x.toFixed(0);
            },
            valueFormatter: function (x) {
              return x.toFixed(0);
            },
          },
          showRangeSelector: true,
          zoomCallback: function (minDate, maxDate, yRanges) {
            // this callback is fired when the main view (zoom) is updated,
            // which happens after the user has finished moving the slider.
            logRange(minDate, maxDate, "Zoom Callback");
          },
          rangeSelectorHeight: 150,
        },
      );
    }
    return () => {
      if (tachoGraph.current) {
        tachoGraph.current.destroy();
        tachoGraph.current = null;
      }
    };
  }, [plottingData]);
  return (
    <>
      <div
        id="graphdiv"
        style={{
          width: "95%",
          height: 300,
          marginLeft: 30,
          marginRight: 30,
        }}
      ></div>
      <Button
        variant="contained"
        color="primary"
        onClick={handleCut}
        style={{ margin: "20px 0" }}
      >
        Cut and export
      </Button>
    </>
  );
};

export default Tachogram;
