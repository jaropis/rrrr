import React from "react";
import { Box, TextField } from "@mui/material";

const TimeInput = ({ time, setTime, title }) => {
  return (
    <Box sx={{ width: "100%" }}>
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
