import theme from "../../Themes/theme.jsx";

export const rowCardSx = {
  padding: "12px",
  borderRadius: "12px",
  backgroundColor: theme.colors.secondaryLight,
  border: "1px solid rgba(35, 58, 118, 0.12)",
  marginBottom: "10px"
};

export const clickableRowCardSx = {
  ...rowCardSx,
  cursor: "pointer",
  "&:hover": {
    backgroundColor: theme.colors.primaryLight
  }
};

export const blueAlertSx = {
  marginBottom: "10px",
  fontSize: "12px",
  backgroundColor: theme.colors.secondaryLight,
  color: theme.colors.secondary,
  border: "1px solid rgba(35, 58, 118, 0.18)",
  "& .MuiAlert-icon": {
    color: theme.colors.secondary
  },
  "& .MuiAlert-message": {
    color: theme.colors.secondary
  }
};

export const errorAlertSx = {
  marginBottom: "10px",
  fontSize: "12px"
};

export const paginationButtonSx = {
  textTransform: "none",
  backgroundColor: theme.colors.secondary,
  color: "#fff",
  "&:hover": {
    backgroundColor: theme.colors.secondaryHover
  },
  "&.Mui-disabled": {
    backgroundColor: theme.colors.secondaryLight,
    color: "rgba(35, 58, 118, 0.55)"
  }
};

export const successSnackbarAlertSx = {
  width: "100%",
  fontSize: "12px",
  backgroundColor: theme.colors.secondary,
  color: "#fff",
  "& .MuiAlert-icon": { color: "#fff" },
  "& .MuiAlert-message": { color: "#fff" },
  "& .MuiAlert-action": { color: "#fff" },
  "& .MuiSvgIcon-root": { color: "#fff" }
};

export const stepHintSx = { fontSize: "13px", color: "#555", marginBottom: "8px" };

export const emptyStateSx = {
  fontSize: "13px",
  color: "#777",
  textAlign: "center",
  marginTop: "20px"
};

export const checkboxSx = {
  color: theme.colors.primary,
  "&.Mui-checked": { color: theme.colors.primary }
};

export const LOADING_TEXT = "fetching resources from library";
export const DEFAULT_PYQ_YEAR = String(new Date().getFullYear());
export const PYQ_YEAR_OPTIONS = Array.from(
  { length: 5 },
  (_, index) => String(new Date().getFullYear() - index)
);
