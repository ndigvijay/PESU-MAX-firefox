import React from "react";
import { Alert, Button, MenuItem, Select, Stack } from "@mui/material";
import SettingsRow from "./SettingsRow.jsx";
import { selectSx, popupSecondaryButtonSx } from "../../styles/styles.js";
import theme from "../../Themes/theme.jsx";
import useStoredSetting from "./useStoredSetting.js";

const optionLabel = (option) => (
  <span style={option.stack ? { fontFamily: option.stack } : undefined}>{option.label}</span>
);

// Select Row
const SettingsSelectRow = ({ storageKey, title, description, options }) => {
  const setting = useStoredSetting(storageKey, options[0].value, title);
  const value = options.some((option) => option.value === setting.value)
    ? setting.value : options[0].value;

  const renderValue = (selected) =>
    optionLabel(options.find((option) => option.value === selected) || options[0]);

  return (
    <Stack spacing={1}>
      <SettingsRow title={title} description={description}>
        <Select
          value={value}
          onChange={(event) => setting.update(event.target.value)}
          disabled={!setting.ready || setting.saving}
          size="small"
          renderValue={renderValue}
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
              {optionLabel(option)}
            </MenuItem>
          ))}
        </Select>
      </SettingsRow>
      {setting.error && (
        <Alert severity="error" action={!setting.ready && (
          <Button
            variant="contained"
            disableElevation
            sx={popupSecondaryButtonSx}
            size="small"
            onClick={setting.retry}
          >
            Retry
          </Button>
        )}>
          {setting.error}
        </Alert>
      )}
    </Stack>
  );
};

export default SettingsSelectRow;
