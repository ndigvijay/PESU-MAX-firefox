import React from "react";
import { useDispatch } from "react-redux";
import { Accordion, AccordionDetails, AccordionSummary, Box, IconButton, Typography } from "@mui/material";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { setCurrentPage } from "../redux/sidebarSlice.js";
import theme from "../Themes/theme.jsx";
import { settingsRowDescriptionSx, settingsRowTitleSx } from "../styles/styles.js";
import changeLog from "../../change_log.json";

const ChangeList = ({ title, items }) => {
  if (items.length === 0) return null;

  return (
    <Box sx={{ marginBottom: "8px" }}>
      <Typography sx={{ ...settingsRowTitleSx, fontSize: "13px", marginBottom: "2px" }}>
        {title}
      </Typography>
      <Box component="ul" sx={{ margin: 0, paddingLeft: "18px" }}>
        {items.map((item) => (
          <Typography component="li" key={item} sx={{ ...settingsRowDescriptionSx, color: theme.colors.secondary }}>
            {item}
          </Typography>
        ))}
      </Box>
    </Box>
  );
};

const Changelog = () => {
  const dispatch = useDispatch();

  return (
    <Box sx={{ padding: "12px", display: "flex", flexDirection: "column", minHeight: 0, overflowY: "auto" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
        <IconButton
          onClick={() => dispatch(setCurrentPage("home"))}
          aria-label="Back to home"
          size="small"
          sx={{ color: theme.colors.secondary, padding: "2px" }}
        >
          <KeyboardBackspaceIcon sx={{ fontSize: "20px" }} />
        </IconButton>
        <Typography variant="h6" sx={{ color: theme.colors.secondary, fontWeight: "bold", fontSize: "17px" }}>
          Changelog
        </Typography>
      </Box>

      {changeLog.map((release, index) => (
        <Accordion
          key={release.version}
          defaultExpanded={index === 0}
          disableGutters
          elevation={0}
          sx={{
            border: `1px solid ${theme.colors.secondaryBorder}`,
            borderRadius: "8px",
            marginBottom: "8px",
            backgroundColor: "transparent",
            "&:before": { display: "none" },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: theme.colors.secondary }} />}
            sx={{ minHeight: "40px", "& .MuiAccordionSummary-content": { margin: "8px 0", alignItems: "baseline", gap: "8px" } }}
          >
            <Typography sx={{ color: theme.colors.primary, fontWeight: 700, fontSize: "14px" }}>
              {release.version}
            </Typography>
            <Typography sx={settingsRowDescriptionSx}>{release.date}</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ paddingTop: 0 }}>
            <ChangeList title="New" items={release.feats} />
            <ChangeList title="Fixes" items={release.fixes} />
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default Changelog;
