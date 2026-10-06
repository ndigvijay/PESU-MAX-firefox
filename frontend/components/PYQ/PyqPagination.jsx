import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { loadMorePyqs, showPyqPage } from "../../redux/pyqSlice.js";
import theme from "../../Themes/theme.jsx";
import { paginationButtonSx } from "./pyqStyles.js";

const PyqPagination = () => {
  const dispatch = useDispatch();
  const {
    currentPage,
    pagesByNumber,
    hasMore,
    nextPageCursor,
    searchLoading,
    loadingMore,
    bulkDownloading
  } = useSelector((state) => state.pyq);

  const busy = searchLoading || bulkDownloading || loadingMore;
  const hasCachedNextPage = Boolean(pagesByNumber[currentPage + 1]);

  const handleNextPage = () => {
    if (busy || (!hasCachedNextPage && (!hasMore || !nextPageCursor))) {
      return;
    }

    if (hasCachedNextPage) {
      dispatch(showPyqPage(currentPage + 1));
      return;
    }

    dispatch(loadMorePyqs());
  };

  const handlePreviousPage = () => {
    if (currentPage <= 1 || busy) {
      return;
    }

    dispatch(showPyqPage(currentPage - 1));
  };

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center",
        gap: "8px",
        padding: "12px 0 4px"
      }}
    >
      <Button
        variant="contained"
        size="small"
        onClick={handlePreviousPage}
        disabled={currentPage <= 1 || busy}
        sx={{ ...paginationButtonSx, justifySelf: "start" }}
      >
        Previous
      </Button>

      <Typography sx={{ fontSize: "12px", color: theme.colors.secondary, fontWeight: 600 }}>
        {loadingMore ? "Loading..." : `Page ${currentPage}`}
      </Typography>

      <Button
        variant="contained"
        size="small"
        onClick={handleNextPage}
        disabled={busy || (!hasMore && !hasCachedNextPage)}
        sx={{ ...paginationButtonSx, justifySelf: "end" }}
      >
        Next
      </Button>
    </Box>
  );
};

export default PyqPagination;
