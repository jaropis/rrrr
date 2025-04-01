import React, { useState } from "react";
import { Box, Typography, TextField, Button, Paper } from "@mui/material";

const TimeInput = ({ startingTime, setStartingTime }) => {
  // local state to hold input value before submitting
  const [inputTime, setInputTime] = useState("13:15:13");

  // handling time input change
  const handleTimeChange = (e) => {
    setInputTime(e.target.value);
  };

  // applying the time when button is clicked
  const applyStartTime = () => {
    if (inputTime) {
      setStartingTime(inputTime);
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Set Starting Time
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <TextField
          id="startTimeInput"
          label="Starting Time"
          type="time"
          InputLabelProps={{ shrink: true }}
          inputProps={{ step: 1 }}
          value={inputTime}
          onChange={handleTimeChange}
          size="small"
        />
        <Button variant="contained" color="primary" onClick={applyStartTime}>
          Apply Starting Time
        </Button>
      </Box>
    </Paper>
  );
};

export default TimeInput;
