import React from "react";
import { Box, Button, Checkbox, CircularProgress, Paper, Typography } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";
import theme from "../../Themes/theme.jsx";
import { checkboxSx, rowCardSx } from "./pyqStyles.js";

const metaSx = { fontSize: "11px", color: "#666" };

const viewButtonSx = {
  backgroundColor: theme.colors.secondary,
  color: "#fff",
  minWidth: "40px",
  width: "40px",
  boxShadow: "none",
  transition: "none",
  "& .MuiSvgIcon-root": { color: "#fff" },
  "&:hover": {
    backgroundColor: theme.colors.secondary,
    boxShadow: "none",
    transform: "none",
    color: "#fff"
  },
  "&:focus, &:focus-visible": {
    backgroundColor: theme.colors.secondary,
    boxShadow: "none",
    color: "#fff"
  }
};

const downloadButtonSx = {
  backgroundColor: theme.colors.secondary,
  minWidth: "40px",
  width: "40px",
  "&:hover": { backgroundColor: theme.colors.secondaryHover }
};

const PyqResultCard = ({ item, selected, downloading, busy, onToggleSelection, onDownload }) => (
  <Paper elevation={0} sx={rowCardSx}>
    <Box sx={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: "13px",
            color: theme.colors.secondary,
            fontWeight: "700",
            lineHeight: 1.35,
            marginBottom: "6px"
          }}
        >
          {item.title}
        </Typography>
        <Typography sx={metaSx}>Call No: {item.callNo || "N/A"}</Typography>
        <Typography sx={metaSx}>Year/Ed: {item.yearEdition || "N/A"}</Typography>
        <Typography sx={metaSx}>ID: {item.recordId || "N/A"}</Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <Checkbox
          size="small"
          checked={selected}
          disabled={!item.downloadPath || busy}
          onChange={() => onToggleSelection(item.id)}
          sx={{ ...checkboxSx, padding: "2px" }}
        />

        <Button
          component="a"
          href={item.downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          variant="contained"
          size="small"
          aria-label="View PYQ"
          disabled={!item.downloadUrl}
          disableRipple
          disableElevation
          sx={viewButtonSx}
        >
          <VisibilityIcon fontSize="small" sx={{ color: "#fff" }} />
        </Button>

        <Button
          variant="contained"
          size="small"
          aria-label={downloading ? "Downloading PYQ" : "Download PYQ"}
          onClick={() => onDownload(item)}
          disabled={!item.downloadPath || downloading || busy}
          sx={downloadButtonSx}
        >
          {downloading ? (
            <CircularProgress size={16} sx={{ color: "#fff" }} />
          ) : (
            <DownloadIcon fontSize="small" />
          )}
        </Button>
      </Box>
    </Box>
  </Paper>
);

export default PyqResultCard;
