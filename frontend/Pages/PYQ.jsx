import React, { useEffect } from "react";
import { Alert, Box } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentPage } from "../redux/sidebarSlice.js";
import {
  clearDownloadFeedback,
  loadPyqCatalog,
  resetPyqState,
  setCurrentStep,
  setSelectedSemester
} from "../redux/pyqSlice.js";
import PyqHeader from "../components/PYQ/PyqHeader.jsx";
import PyqLoading from "../components/PYQ/PyqLoading.jsx";
import SemesterStep from "../components/PYQ/SemesterStep.jsx";
import CourseStep from "../components/PYQ/CourseStep.jsx";
import ResultsStep from "../components/PYQ/ResultsStep.jsx";
import PyqDownloadSnackbars from "../components/PYQ/PyqDownloadSnackbars.jsx";
import { errorAlertSx } from "../components/PYQ/pyqStyles.js";

const PYQ = () => {
  const dispatch = useDispatch();
  const { currentStep, catalogLoading, error } = useSelector((state) => state.pyq);

  useEffect(() => {
    dispatch(loadPyqCatalog());
  }, [dispatch]);

  const handleBack = () => {
    if (currentStep === "results") {
      dispatch(clearDownloadFeedback());
      dispatch(setCurrentStep("courses"));
      return;
    }

    if (currentStep === "courses") {
      dispatch(setSelectedSemester(null));
      dispatch(setCurrentStep("semesters"));
      return;
    }

    dispatch(resetPyqState());
    dispatch(setCurrentPage("home"));
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, overflow: "hidden" }}>
      <PyqHeader onBack={handleBack} />

      {catalogLoading && <PyqLoading />}

      {!catalogLoading && (
        <>
          {error && <Alert severity="error" sx={errorAlertSx}>{error}</Alert>}
          {currentStep === "semesters" && <SemesterStep />}
          {currentStep === "courses" && <CourseStep />}
          {currentStep === "results" && <ResultsStep />}
        </>
      )}

      <PyqDownloadSnackbars />
    </Box>
  );
};

export default PYQ;
