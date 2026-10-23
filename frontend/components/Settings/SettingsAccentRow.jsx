import React, { useState } from "react";
import { Alert, Box, Button, Popover, Stack, ToggleButton } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import SettingsRow from "./SettingsRow.jsx";
import useStoredSetting from "./useStoredSetting.js";
import { popupSecondaryButtonSx } from "../../styles/styles.js";
import theme from "../../Themes/theme.jsx";

// Dark accents carry a swatch token; light palettes carry their own background and accent.
const dotColor = (option) => option.swatch || option.accent.bright;
const dotRing = (option) => option.background || theme.colors.surface;

const dotStyle = (option) => ({
  display: "inline-block",
  width: "16px",
  height: "16px",
  borderRadius: "50%",
  backgroundColor: dotColor(option),
  border: `3px solid ${dotRing(option)}`,
  boxShadow: `0 0 0 1px ${theme.colors.secondaryOutline}`,
});

const pickerSx = (tone, current) => {
  const dark = tone === "dark";
  return {
    minWidth: "140px",
    flexShrink: 0,
    justifyContent: "flex-start",
    gap: "8px",
    padding: "5px 8px",
    border: "1.5px solid",
    borderColor: dark ? dotColor(current) : theme.colors.primary,
    borderRadius: "8px",
    backgroundColor: dark ? theme.colors.surface : theme.colors.onSolid,
    color: theme.colors.secondary,
    fontSize: "12.5px",
    fontWeight: 400,
    whiteSpace: "nowrap",
    textTransform: "none",
    "& .MuiButton-endIcon": { marginLeft: "auto" },
    "&:hover": {
      borderColor: dark ? dotColor(current) : theme.colors.primaryHover,
      backgroundColor: dark ? theme.colors.raised : theme.colors.onSolid,
    },
    "&.Mui-disabled": {
      backgroundColor: theme.colors.raised,
      borderColor: theme.colors.line,
      color: theme.colors.textDisabled,
      "& span": { filter: "grayscale(1)" },
    },
  };
};

const dotSx = (option, selected) => ({
  width: "22px",
  height: "22px",
  minWidth: "22px",
  padding: 0,
  borderRadius: "50% !important",
  border: `3px solid ${dotRing(option)} !important`,
  backgroundColor: `${dotColor(option)} !important`,
  boxShadow: selected
    ? `0 0 0 2px ${theme.colors.primary}`
    : `0 0 0 2px ${theme.colors.secondaryBorder}`,
  "&:hover": {
    backgroundColor: `${dotColor(option)} !important`,
    boxShadow: selected
      ? `0 0 0 2px ${theme.colors.primaryHover}`
      : `0 0 0 2px ${theme.colors.secondaryBorderHover}`,
  },
  "&.Mui-selected": { backgroundColor: `${dotColor(option)} !important` },
});

// Accent row: "grid of dots" picker
const SettingsAccentRow = ({ storageKey, title, description, options, fallback, tone, columns = 6 }) => {
  const initial = fallback || options[0].value;
  const setting = useStoredSetting(storageKey, initial, title);
  const [anchor, setAnchor] = useState(null);
  const selected = options.some((option) => option.value === setting.value)
    ? setting.value
    : initial;
  const current = options.find((option) => option.value === selected) || options[0];


  const pick = (value) => {
    setting.update(value);
  };

  return (
    <Stack spacing={1}>
      <SettingsRow title={title} description={description}>
        <Button
          onClick={(event) => setAnchor(event.currentTarget)}
          disabled={!setting.ready || setting.saving}
          endIcon={<ArrowDropDownIcon />}
          sx={pickerSx(tone, current)}
          aria-label={title}
        >
          <Box component="span" sx={dotStyle(current)} />
          {current.label}
        </Button>
      </SettingsRow>

      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{
          paper: {
            sx: {
              marginTop: "6px",
              borderRadius: "10px",
              backgroundColor: theme.colors.surface,
              border: `1px solid ${theme.colors.line}`,
            },
          },
        }}
      >
        <Box
          sx={{
            padding: "12px",
            display: "grid",
            gridTemplateColumns: `repeat(${columns}, 22px)`,
            gap: "12px",
          }}
        >
          {options.map((option) => (
            <ToggleButton
              key={option.value}
              value={option.value}
              selected={option.value === selected}
              onChange={() => pick(option.value)}
              aria-label={option.label}
              title={option.label}
              sx={dotSx(option, option.value === selected)}
            />
          ))}
        </Box>
      </Popover>

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

export default SettingsAccentRow;
