import React, { useState, useEffect, useRef } from "react";
import Dygraph from "dygraphs";
import Button from "@mui/material/Button";
import TimeInput from "./TimeInput";
import { Box, Typography, Card, CardContent, Chip, Paper } from "@mui/material";
import {
  Timeline as TimelineIcon,
  GetApp as DownloadIcon,
  AccessTime as ClockIcon,
} from "@mui/icons-material";

function isDayApart(date1, date2) {
  // creating new date objects with just the date components (no time)
  const day1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const day2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());

  // calculating difference in milliseconds
  const diffMs = Math.abs(day2 - day1);

  // one day in milliseconds = 24 * 60 * 60 * 1000 = 86400000
  return diffMs === 86400000;
}

const timestampToDataIndex = (timestamp, startingTime, plottingData) => {
  const startTime = createDateFromTimeString(startingTime).getTime();
  const relativeTime = timestamp - startTime;
  console.log("relativeTime", relativeTime);

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
    endIndex = timestampToDataIndex(minmax[1], startingTime, plottingData);
  }
  if (lastChanged === "window") {
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
    endIndex = data.length + 2;
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

function createDateFromTimeString(timeString, nextDay = false) {
  // parsing the time string (HH:MM:SS)
  const [hours, minutes, seconds] = timeString.split(":").map(Number);

  // creating a new date object for today
  const date = new Date();

  // setting the time components
  date.setHours(hours || 0);
  date.setMinutes(minutes || 0);
  date.setSeconds(seconds || 0);
  date.setMilliseconds(0); // resetting milliseconds for precision

  // if nextDay is true, adding one day to the date, so that we can set the window after midnight
  if (nextDay) {
    date.setDate(date.getDate() + 1);
  }

  return date;
}

const Tachogram = ({
  data,
  plottingData,
  selectedColumn,
  filename,
  diff,
  normalAnnot,
  headerPresent,
}) => {
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
    console.log("start_index, end_index", startIndex, endIndex);
    let header;
    if (headerPresent) {
      header = [...data[0]];
    } else {
      header = ["timetrack", "RR", "annot"];
    }
    //deep copy of a part of the data
    const offset = Number(headerPresent) + Number(diff); // if there is a header, we need to offset the data by 1, if RRs are calculated from the second R wave vs first, we need to add 1, so Number(diff)
    let cutData = data
      .slice(startIndex + offset, endIndex + offset + 1) // +1 because we want to include the last point - this is what the user expects
      .map((row) => [...row]);
    let cutPlottingData = plottingData.slice(startIndex, endIndex + 1); // +1 because we want to include the last point - this is
    // cutPlottingData = cutPlottingData.map((item) => [...item, normalAnnot]);
    let dontTouch;
    if (diff) {
      for (let idx = 0; idx < cutData.length; idx++) {
	if (idx !== dontTouch) {
          cutPlottingData[idx][2] = cutData[idx][1];
	} else {
	  console.log("not touching");
	}
        if (
          cutData[idx][1] !== normalAnnot &&
          idx + 1 < cutPlottingData.length
        ) {
          cutPlottingData[idx + 1][2] = cutData[idx][1];
	  dontTouch = idx + 1;
        }
      }
    } else {
      for (let idx = 0; idx < cutData.length; idx++) {
        cutData[idx][selectedColumn] = cutPlottingData[idx][1];
      }
      if (headerPresent) {
        header[selectedColumn] = "RR";
      }
    }

    cutPlottingData.splice(0, 0, header);
    const csvContent = cutPlottingData.map((row) => row.join("\t")).join("\n");
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
  const [forceRedraw, setForceRedraw] = useState(0);
  const tachoGraph = useRef();
  // handling window change functions
  const handleWindowChange = (time) => {
    setWindowStartingTime(tempWindowStartingTime);
    setWindowEndingTime(tempWindowEndingTime);
    setLastChanged("window"); // last change was window
    setForceRedraw((prev) => prev + 1); // force redraw
  };

  useEffect(() => {
    if (plottingData && plottingData.length > 0) {
      const processedData = plottingData.map((point) => {
        // converting the starting time to a Date object
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

      // conditionally add dateWindow property - checking if the condition is met TODAY
      const windowEndingTimeDate = createDateFromTimeString(windowEndingTime);
      const windowStartingTimeDate =
        createDateFromTimeString(windowStartingTime);
      const startingTimeDate = createDateFromTimeString(startingTime);
      const conditionToday =
        windowEndingTime !== null &&
        windowEndingTimeDate > startingTimeDate &&
        windowEndingTimeDate > windowStartingTimeDate;

      if (conditionToday) {
        const startTime = createDateFromTimeString(windowStartingTime);
        const endTimeDate = createDateFromTimeString(windowEndingTime); // assuming endTime is in minutes
        graphOptions.dateWindow = [startTime.getTime(), endTimeDate.getTime()];
      } else {
        // conditionally add dateWindow property - checking if the condition is met TOMORROW
        const windowEndingTimeDateTomorrow = createDateFromTimeString(
          windowEndingTime,
          true,
        );
        const windowStartingTimeDateTomorrow = createDateFromTimeString(
          windowStartingTime,
          true,
        );
        const conditiontomorrow =
          windowEndingTimeDateTomorrow > startingTimeDate &&
          windowEndingTimeDateTomorrow > windowStartingTimeDateTomorrow;
        if (conditiontomorrow) {
          const startTime = createDateFromTimeString(windowStartingTime, true);
          const endTimeDate = createDateFromTimeString(windowEndingTime, true); // assuming endTime is in minutes
          graphOptions.dateWindow = [
            startTime.getTime(),
            endTimeDate.getTime(),
          ];
        } else {
          const conditionFromTodayToTomorrow = // this happens when the beginning of the window is today and the end is tomorrow
            windowStartingTimeDate > startingTimeDate &&
            windowEndingTimeDateTomorrow > startingTimeDate &&
            windowEndingTimeDateTomorrow > windowStartingTimeDate &&
            isDayApart(windowStartingTimeDate, windowEndingTimeDateTomorrow) &&
            windowStartingTime !== windowEndingTime;
          if (conditionFromTodayToTomorrow) {
            const startTime = windowStartingTimeDate;
            const endTimeDate = windowEndingTimeDateTomorrow; // assuming endTime is in minutes
            graphOptions.dateWindow = [
              startTime.getTime(),
              endTimeDate.getTime(),
            ];
          } else {
            console.log("fallthrough");
          }
        }
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
  }, [
    plottingData,
    startingTime,
    windowEndingTime,
    windowStartingTime,
    forceRedraw,
  ]);

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
    <Box>
      {/* Enhanced Time Controls */}
      <Card
        elevation={0}
        sx={{
          mb: 3,
          background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
          borderRadius: 3,
          border: "1px solid rgba(148, 163, 184, 0.2)",
        }}
      >
        <CardContent>
          <Typography
            variant="h6"
            sx={{
              mb: 3,
              color: "#475569",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <ClockIcon color="primary" />
            Time Configuration
          </Typography>

          <div className="time-controls-container">
            <div className="time-input-group">
              <Typography
                variant="subtitle2"
                sx={{ mb: 1, color: "#64748b", fontWeight: 500 }}
              >
                Recording Start
              </Typography>
              <TimeInput time={startingTime} setTime={setStartingTime} />
            </div>

            <div className="time-input-group">
              <Typography
                variant="subtitle2"
                sx={{ mb: 1, color: "#64748b", fontWeight: 500 }}
              >
                Window Start
              </Typography>
              <TimeInput
                time={tempWindowStartingTime}
                setTime={setTempWindowStartingTime}
              />
            </div>

            <div className="time-input-group">
              <Typography
                variant="subtitle2"
                sx={{ mb: 1, color: "#64748b", fontWeight: 500 }}
              >
                Window End
              </Typography>
              <TimeInput
                time={tempWindowEndingTime}
                setTime={setTempWindowEndingTime}
              />
            </div>

            <div className="apply-window-button">
              <Button
                variant="contained"
                onClick={handleWindowChange}
                fullWidth
                sx={{
                  background:
                    "linear-gradient(135deg, #64748b 0%, #475569 100%)",
                  boxShadow: "0 4px 20px rgba(100, 116, 139, 0.3)",
                  borderRadius: 2,
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #475569 0%, #334155 100%)",
                    boxShadow: "0 6px 25px rgba(100, 116, 139, 0.4)",
                  },
                }}
              >
                Apply Window
              </Button>
            </div>

            <div className="duration-display">
              <Typography
                variant="subtitle2"
                sx={{ mb: 1, color: "#64748b", fontWeight: 500 }}
              >
                Selection Duration
              </Typography>
              <Paper
                elevation={0}
                sx={{
                  background:
                    "linear-gradient(135deg, rgba(100, 116, 139, 0.1) 0%, rgba(71, 85, 105, 0.1) 100%)",
                  border: "1px solid rgba(100, 116, 139, 0.2)",
                  borderRadius: 2,
                  textAlign: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Chip
                  label={getTimeDifference()}
                  color="primary"
                  variant="filled"
                  sx={{
                    fontSize: "1rem",
                    fontWeight: 600,
                    height: 32,
                    background:
                      "linear-gradient(135deg, #64748b 0%, #475569 100%)",
                  }}
                />
              </Paper>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Chart Container */}
      <Card
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 3,
          border: "1px solid rgba(148, 163, 184, 0.2)",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            p: 2,
            background: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
            borderBottom: "1px solid rgba(148, 163, 184, 0.2)",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: "#475569",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <TimelineIcon color="primary" />
            Tachogram Analysis
          </Typography>
        </Box>

        <Box sx={{ p: 2 }}>
          <div
            id="graphdiv"
            style={{
              width: "100%",
              height: 400,
              borderRadius: 8,
              border: "1px solid rgba(148, 163, 184, 0.1)",
              background: "white",
            }}
          />
        </Box>
      </Card>

      {/* Enhanced Export Button */}
      <Box sx={{ textAlign: "center" }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<DownloadIcon />}
          onClick={handleCut}
          sx={{
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            boxShadow: "0 8px 32px rgba(16, 185, 129, 0.3)",
            borderRadius: 3,
            px: 4,
            py: 2,
            fontSize: "1.1rem",
            fontWeight: 600,
            "&:hover": {
              background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
              boxShadow: "0 12px 40px rgba(16, 185, 129, 0.4)",
              transform: "translateY(-2px)",
            },
            transition: "all 0.3s ease",
          }}
        >
          Cut and Export Data
        </Button>
      </Box>
    </Box>
  );
};

export default Tachogram;
// ||
//         (windowEndingTime !== null &&
//           windowEndingTime > startingTime &&
//           windowEndingTime > windowStartingTime)
