import React, { useState, useEffect, useRef } from "react";
import Dygraph from "dygraphs";
import Button from "@mui/material/Button";
import TimeInput from "./TimeInput";
import { Box, Typography } from "@mui/material";

const timestampToDataIndex = (timestamp, startingTime, plottingData) => {
  const startTime = createDateFromTimeString(startingTime).getTime();
  const relativeTime = timestamp - startTime;

  const timeInSeconds = relativeTime / 1000;

  let closestIdx = 0;
  let minDiff = Number.MAX_VALUE;

  for (let i = 0; i < plottingData.length; i++) {
    const diff = Math.abs(plottingData[i][0] - timeInSeconds);
    if (diff < minDiff) {
      minDiff = diff;
      closestIdx = i;
    }
  }

  return closestIdx;
};

function sliceResultingData(
  data,
  startingTime,
  plottingData,
  minmax,
  windowStartingTime,
  windowEndingTime,
  lastChanged,
) {
  let startIndex = null;
  let endIndex = null;
  if (lastChanged === "minmax") {
    console.log("minmax", minmax);
    startIndex = timestampToDataIndex(minmax[0], startingTime, plottingData);
    console.log("startIndex", startIndex);
    endIndex = timestampToDataIndex(minmax[1], startingTime, plottingData);
  }
  if (lastChanged === "window") {
    console.log("window", windowStartingTime, windowEndingTime);
    const overallStartingTime = createDateFromTimeString(startingTime);
    const startTime = createDateFromTimeString(windowStartingTime);
    const endTime = createDateFromTimeString(windowEndingTime);
    startIndex = plottingData.findIndex((point) => {
      return (
        point[0] * 1000 + overallStartingTime.getTime() >= startTime.getTime()
      );
    });
    endIndex = plottingData.findIndex(
      (point) =>
        point[0] * 1000 + overallStartingTime.getTime() >= endTime.getTime(),
    );
  }
  if (startIndex === endIndex) {
    endIndex = data.length - 2;
  }
  return { startIndex, endIndex };
}

function formatTimeDifference(milliseconds) {
  // convert to seconds
  const totalSeconds = Math.floor(milliseconds / 1000);

  // calculate hours, minutes, seconds
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // format based on duration
  if (hours > 0) {
    // show hours, minutes, seconds
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    // show only minutes, seconds
    return `${minutes}m ${seconds}s`;
  } else {
    // show only seconds
    return `${seconds}s`;
  }
}

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

const Tachogram = ({ data, plottingData, selectedColumn, filename, diff }) => {
  const logRange = (min, max, label) => {
    setMinmax([min, max]);
    setLastChanged("minmax"); // info that the last change was minmax
  };
  const handleCut = (e) => {
    e.preventDefault();
    const { startIndex, endIndex } = sliceResultingData(
      data,
      startingTime,
      plottingData,
      minmax,
      windowStartingTime,
      windowEndingTime,
      lastChanged,
    );
    //deep copy of a part of the data
    console.log("startIndex, endIndex", startIndex, endIndex);
    let cutData = data.slice(startIndex, endIndex).map((row) => [...row]);
    let cutPlottingData = plottingData.slice(startIndex, endIndex);
    let header = [...data[0]];
    const allHeadersAreNumbers = header.every((header) => {
      const parsedHeader = parseFloat(header);
      return !isNaN(parsedHeader) && isFinite(parseFloat(parsedHeader));
    });
    if (allHeadersAreNumbers) {
      header = header.map((header, index) => `Column ${index + 1}`);
    }
    if (diff) {
      header.push("RR");
      for (let idx = 0; idx < cutData.length; idx++) {
        cutData[idx].push(cutPlottingData[idx][1].toFixed(3));
      }
    } else {
      for (let idx = 0; idx < cutData.length; idx++) {
        cutData[idx][selectedColumn] = cutPlottingData[idx][1];
      }
      if (allHeadersAreNumbers) {
        header[selectedColumn] = "RR";
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

  const [minmax, setMinmax] = useState([]);
  const [startingTime, setStartingTime] = useState("00:00:00");
  const [windowStartingTime, setWindowStartingTime] = useState("00:00:00");
  const [windowEndingTime, setWindowEndingTime] = useState("00:00:00");
  const [tempWindowStartingTime, setTempWindowStartingTime] =
    useState("00:00:00");
  const [tempWindowEndingTime, setTempWindowEndingTime] = useState("00:00:00");
  const [lastChanged, setLastChanged] = useState("minmax");
  const tachoGraph = useRef();
  // handling window change functions
  const handleWindowChange = (time) => {
    setWindowStartingTime(tempWindowStartingTime);
    setWindowEndingTime(tempWindowEndingTime);
    setLastChanged("window"); // last change was window
  };

  useEffect(() => {
    if (plottingData && plottingData.length > 0) {
      const processedData = plottingData.map((point) => {
        // Convert the starting time to a Date object
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

        // callback for zooming with sliders or panning the whole window
        drawCallback: function (dygraph, isInitial) {
          const range = dygraph.xAxisRange();
          const minDate = range[0];
          const maxDate = range[1];

          // update the minmax satate
          logRange(minDate, maxDate, "Draw Callback");
        },
        // clickCallback: function (e, x, points) {
        //   console.log("Click: x, points", x, points);
        // },
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

  // display the time difference based on what was done recently
  const getTimeDifference = () => {
    if (lastChanged === "minmax" && minmax.length === 2) {
      return formatTimeDifference(minmax[1] - minmax[0]);
    } else if (
      lastChanged === "window" &&
      windowEndingTime &&
      windowStartingTime
    ) {
      const startTime = createDateFromTimeString(windowStartingTime);
      const endTime = createDateFromTimeString(windowEndingTime);
      return formatTimeDifference(endTime - startTime);
    }
    return "0s"; // default
  };

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
          Window start:
        </Typography>
        <TimeInput
          time={tempWindowStartingTime}
          setTime={setTempWindowStartingTime}
        />
        <Typography variant="h6" gutterBottom>
          Window end:
        </Typography>
        <TimeInput
          time={tempWindowEndingTime}
          setTime={setTempWindowEndingTime}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleWindowChange}
        >
          Apply
        </Button>
        <Typography
          variant="h6"
          sx={{
            backgroundColor: "rgba(178, 34, 34, 0.1)",
            padding: "4px 18px",
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            height: "100%",
            margin: "0",
          }}
        >
          {getTimeDifference()}
        </Typography>
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
