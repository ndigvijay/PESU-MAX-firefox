import React from "react";
import { Alert, Button, MenuItem, Select, Stack } from "@mui/material";
import SettingsRow from "./SettingsRow.jsx";
import { selectSx, popupSecondaryButtonSx } from "../../styles/styles.js";
import theme from "../../Themes/theme.jsx";
import useStoredSetting from "./useStoredSetting.js";

// Select Row
const SettingsSelectRow = ({ storageKey, title, description, options }) => {
  const setting = useStoredSetting(storageKey, options[0].value, title);
  const value = options.some((option) => option.value === setting.value)
    ? setting.value : options[0].value;

  return (
    <Stack spacing={1}>
      <SettingsRow title={title} description={description}>
        <Select
          value={value}
          onChange={(event) => setting.update(event.target.value)}
          disabled={!setting.ready || setting.saving}
          size="small"
          sx={{
            ...selectSx,
            minWidth: "140px",
            "& .MuiOutlinedInput-notchedOutline": { borderColor: theme.colors.primary },
            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: theme.colors.primaryHover },
          }}
          slotProps={{ input: { "aria-label": title } }}
        >
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </SettingsRow>
      {setting.error && (
        <Alert severity="error" action={!setting.ready && (
          <Button variant="contained" disableElevation sx={popupSecondaryButtonSx} size="small" onClick={setting.retry}>Retry</Button>
        )}>
          {setting.error}
        </Alert>
      )}
    </Stack>
  );
};

export default SettingsSelectRow;
