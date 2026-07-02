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
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter((n) => !n.isRead).length;
      })
      .addCase(markNotificationsRead.fulfilled, (state) => {
        state.unreadCount = 0;
        state.notifications = state.notifications.map((n) => ({
          ...n,
          isRead: true,
        }));
      });
  },
});

export const { addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
