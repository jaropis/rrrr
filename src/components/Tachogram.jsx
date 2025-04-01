import React, { useState, useEffect, useRef } from "react";
import Dygraph from "dygraphs";
import Button from "@mui/material/Button";
import TimeInput from "./TimeInput";
import { Box, Typography } from "@mui/material";

function createDateFromTimeString(timeString) {
  // parsing the time string (HH:MM:SS)
  const [hours, minutes, seconds] = timeString.split(":").map(Number);

  // creating a new date object for today
  const date = new Date();

  // setting the time components
  date.setHours(hours || 0);
  date.setMinutes(minutes || 0);
  date.setSeconds(seconds || 0);
  date.setMilliseconds(0); // resetting milliseconds for precision

  return date;
}

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

const Tachogram = ({ selectedColumn, data, filename, diff, scaleDataBy }) => {
  const logRange = (min, max, label) => {
    setMinmax([min, max]);
  };
  const handleCut = (e) => {
    e.preventDefault();
    let cutData = data.slice(minmax[0], minmax[1]);
    let cutPlottingData = plottingData.slice(minmax[0], minmax[1]);
    console.log(plottingData);
    let header = data[0];
    if (diff) {
      header.push("RR");

      for (let idx = 0; idx < cutData.length; idx++) {
        cutData[idx].push(cutPlottingData[idx][1].toFixed(3));
      }
    } else {
      for (let idx = 0; idx < cutData.length; idx++) {
        cutData[idx][selectedColumn] = cutPlottingData[idx][1];
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

  const [plottingData, setPlottingData] = useState(null);
  const [minmax, setMinmax] = useState([]);
  const [startingTime, setStartingTime] = useState("00:00:00");
  const [windowStartingTime, setWindowStartingTime] = useState("00:00:00");
  const [windowEndingTime, setWindowEndingTime] = useState(null);
  const tachoGraph = useRef();
  useEffect(() => {
    if (data && selectedColumn >= 0) {
      if (diff) {
        setPlottingData(parseDiff(data, selectedColumn, scaleDataBy));
      } else {
        setPlottingData(parseNoDiff(data, selectedColumn), scaleDataBy);
      }
    }
  }, [data, selectedColumn, diff, scaleDataBy]);

  useEffect(() => {
    if (plottingData && plottingData.length > 0) {
      const processedData = plottingData.map((point) => {
        const startingAt = createDateFromTimeString(startingTime);
        const millisecondsToAdd = point[0] * 1000;
        const newTimestamp = startingAt.getTime() + millisecondsToAdd;
        const date = new Date(newTimestamp);
        return [date, point[1]];
      });

      const graphOptions = {
        title: "",
        legend: "always",
        labels: ["t", "RR"],
        xlabel: "Time",
        ylabel: "RR",
        axes: {
          x: {
            valueFormatter: function (ms) {
              const date = new Date(ms);
              return date.toTimeString().substring(0, 8); // HH:MM:SS format
            },
            axisLabelFormatter: function (ms) {
              const date = new Date(ms);
              return date.toTimeString().substring(0, 8); // HH:MM:SS format
            },
          },
        },
        showRangeSelector: true,
        zoomCallback: function (minDate, maxDate, yRanges) {
          logRange(minDate, maxDate, "Zoom Callback");
        },
        rangeSelectorHeight: 150,
      };

      // conditionally add dateWindow property
      if (
        windowEndingTime !== null &&
        windowEndingTime > startingTime &&
        windowEndingTime > windowStartingTime
      ) {
        const startTime = createDateFromTimeString(windowStartingTime);
        const endTimeDate = createDateFromTimeString(windowEndingTime); // assuming endTime is in minutes
        graphOptions.dateWindow = [startTime.getTime(), endTimeDate.getTime()];
      }

      // creating the graph with the possibly modified options
      tachoGraph.current = new Dygraph(
        document.getElementById("graphdiv"),
        processedData,
        graphOptions,
      );
    }
    return () => {
      if (tachoGraph.current) {
        tachoGraph.current.destroy();
        tachoGraph.current = null;
      }
    };
  }, [plottingData, startingTime, windowEndingTime, windowStartingTime]);
  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          width: "95%",
          marginLeft: 10,
          marginRight: 10,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Starting time:
        </Typography>
        <TimeInput time={startingTime} setTime={setStartingTime} />
        <Typography variant="h6" gutterBottom>
          Window start time:
        </Typography>
        <TimeInput time={windowStartingTime} setTime={setWindowStartingTime} />
        <Typography variant="h6" gutterBottom>
          Window end time:
        </Typography>
        <TimeInput time={windowEndingTime} setTime={setWindowEndingTime} />
      </Box>
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
