import React, { useEffect, useState } from "react";
import {
  Alert,
  CircularProgress,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Switch,
  Typography
} from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import LockIcon from "@mui/icons-material/Lock";
import ClassIcon from "@mui/icons-material/Class";
import PodcastsIcon from "@mui/icons-material/Podcasts";
import VideocamIcon from "@mui/icons-material/Videocam";
import SlideshowIcon from "@mui/icons-material/Slideshow";
import StickyNoteIcon from "@mui/icons-material/StickyNote2";
import AssignmentIcon from "@mui/icons-material/Assignment";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import QuizIcon from "@mui/icons-material/Quiz";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ChecklistIcon from "@mui/icons-material/Checklist";
import LinkIcon from "@mui/icons-material/Link";
import theme from "../../Themes/theme.jsx";
import { dialogPaperSx, dialogTitleSx, popupPrimaryButtonSx, popupSecondaryButtonSx, switchSx } from "../../styles/styles.js";
import {
  defaultMaterialColumns,
  getMaterialColumnsDraft,
  saveMaterialColumns
} from "../../../src/content/materialColumns";

const COLUMN_ICONS = {
  "class": ClassIcon,
  "1": PodcastsIcon,
  "10": VideocamIcon,
  "2": SlideshowIcon,
  "3": StickyNoteIcon,
  "5": AssignmentIcon,
  "6": LibraryBooksIcon,
  "7": QuizIcon,
  "19": HelpOutlineIcon,
  "8": ChecklistIcon,
  "9": LinkIcon
};

const MaterialColumnsDialog = ({ open, onClose }) => {
  const [columns, setColumns] = useState([]);
  const [dragged, setDragged] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    if (!open) {
      setLoading(true);
      return undefined;
    }

    let stale = false;
    setLoading(true);
    setColumns([]);
    setDragged(null);
    setError("");
    getMaterialColumnsDraft()
      .then((draft) => {
        if (!stale) setColumns(draft);
      })
      .catch(() => {
        if (!stale) setError("Could not load material preferences. Please retry.");
      })
      .finally(() => {
        if (!stale) setLoading(false);
      });

    return () => {
      stale = true;
    };
  }, [open, reload]);

  const moveBy = (id, delta) => {
    setColumns((current) => {
      const from = current.findIndex((column) => column.id === id);
      const to = from + delta;
      if (from < 0 || to < 1 || to > current.length - 1) return current;

      const next = [...current];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const moveRelative = (id, targetId, after) => {
    setColumns((current) => {
      const from = current.findIndex((column) => column.id === id);
      const to = current.findIndex((column) => column.id === targetId);
      if (from < 1 || to < 1 || from === to) return current;

      const next = [...current];
      const [moved] = next.splice(from, 1);
      const target = next.findIndex((column) => column.id === targetId);
      next.splice(target + (after ? 1 : 0), 0, moved);
      return next;
    });
  };

  const toggle = (id) => {
    setColumns((current) =>
      current.map((column) => (column.id === id ? { ...column, hidden: !column.hidden } : column))
    );
  };

  const handleSave = async () => {
    if (loading || saving || !columns.length) return;
    setSaving(true);
    setError("");
    try {
      await saveMaterialColumns(columns);
      onClose();
    } catch (error) {
      setError("Could not save material preferences. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: dialogPaperSx }}
    >
      <DialogTitle sx={{ ...dialogTitleSx, paddingBottom: "4px" }}>
        Re-order material types
      </DialogTitle>
      <DialogContent>
        {loading && <CircularProgress size={24} aria-label="Loading material preferences" />}
        {error && (
          <Alert severity="error" action={!columns.length && !loading && (
            <Button variant="contained" disableElevation sx={popupSecondaryButtonSx} size="small" onClick={() => setReload((count) => count + 1)}>
              Retry
            </Button>
          )}>{error}</Alert>
        )}
        <Typography
          variant="body2"
          sx={{ color: theme.colors.textMuted, fontSize: "12px", lineHeight: 1.6 }}
        >
          Drag a row to move the material column, switch it off to hide it. Class always stays first.
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "16px" }}>
          {columns.map((column) => {
            const Icon = COLUMN_ICONS[column.id];

            return (
              <Box
                key={column.id}
                draggable={!column.pinned && !saving}
                onDragStart={(event) => {
                  event.dataTransfer.effectAllowed = "move";
                  event.dataTransfer.setData("text/plain", column.id);
                  setDragged(column.id);
                }}
                onDragOver={(event) => event.preventDefault()}
                onDragEnd={() => setDragged(null)}
                onDrop={(event) => {
                  event.preventDefault();
                  if (!dragged || column.pinned || saving) return;
                  const box = event.currentTarget.getBoundingClientRect();
                  moveRelative(dragged, column.id, event.clientY >= box.top + box.height / 2);
                  setDragged(null);
                }}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 8px",
                  borderRadius: "10px",
                  border: `1px solid ${theme.colors.secondaryLight}`,
                  backgroundColor: column.hidden ? "rgba(255, 255, 255, 0.6)" : "#ffffff",
                  cursor: column.pinned ? "default" : "grab",
                  opacity: dragged === column.id ? 0.45 : 1,
                  transition: "opacity 0.15s ease"
                }}
              >
                <IconButton
                  size="small"
                  disabled={column.pinned || saving}
                  aria-label={`Move ${column.label}`}
                  onKeyDown={(event) => {
                    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
                    event.preventDefault();
                    moveBy(column.id, event.key === "ArrowUp" ? -1 : 1);
                  }}
                  sx={{ padding: "2px" }}
                >
                  <DragIndicatorIcon
                    sx={{
                      fontSize: "18px",
                      color: column.pinned ? theme.colors.secondaryBorder : theme.colors.textMuted
                    }}
                  />
                </IconButton>
                <Box
                  sx={{
                    width: "46px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  {column.pinned ? (
                    <LockIcon
                      titleAccess="Class always stays first"
                      sx={{ fontSize: "17px", color: theme.colors.textMuted }}
                    />
                  ) : (
                    <Switch
                      size="small"
                      disabled={saving}
                      checked={!column.hidden}
                      onChange={() => toggle(column.id)}
                      sx={switchSx}
                      slotProps={{ input: { "aria-label": `${column.label} visibility` } }}
                    />
                  )}
                </Box>
                {Icon && <Icon sx={{ fontSize: "17px", color: theme.colors.secondary }} />}
                <Typography
                  sx={{ fontSize: "13px", fontWeight: 500, color: theme.colors.secondary }}
                >
                  {column.label}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </DialogContent>
      <DialogActions sx={{ padding: "8px 24px 16px", gap: 1 }}>
        <Button variant="contained" disableElevation onClick={onClose} disabled={saving} sx={popupSecondaryButtonSx}>
          Cancel
        </Button>
        <Button
          variant="contained"
          disableElevation
          disabled={loading || saving || !columns.length}
          onClick={() => setColumns(defaultMaterialColumns())}
          sx={popupSecondaryButtonSx}
        >
          Reset
        </Button>
        <Button variant="contained" disableElevation onClick={handleSave} disabled={loading || saving || !columns.length} sx={popupPrimaryButtonSx}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MaterialColumnsDialog;
