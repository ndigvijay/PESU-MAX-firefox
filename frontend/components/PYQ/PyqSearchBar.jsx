import React from "react";
import { Box, Button, FormControl, MenuItem, Select, TextField, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useDispatch, useSelector } from "react-redux";
import { searchPyqs, setSearchQuery, setSelectedYear } from "../../redux/pyqSlice.js";
import theme from "../../Themes/theme.jsx";
import { selectSx } from "../../styles/styles.js";
import { PYQ_YEAR_OPTIONS } from "./pyqStyles.js";

const pendingFieldSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: theme.colors.secondaryLight,
    "& fieldset": { borderColor: theme.colors.secondary, borderWidth: "2px" },
    "&:hover fieldset": { borderColor: theme.colors.secondary },
    "&.Mui-focused fieldset": { borderColor: theme.colors.secondary }
  }
};

const PyqSearchBar = () => {
  const dispatch = useDispatch();
  const { searchQuery, selectedYear, lastQuery, lastSearchYear, searchLoading } = useSelector(
    (state) => state.pyq
  );

  const hasPendingSearch = Boolean(
    lastQuery
    && searchQuery.trim()
    && (searchQuery.trim() !== lastQuery || selectedYear !== lastSearchYear)
    && !searchLoading
  );

  const handleSearch = () => {
    const query = searchQuery.trim();
    if (!query) {
      return;
    }

    dispatch(searchPyqs({ query, year: selectedYear }));
  };

  const handleSearchKey = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <>
      <Box sx={{ display: "flex", gap: "8px", marginBottom: "10px", alignItems: "stretch" }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search subject or title"
          value={searchQuery}
          onChange={(event) => dispatch(setSearchQuery(event.target.value))}
          onKeyDown={handleSearchKey}
          sx={hasPendingSearch ? pendingFieldSx : undefined}
        />
        <FormControl
          size="small"
          sx={{
            minWidth: "92px",
            ...(hasPendingSearch ? {
              "& .MuiOutlinedInput-root": {
                backgroundColor: theme.colors.secondaryLight,
                "& fieldset": { borderColor: theme.colors.secondary, borderWidth: "2px" }
              }
            } : {})
          }}
        >
          <Select
            value={selectedYear}
            onChange={(event) => dispatch(setSelectedYear(event.target.value))}
            sx={selectSx}
          >
            {PYQ_YEAR_OPTIONS.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          aria-label="Search PYQs"
          onClick={handleSearch}
          disabled={searchLoading || !searchQuery.trim()}
          sx={{
            minWidth: "46px",
            backgroundColor: theme.colors.primary,
            color: "#fff",
            "&:hover": { backgroundColor: theme.colors.primaryHover }
          }}
        >
          <SearchIcon fontSize="small" />
        </Button>
      </Box>

      {hasPendingSearch && (
        <Typography
          sx={{
            fontSize: "11px",
            color: theme.colors.primary,
            marginTop: "-4px",
            marginBottom: "8px",
            fontWeight: 600
          }}
        >
          Search settings changed. Click Search to update the results.
        </Typography>
      )}
    </>
  );
};

export default PyqSearchBar;
