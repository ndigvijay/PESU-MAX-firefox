import React from "react";
import { Box, IconButton, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import theme from "../../Themes/theme.jsx";

const PyqHeader = ({ onBack }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "12px 0",
      marginLeft: "-8px"
    }}
  >
    <IconButton aria-label="Back" onClick={onBack} sx={{ color: theme.colors.secondary }}>
      <ArrowBackIcon />
    </IconButton>
    <Typography variant="h6" sx={{ fontWeight: "bold", color: theme.colors.secondary }}>
      Download PYQs
    </Typography>
  </Box>
);

export default PyqHeader;
