import React from "react";
import { Box, TextField } from "@mui/material";

const TimeInput = ({ time, setTime, title }) => {
  // local state to hold input value before submitting
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "210px" }}>
      <TextField
        label={title}
        type="time"
        InputLabelProps={{ shrink: true }}
        inputProps={{ step: 1 }}
        value={time}
        onChange={(e) => setTime(e.target.value)}
        size="small"
        fullWidth
      />
    </Box>
  );
};

export default TimeInput;
