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
        size="medium"
        fullWidth
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
            background: "rgba(255, 255, 255, 0.8)",
            "&:hover": {
              background: "rgba(255, 255, 255, 0.9)",
            },
            "&.Mui-focused": {
              background: "white",
              boxShadow: "0 4px 20px rgba(102, 126, 234, 0.15)",
            },
          },
          "& .MuiInputLabel-root": {
            color: "#64748b",
            fontSize: "0.875rem",
            fontWeight: 500,
          },
          "& .MuiInputLabel-root.Mui-focused": {
            color: "#667eea",
          },
        }}
      />
    </Box>
  );
};

export default TimeInput;
