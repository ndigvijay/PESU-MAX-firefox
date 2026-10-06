import React from "react";
import { Typography } from "@mui/material";
import theme from "../../Themes/theme.jsx";

const PyqCourseLabel = ({ course }) => (
  <>
    <Typography sx={{ fontSize: "11px", color: theme.colors.primary, fontWeight: "700" }}>
      {course.subjectCode}
    </Typography>
    <Typography sx={{ fontSize: "13px", color: theme.colors.secondary, fontWeight: "600" }}>
      {course.subjectName}
    </Typography>
  </>
);

export default PyqCourseLabel;
