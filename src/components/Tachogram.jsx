import React, { useState, useEffect, useRef } from "react";
import Dygraph from "dygraphs";

const logRange = (minDate, maxDate, label) => {
  let start = new Date(minDate).toISOString().split("T")[0];
  let end = new Date(maxDate).toISOString().split("T")[0];
  console.log(label + ": " + start + " to " + end);
};

const parseDiff = (data, selectedColumn) => {
  const localPlottingData = [];
  for (let i = 1; i < data.length - 1; i++) {
    const value =
      parseFloat(data[i + 1][selectedColumn]) -
      parseFloat(data[i][selectedColumn]);
    localPlottingData.push([i, value]);
  }
  console.log("localPlottingData", localPlottingData);
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
const Tachogram = ({ selectedColumn, data }) => {
  const diff = true;
  const [plottingData, setPlottingData] = useState(null);
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
      console.log("preparing dygraph");
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
          // Set an initial date window different from the data extremes
          // so that slider interaction is more evident.
          rangeSelectorCallback: function (minDate, maxDate, yRanges) {
            // callback fired during slider interaction.
            logRange(minDate, maxDate, "Range Selector Callback");
            console.log("2");
          },
          zoomCallback: function (minDate, maxDate, yRanges) {
            // this callback is fired when the main view (zoom) is updated,
            // which happens after the user has finished moving the slider.
            logRange(minDate, maxDate, "Zoom Callback");
            console.log("1");
          },
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
  return <div id="graphdiv" style={{ width: "100%", height: "300px" }}></div>;
};

export default Tachogram;
