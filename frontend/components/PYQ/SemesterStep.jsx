import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentStep, setSelectedSemester } from "../../redux/pyqSlice.js";
import theme from "../../Themes/theme.jsx";
import { clickableRowCardSx, emptyStateSx, stepHintSx } from "./pyqStyles.js";

const SemesterStep = () => {
  const dispatch = useDispatch();
  const semesters = useSelector((state) => state.pyq.semesters);

  const handleSelectSemester = (semesterValue) => {
    dispatch(setSelectedSemester(semesterValue));
    dispatch(setCurrentStep("courses"));
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <Typography sx={stepHintSx}>
        Select a semester to browse and search its courses
      </Typography>

      <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", paddingBottom: "8px" }}>
        {semesters.map((semester) => (
          <Paper
            key={semester.value}
            elevation={0}
            onClick={() => handleSelectSemester(semester.value)}
            sx={clickableRowCardSx}
          >
            <Typography sx={{ fontSize: "14px", fontWeight: "700", color: theme.colors.secondary }}>
              {semester.label}
            </Typography>
            <Typography sx={{ fontSize: "12px", color: "#666", marginTop: "2px" }}>
              Browse courses and download question papers
            </Typography>
          </Paper>
        ))}

        {semesters.length === 0 && (
          <Typography sx={emptyStateSx}>No semesters found.</Typography>
        )}
      </Box>
    </Box>
  );
};

export default SemesterStep;
