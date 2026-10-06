import React from "react";
import { Box, Button, Checkbox, Paper, Typography } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import theme from "../../Themes/theme.jsx";
import { checkboxSx, rowCardSx } from "./pyqStyles.js";

const PyqBulkActionBar = ({
  selectedCount,
  allSelected,
  bulkDownloading,
  disabled,
  onToggleSelectAll,
  onDownload
}) => (
  <Paper
    elevation={0}
    sx={{
      ...rowCardSx,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "12px"
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <Checkbox
        size="small"
        checked={allSelected}
        indeterminate={selectedCount > 0 && !allSelected}
        onChange={onToggleSelectAll}
        inputProps={{ "aria-label": "Select all PYQs" }}
        sx={checkboxSx}
      />
      <Typography sx={{ fontSize: "12px", color: theme.colors.secondary, fontWeight: 600 }}>
        {selectedCount} selected
      </Typography>
    </Box>

    <Button
      variant="contained"
      size="small"
      startIcon={<DownloadIcon fontSize="small" />}
      onClick={onDownload}
      disabled={selectedCount === 0 || disabled}
      sx={{
        backgroundColor: theme.colors.primary,
        textTransform: "none",
        minWidth: "122px",
        "&:hover": { backgroundColor: theme.colors.primaryHover }
      }}
    >
      {bulkDownloading ? "Creating ZIP" : "Download ZIP"}
    </Button>
  </Paper>
);

export default PyqBulkActionBar;
