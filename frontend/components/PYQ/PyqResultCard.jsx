import React from "react";
import { Box, Button, Checkbox, CircularProgress, Paper, Typography } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";
import theme from "../../Themes/theme.jsx";
import { checkboxSx, rowCardSx } from "./pyqStyles.js";

const metaSx = { fontSize: "11px", color: theme.colors.textMuted };

const viewButtonSx = {
  backgroundColor: theme.colors.solid,
  color: theme.colors.onSolid,
  minWidth: "40px",
  width: "40px",
  boxShadow: "none",
  transition: "none",
  "& .MuiSvgIcon-root": { color: theme.colors.onSolid },
  "&:hover": {
    backgroundColor: theme.colors.solid,
    boxShadow: "none",
    transform: "none",
    color: theme.colors.onSolid
  },
  "&:focus, &:focus-visible": {
    backgroundColor: theme.colors.solid,
    boxShadow: "none",
    color: theme.colors.onSolid
  }
};

const downloadButtonSx = {
  backgroundColor: theme.colors.solid,
  color: theme.colors.onSolid,
  minWidth: "40px",
  width: "40px",
  "&:hover": { backgroundColor: theme.colors.solidHover }
};

const PyqResultCard = ({ item, selected, downloading, opening, busy, onToggleSelection, onOpen, onDownload }) => (
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
          disabled={!item.canDownload || busy}
          onChange={() => onToggleSelection(item.id)}
          sx={{ ...checkboxSx, padding: "2px" }}
        />

        <Button
          variant="contained"
          size="small"
          aria-label={opening ? "Opening PYQ" : "View PYQ"}
          onClick={() => onOpen(item)}
          disabled={!item.canDownload || opening}
          disableRipple
          disableElevation
          sx={viewButtonSx}
        >
          {opening ? (
            <CircularProgress size={16} sx={{ color: theme.colors.onSolid }} />
          ) : (
            <VisibilityIcon fontSize="small" sx={{ color: theme.colors.onSolid }} />
          )}
        </Button>

        <Button
          variant="contained"
          size="small"
          aria-label={downloading ? "Downloading PYQ" : "Download PYQ"}
          onClick={() => onDownload(item)}
          disabled={!item.canDownload || downloading || busy}
          sx={downloadButtonSx}
        >
          {downloading ? (
            <CircularProgress size={16} sx={{ color: theme.colors.onSolid }} />
          ) : (
            <DownloadIcon fontSize="small" />
          )}
        </Button>
      </Box>
    </Box>
  </Paper>
);

export default PyqResultCard;
