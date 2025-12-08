import React, { useState, useEffect, useRef } from "react";
import Dygraph from "dygraphs";
import {
  Button,
  Box,
  Typography,
  TextField,
  IconButton,
  Collapse,
} from "@mui/material";
import {
  TimelineOutlined,
  FileDownloadOutlined,
  ScheduleOutlined,
  KeyboardArrowDown,
  KeyboardArrowUp,
  TimerOutlined,
} from "@mui/icons-material";

function isDayApart(date1, date2) {
  const day1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const day2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
  const diffMs = Math.abs(day2 - day1);
  return diffMs === 86400000;
}

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
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}

function createDateFromTimeString(timeString, nextDay = false) {
  const [hours, minutes, seconds] = timeString.split(":").map(Number);
  const date = new Date();
  date.setHours(hours || 0);
  date.setMinutes(minutes || 0);
  date.setSeconds(seconds || 0);
  date.setMilliseconds(0);
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
  const logRange = (min, max) => {
    setMinmax([min, max]);
    setLastChanged("minmax");
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
    let header;
    if (headerPresent) {
      header = [...data[0]];
    } else {
      header = ["timetrack", "RR", "annot"];
    }
    const offset = Number(headerPresent) + Number(diff);
    let cutData = data
      .slice(startIndex + offset, endIndex + offset + 1)
      .map((row) => [...row]);
    let cutPlottingData = plottingData.slice(startIndex, endIndex + 1);
    let dontTouch;
    if (diff) {
      for (let idx = 0; idx < cutData.length; idx++) {
        if (idx !== dontTouch) {
          cutPlottingData[idx][2] = cutData[idx][1];
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
  const [isTimeControlsExpanded, setIsTimeControlsExpanded] = useState(true);
  const tachoGraph = useRef();

  const handleWindowChange = () => {
    setWindowStartingTime(tempWindowStartingTime);
    setWindowEndingTime(tempWindowEndingTime);
    setLastChanged("window");
    setForceRedraw((prev) => prev + 1);
  };

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
        ylabel: "RR (ms)",
        axes: {
          x: {
            valueFormatter: function (ms) {
              const date = new Date(ms);
              return date.toTimeString().substring(0, 8);
            },
            axisLabelFormatter: function (ms) {
              const date = new Date(ms);
              return date.toTimeString().substring(0, 8);
            },
          },
        },
        showRangeSelector: true,
        drawCallback: function (dygraph, isInitial) {
          const range = dygraph.xAxisRange();
          const minDate = range[0];
          const maxDate = range[1];
          logRange(minDate, maxDate);
        },
        rangeSelectorHeight: 80,
        rangeSelectorPlotFillColor: "rgba(13, 148, 136, 0.15)",
        rangeSelectorPlotStrokeColor: "#0d9488",
        colors: ["#0d9488"],
        strokeWidth: 1.5,
        highlightCircleSize: 4,
        gridLineColor: "#e7e5e4",
        axisLineColor: "#d6d3d1",
      };

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
        const endTimeDate = createDateFromTimeString(windowEndingTime);
        graphOptions.dateWindow = [startTime.getTime(), endTimeDate.getTime()];
      } else {
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
          const endTimeDate = createDateFromTimeString(windowEndingTime, true);
          graphOptions.dateWindow = [
            startTime.getTime(),
            endTimeDate.getTime(),
          ];
        } else {
          const conditionFromTodayToTomorrow =
            windowStartingTimeDate > startingTimeDate &&
            windowEndingTimeDateTomorrow > startingTimeDate &&
            windowEndingTimeDateTomorrow > windowStartingTimeDate &&
            isDayApart(windowStartingTimeDate, windowEndingTimeDateTomorrow) &&
            windowStartingTime !== windowEndingTime;
          if (conditionFromTodayToTomorrow) {
            const startTime = windowStartingTimeDate;
            const endTimeDate = windowEndingTimeDateTomorrow;
            graphOptions.dateWindow = [
              startTime.getTime(),
              endTimeDate.getTime(),
            ];
          }
        }
      }

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
    return "0s";
  };

  return (
    <Box>
      {/* Time Controls Section */}
      <Box className="section" sx={{ mb: 2 }}>
        <Box
          className="section__header"
          sx={{ cursor: "pointer" }}
          onClick={() => setIsTimeControlsExpanded(!isTimeControlsExpanded)}
        >
          <Box className="section__title">
            <ScheduleOutlined className="section__title-icon" />
            <span>Time Configuration</span>
          </Box>
          <IconButton size="small">
            {isTimeControlsExpanded ? (
              <KeyboardArrowUp />
            ) : (
              <KeyboardArrowDown />
            )}
          </IconButton>
        </Box>

        <Collapse in={isTimeControlsExpanded}>
          <Box className="section__content">
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(5, 1fr)",
                },
                gap: 2,
                alignItems: "end",
              }}
            >
              {/* Recording Start */}
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 0.5, color: "text.secondary" }}
                >
                  Recording Start
                </Typography>
                <TextField
                  type="time"
                  value={startingTime}
                  onChange={(e) => setStartingTime(e.target.value)}
                  size="small"
                  fullWidth
                  slotProps={{
                    htmlInput: { step: 1 },
                  }}
                />
              </Box>

              {/* Window Start */}
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 0.5, color: "text.secondary" }}
                >
                  Window Start
                </Typography>
                <TextField
                  type="time"
                  value={tempWindowStartingTime}
                  onChange={(e) => setTempWindowStartingTime(e.target.value)}
                  size="small"
                  fullWidth
                  slotProps={{
                    htmlInput: { step: 1 },
                  }}
                />
              </Box>

              {/* Window End */}
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 0.5, color: "text.secondary" }}
                >
                  Window End
                </Typography>
                <TextField
                  type="time"
                  value={tempWindowEndingTime}
                  onChange={(e) => setTempWindowEndingTime(e.target.value)}
                  size="small"
                  fullWidth
                  slotProps={{
                    htmlInput: { step: 1 },
                  }}
                />
              </Box>

              {/* Apply Button */}
              <Box>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={handleWindowChange}
                  sx={{ height: 40 }}
                >
                  Apply Window
                </Button>
              </Box>

              {/* Duration Display */}
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 0.5, color: "text.secondary" }}
                >
                  Selection Duration
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    px: 1.5,
                    py: 1,
                    bgcolor: "grey.100",
                    borderRadius: 1,
                    height: 40,
                  }}
                >
                  <TimerOutlined
                    sx={{ fontSize: 18, color: "primary.main" }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 500,
                      color: "text.primary",
                    }}
                  >
                    {getTimeDifference()}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Collapse>
      </Box>

      {/* Chart Section */}
      <Box className="section">
        <Box className="section__header">
          <Box className="section__title">
            <TimelineOutlined className="section__title-icon" />
            <span>Tachogram</span>
          </Box>
        </Box>

        <Box sx={{ p: 2 }}>
          <div
            id="graphdiv"
            style={{
              width: "100%",
              height: 400,
            }}
          />
        </Box>

        {/* Export Button */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            p: 2,
            borderTop: "1px solid",
            borderColor: "divider",
            bgcolor: "grey.50",
          }}
        >
          <Button
            variant="contained"
            size="large"
            startIcon={<FileDownloadOutlined />}
            onClick={handleCut}
          >
            Export Selection
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Tachogram;
