import { createAsyncThunk } from "@reduxjs/toolkit";
import { clientServer } from "@/config/index.jsx";

export const fetchNotifications = createAsyncThunk(
  "notifications/fetch",
  async ({ token }) => {
    const response = await clientServer.get(`/notifications?token=${token}`);
    return response.data.notifications;
  },
);

export const markNotificationsRead = createAsyncThunk(
  "notifications/markRead",
  async ({ token }) => {
    await clientServer.post("/notifications/mark_read", { token });
  },
);
