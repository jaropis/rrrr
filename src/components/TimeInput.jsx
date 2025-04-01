import React, { useState } from "react";
import { Box, TextField, Button } from "@mui/material";

const TimeInput = ({ time, setTime, title }) => {
  // local state to hold input value before submitting
  const [inputTime, setInputTime] = useState("00:00:00");

  // handling time input change
  const handleTimeChange = (e) => {
    setInputTime(e.target.value);
  };

  // applying the time when button is clicked
  const applyStartTime = () => {
    if (inputTime) {
      setTime(inputTime);
    }
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "210px" }}>
      <TextField
        label={title}
        type="time"
        InputLabelProps={{ shrink: true }}
        inputProps={{ step: 1 }}
        value={inputTime}
        onChange={handleTimeChange}
        size="small"
        fullWidth
      />
      <Button variant="contained" color="primary" onClick={applyStartTime}>
        Apply
      </Button>
    </Box>
  );
};

export default TimeInput;
