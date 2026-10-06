import React, { useMemo } from "react";
import { Alert, Box, Paper, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {
  downloadPyq,
  downloadSelectedPyqsZip,
  setSelectedPyqs,
  togglePyqSelection
} from "../../redux/pyqSlice.js";
import theme from "../../Themes/theme.jsx";
import PyqBulkActionBar from "./PyqBulkActionBar.jsx";
import PyqCourseLabel from "./PyqCourseLabel.jsx";
import PyqLoading from "./PyqLoading.jsx";
import PyqPagination from "./PyqPagination.jsx";
import PyqResultCard from "./PyqResultCard.jsx";
import PyqSearchBar from "./PyqSearchBar.jsx";
import { blueAlertSx, emptyStateSx, errorAlertSx, rowCardSx, stepHintSx } from "./pyqStyles.js";

const TIP_TEXT = "Tip: change the year, then click Search to update the results.";
const tipSx = {
  fontSize: "11px",
  color: theme.colors.primary,
  textAlign: "center",
  paddingTop: "4px",
  paddingBottom: "12px"
};

const ResultsStep = () => {
  const dispatch = useDispatch();
  const {
    selectedCourse,
    selectedPyqs,
    searchQuery,
    searchResults,
    pagesByNumber,
    totalResults,
    lastQuery,
    searchLoading,
    searchError,
    loadMoreError,
    pageNotice,
    downloadingItemId,
    bulkDownloading,
    downloadError,
    bulkDownloadError
  } = useSelector((state) => state.pyq);

  const loadedResults = useMemo(
    () => Object.values(pagesByNumber).flatMap((page) => page.results || []),
    [pagesByNumber]
  );

  const selectableResults = useMemo(
    () => loadedResults.filter((item) => item.downloadPath),
    [loadedResults]
  );

  const selectedCount = useMemo(
    () => selectableResults.filter((item) => selectedPyqs[item.id]).length,
    [selectableResults, selectedPyqs]
  );

  const allSelectableSelected =
    selectableResults.length > 0 && selectedCount === selectableResults.length;

  const busy = searchLoading || bulkDownloading;

  const handleDownload = (item) => {
    dispatch(
      downloadPyq({
        itemId: item.id,
        downloadPath: item.downloadPath,
        title: item.title
      })
    );
  };

  const handleToggleSelectAll = () => {
    if (allSelectableSelected) {
      dispatch(setSelectedPyqs({}));
      return;
    }

    const nextSelection = {};
    selectableResults.forEach((item) => {
      nextSelection[item.id] = true;
    });
    dispatch(setSelectedPyqs(nextSelection));
  };

  const handleBulkDownload = () => {
    const selectedItems = selectableResults
      .filter((item) => selectedPyqs[item.id])
      .map((item) => ({
        id: item.id,
        title: item.title,
        downloadPath: item.downloadPath
      }));

    if (selectedItems.length === 0) {
      return;
    }

    dispatch(
      downloadSelectedPyqsZip({
        items: selectedItems,
        query: lastQuery || searchQuery || selectedCourse?.subjectName || "PYQs"
      })
    );
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <Typography sx={stepHintSx}>Search and download PYQs</Typography>

      {selectedCourse && (
        <Paper elevation={0} sx={rowCardSx}>
          <PyqCourseLabel course={selectedCourse} />
        </Paper>
      )}

      <PyqSearchBar />

      {pageNotice && <Alert severity="info" sx={blueAlertSx}>{pageNotice}</Alert>}
      {searchError && <Alert severity="error" sx={errorAlertSx}>{searchError}</Alert>}
      {downloadError && <Alert severity="error" sx={errorAlertSx}>{downloadError}</Alert>}
      {bulkDownloadError && <Alert severity="error" sx={errorAlertSx}>{bulkDownloadError}</Alert>}

      {busy && <PyqLoading compact />}

      {!busy && (
        <Typography sx={{ fontSize: "12px", color: "#666", marginBottom: "8px" }}>
          {lastQuery
            ? `${totalResults} result${totalResults === 1 ? "" : "s"} for "${lastQuery}"`
            : "Search a course code or custom title to view PYQs"}
        </Typography>
      )}

      <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", paddingBottom: "8px" }}>
        {!busy && searchResults.length > 0 && (
          <PyqBulkActionBar
            selectedCount={selectedCount}
            allSelected={allSelectableSelected}
            bulkDownloading={bulkDownloading}
            disabled={busy}
            onToggleSelectAll={handleToggleSelectAll}
            onDownload={handleBulkDownload}
          />
        )}

        {searchResults.map((item) => (
          <PyqResultCard
            key={item.id}
            item={item}
            selected={Boolean(selectedPyqs[item.id])}
            downloading={downloadingItemId === item.id}
            busy={busy}
            onToggleSelection={(itemId) => dispatch(togglePyqSelection(itemId))}
            onDownload={handleDownload}
          />
        ))}

        {!searchLoading && lastQuery && searchResults.length === 0 && !searchError && (
          <>
            <Typography sx={emptyStateSx}>No PYQs found for this search.</Typography>
            <Typography sx={tipSx}>{TIP_TEXT}</Typography>
          </>
        )}

        {loadMoreError && (
          <Alert severity="error" sx={{ ...errorAlertSx, marginTop: "10px", marginBottom: 0 }}>
            {loadMoreError}
          </Alert>
        )}
      </Box>

      {searchResults.length > 0 && <PyqPagination />}

      <Typography sx={tipSx}>{TIP_TEXT}</Typography>
    </Box>
  );
};

export default ResultsStep;
