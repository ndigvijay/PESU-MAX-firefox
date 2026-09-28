import React from "react";
import { Button } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SettingsRow from "./SettingsRow.jsx";
import { settingsActionButtonSx } from "../../styles/styles.js";

// Edit button row
const SettingsEditRow = ({ title, description, onClick, disabled, label = "Edit" }) => (
  <SettingsRow title={title} description={description}>
    <Button
      onClick={onClick}
      disabled={disabled}
      startIcon={<EditIcon sx={{ fontSize: "18px" }} />}
      sx={settingsActionButtonSx}
    >
      {label}
    </Button>
  </SettingsRow>
);

export default SettingsEditRow;
