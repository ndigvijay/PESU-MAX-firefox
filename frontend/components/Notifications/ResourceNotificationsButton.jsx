import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, IconButton } from "@mui/material";
import NotificationsIcon from '@mui/icons-material/Notifications';
import { setCurrentPage } from "../../redux/sidebarSlice.js";
import { fetchResourceNotifications, selectUnreadCount } from "../../redux/notificationsSlice.js";
import { subscribeToResourceNotifications } from "../../../src/services/resourceNotificationService.js";
import theme from "../../Themes/theme.jsx";

const ResourceNotificationsButton = () => {
  const dispatch = useDispatch();
  const unreadCount = useSelector(selectUnreadCount);
  const hasUnread = unreadCount > 0;

  useEffect(() => {
    dispatch(fetchResourceNotifications());
    return subscribeToResourceNotifications(() => dispatch(fetchResourceNotifications()));
  }, [dispatch]);

  return (
    <Box sx={{ position: "relative" }}>
      <IconButton
        onClick={() => dispatch(setCurrentPage("notifications"))}
        aria-label={hasUnread ? `Open notifications, ${unreadCount} unread` : "Open notifications"}
        size="large"
        sx={{ color: theme.colors.secondary }}
      >
        <NotificationsIcon fontSize="large" />
      </IconButton>
      {hasUnread && (
        <Box
          sx={{
            position: "absolute",
            top: "4px",
            right: "4px",
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            backgroundColor: theme.colors.primary,
            border: "2px solid #fff",
            pointerEvents: "none"
          }}
        />
      )}
    </Box>
  );
};

export default ResourceNotificationsButton;
