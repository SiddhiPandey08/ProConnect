import { createSlice } from "@reduxjs/toolkit";
import {
  fetchNotifications,
  markNotificationsRead,
} from "../../action/notificationAction";

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    notifications: [],
    unreadCount: 0,
  },
  reducers: {
    addNotification: (state, action) => {
      const notification = action.payload;
      if (notification.type === "message") {
        const senderId = notification.sender?._id || notification.sender;
        const existingIndex = state.notifications.findIndex(
          (item) =>
            item.type === "message" &&
            String(item.sender?._id || item.sender) === String(senderId),
        );
        if (existingIndex >= 0) {
          state.notifications.splice(existingIndex, 1);
          state.notifications.unshift(notification);
        } else {
          state.notifications.unshift(notification);
        }
      } else {
        state.notifications.unshift(notification);
      }
      // Message unread counts are represented by the Messages sidebar item, not this badge.
      state.unreadCount = state.notifications.filter(
        (item) => !item.isRead && item.read !== true && item.type !== "message",
      ).length;
    },
    removeNotification: (state, action) => {
      const { notificationId, senderId } = action.payload;
      state.notifications = state.notifications.filter((item) => {
        if (notificationId && String(item._id) === String(notificationId)) {
          return false;
        }
        if (
          senderId &&
          item.type === "message" &&
          String(item.sender?._id || item.sender) === String(senderId)
        ) {
          return false;
        }
        return true;
      });
      state.unreadCount = state.notifications.filter(
        (item) => !item.isRead && item.read !== true && item.type !== "message",
      ).length;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter(
          (n) => !n.isRead && n.read !== true && n.type !== "message",
        ).length;
      })
      .addCase(markNotificationsRead.fulfilled, (state) => {
        state.unreadCount = 0;
        state.notifications = state.notifications.map((n) => ({
          ...n,
          isRead: true,
          read: true,
        }));
      });
  },
});

export const { addNotification, removeNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
