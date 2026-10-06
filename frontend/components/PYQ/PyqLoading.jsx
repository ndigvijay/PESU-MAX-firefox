import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import theme from "../../Themes/theme.jsx";
import { LOADING_TEXT } from "./pyqStyles.js";

const PyqLoading = ({ compact = false }) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      gap: compact ? "8px" : "10px",
      ...(compact ? { padding: "12px 0" } : { flex: 1 })
    }}
  >
    <CircularProgress size={compact ? 24 : 40} sx={{ color: theme.colors.primary }} />
    <Typography
      sx={{
        fontSize: "12px",
        color: theme.colors.secondary,
        ...(compact ? {} : { letterSpacing: "0.2px", textAlign: "center", whiteSpace: "pre-line" })
      }}
    >
      {LOADING_TEXT}
    </Typography>
  </Box>
);

export default PyqLoading;
