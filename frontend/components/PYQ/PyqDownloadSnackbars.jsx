import React from "react";
import { Alert, Snackbar } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { clearDownloadFeedback } from "../../redux/pyqSlice.js";
import { successSnackbarAlertSx } from "./pyqStyles.js";

const anchorOrigin = { vertical: "bottom", horizontal: "center" };

const PyqDownloadSnackbars = () => {
  const dispatch = useDispatch();
  const { downloadSuccessItemId, bulkDownloadResult } = useSelector((state) => state.pyq);
  const clearFeedback = () => dispatch(clearDownloadFeedback());
  const stats = bulkDownloadResult?.stats;

  return (
    <>
      <Snackbar
        open={Boolean(downloadSuccessItemId)}
        autoHideDuration={4000}
        onClose={clearFeedback}
        anchorOrigin={anchorOrigin}
      >
        <Alert severity="success" onClose={clearFeedback} sx={successSnackbarAlertSx}>
          Download started successfully.
        </Alert>
      </Snackbar>

      <Snackbar
        open={Boolean(bulkDownloadResult)}
        autoHideDuration={6000}
        onClose={clearFeedback}
        anchorOrigin={anchorOrigin}
      >
        <Alert severity="success" onClose={clearFeedback} sx={successSnackbarAlertSx}>
          ZIP download started for {stats?.successful || 0} PYQs.
          {(stats?.failed || 0) > 0 ? ` ${stats.failed} item(s) could not be added.` : ""}
        </Alert>
      </Snackbar>
    </>
  );
};

export default PyqDownloadSnackbars;
