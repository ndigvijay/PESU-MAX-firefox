import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { loadMorePyqs, selectPyqPage, showPyqPage } from "../../redux/pyqSlice.js";
import theme from "../../Themes/theme.jsx";
import { paginationButtonSx } from "./pyqStyles.js";

const PyqPagination = () => {
  const dispatch = useDispatch();
  const {
    resultsComplete,
    nextPageCursor,
    searchLoading,
    loadingMore,
    bulkDownloading
  } = useSelector((state) => state.pyq);
  const { page, pageCount } = useSelector(selectPyqPage);

  const busy = searchLoading || bulkDownloading || loadingMore;
  const canLoadMore = !resultsComplete && Boolean(nextPageCursor);
  const hasNextPage = page < pageCount || canLoadMore;

  const handleNextPage = () => {
    if (busy || !hasNextPage) {
      return;
    }

    if (page < pageCount) {
      dispatch(showPyqPage(page + 1));
      return;
    }

    dispatch(loadMorePyqs());
  };

  const handlePreviousPage = () => {
    if (page <= 1 || busy) {
      return;
    }

    dispatch(showPyqPage(page - 1));
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
        disabled={page <= 1 || busy}
        sx={{ ...paginationButtonSx, justifySelf: "start" }}
      >
        Previous
      </Button>

      <Typography sx={{ fontSize: "12px", color: theme.colors.secondary, fontWeight: 600 }}>
        {loadingMore ? "Loading..." : `Page ${page}${resultsComplete ? ` of ${pageCount}` : ""}`}
      </Typography>

      <Button
        variant="contained"
        size="small"
        onClick={handleNextPage}
        disabled={busy || !hasNextPage}
        sx={{ ...paginationButtonSx, justifySelf: "end" }}
      >
        Next
      </Button>
    </Box>
  );
};

export default PyqPagination;
