import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  TextField,
  Button,
  Divider,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import { useDispatch, useSelector } from "react-redux";
import { closeCalculator } from "../../redux/attendanceSlice.js";
import theme from "../../Themes/theme.jsx";
import { dialogPaperSx, dialogTitleSx, secondaryButtonSx } from "../../styles/styles.js";

const AttendanceCalculator = () => {
  const dispatch = useDispatch();
  const { calculatorOpen, calculatorCourse } = useSelector(
    (state) => state.attendance
  );
  const [targetPercentage, setTargetPercentage] = useState(75);

  useEffect(() => {
    if (calculatorOpen) {
      setTargetPercentage(75);
    }
  }, [calculatorOpen, calculatorCourse]);

  const handleClose = () => {
    dispatch(closeCalculator());
  };

  const handleTargetChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 0 && value <= 100) {
      setTargetPercentage(value);
    } else if (e.target.value === "") {
      setTargetPercentage(0);
    }
  };

  if (!calculatorCourse) return null;

  const { attended, total, percentage, courseName, courseCode } = calculatorCourse;

  const classesCanMiss = Math.floor(
    (attended * 100 - targetPercentage * total) / targetPercentage
  );

  const classesNeeded =
    targetPercentage < 100
      ? Math.ceil(
          (targetPercentage * total - attended * 100) / (100 - targetPercentage)
        )
      : Infinity;

  const isAboveTarget = percentage >= targetPercentage;
  const canMaintain = classesCanMiss >= 0;

  return (
    <Dialog
      open={calculatorOpen}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: dialogPaperSx }}
    >
      <DialogTitle sx={dialogTitleSx}>Attendance Calculator</DialogTitle>
      <DialogContent>
        {/* Course Info */}
        <Box sx={{ marginBottom: "16px" }}>
          <Typography
            sx={{
              fontSize: "11px",
              color: theme.colors.primary,
              fontWeight: "600",
              letterSpacing: "0.5px",
            }}
          >
            {courseCode}
          </Typography>
          <Typography
            sx={{
              fontSize: "14px",
              fontWeight: "600",
              color: theme.colors.secondary,
              marginBottom: "4px",
            }}
          >
            {courseName}
          </Typography>
          <Typography sx={{ fontSize: "13px", color: theme.colors.textMuted }}>
            Current: {attended}/{total} ({percentage}%)
          </Typography>
        </Box>

        <Divider sx={{ marginBottom: "16px" }} />

        {/* Target Input */}
        <Box sx={{ marginBottom: "20px" }}>
          <Typography
            sx={{
              fontSize: "13px",
              color: theme.colors.secondary,
              fontWeight: "500",
              marginBottom: "8px",
            }}
          >
            Target Percentage:
          </Typography>
          <TextField
            type="number"
            value={targetPercentage}
            onChange={handleTargetChange}
            size="small"
            inputProps={{ min: 0, max: 100 }}
            sx={{
              width: "100px",
              "& .MuiOutlinedInput-root": {
                "&.Mui-focused fieldset": {
                  borderColor: theme.colors.primary,
                },
              },
            }}
            InputProps={{
              endAdornment: (
                <Typography sx={{ color: theme.colors.textMuted, marginLeft: "4px" }}>%</Typography>
              ),
            }}
          />
        </Box>

        <Divider sx={{ marginBottom: "16px" }} />

        {/* Result */}
        <Box>
          {isAboveTarget && canMaintain ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                padding: "12px",
                backgroundColor: theme.colors.successTint,
                borderRadius: "8px",
                border: `1px solid ${theme.colors.successBorder}`,
              }}
            >
              <CheckCircleIcon sx={{ color: theme.colors.success, marginTop: "2px" }} />
              <Box>
                <Typography
                  sx={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: theme.colors.success,
                    marginBottom: "4px",
                  }}
                >
                  You can miss {classesCanMiss} more class{classesCanMiss !== 1 ? "es" : ""}
                </Typography>
                <Typography sx={{ fontSize: "12px", color: theme.colors.textMuted }}>
                  and still maintain {targetPercentage}% attendance
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                padding: "12px",
                backgroundColor: theme.colors.dangerTint,
                borderRadius: "8px",
                border: `1px solid ${theme.colors.dangerBorder}`,
              }}
            >
              <ErrorIcon sx={{ color: theme.colors.danger, marginTop: "2px" }} />
              <Box>
                <Typography
                  sx={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: theme.colors.danger,
                    marginBottom: "4px",
                  }}
                >
                  {classesNeeded === Infinity
                    ? "Cannot reach 100% attendance"
                    : `You need to attend ${classesNeeded} more class${
                        classesNeeded !== 1 ? "es" : ""
                      }`}
                </Typography>
                <Typography sx={{ fontSize: "12px", color: theme.colors.textMuted }}>
                  {classesNeeded !== Infinity
                    ? `to reach ${targetPercentage}% attendance`
                    : "You have already missed some classes"}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>

        {isAboveTarget && canMaintain && classesCanMiss > 0 && (
          <Box sx={{ marginTop: "12px" }}>
            <Typography sx={{ fontSize: "11px", color: theme.colors.textSoft, fontStyle: "italic" }}>
              After missing {classesCanMiss} class{classesCanMiss !== 1 ? "es" : ""}, your
              attendance will be {attended}/{total + classesCanMiss} (
              {Math.floor((attended / (total + classesCanMiss)) * 100)}%)
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ padding: "8px 24px 16px" }}>
        <Button variant="contained" onClick={handleClose} sx={secondaryButtonSx}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AttendanceCalculator;
