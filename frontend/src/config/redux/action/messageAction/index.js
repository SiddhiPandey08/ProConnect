import { createAsyncThunk } from "@reduxjs/toolkit";
import { clientServer } from "../../../index";

const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : null;

export const fetchConversations = createAsyncThunk(
  "messages/fetchConversations",
  async (_, thunkAPI) => {
    try {
      const response = await clientServer.get("/messages/conversations", {
        params: { token: getToken() },
      });
      return response.data.conversations;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: error.message },
      );
    }
  },
);

export const fetchMessages = createAsyncThunk(
  "messages/fetchMessages",
  async ({ userId, cursor, limit = 20 }, thunkAPI) => {
    try {
      const response = await clientServer.get(`/messages/${userId}`, {
        params: { token: getToken(), cursor, limit },
      });
      return { userId, ...response.data, older: Boolean(cursor) };
    } catch (error) {
      return thunkAPI.rejectWithValue({
        userId,
        error: error.response?.data || { message: error.message },
      });
    }
  },
);

export const sendMessage = createAsyncThunk(
  "messages/sendMessage",
  async ({ userId, content, clientId }, thunkAPI) => {
    try {
      const response = await clientServer.post(`/messages/${userId}`, {
        token: getToken(),
        content,
      });
      return { userId, clientId, message: response.data.message };
    } catch (error) {
      return thunkAPI.rejectWithValue({
        userId,
        clientId,
        error: error.response?.data || { message: error.message },
      });
    }
  },
);

export const markMessagesRead = createAsyncThunk(
  "messages/markMessagesRead",
  async (userId, thunkAPI) => {
    try {
      await clientServer.patch(`/messages/${userId}/read`, null, {
        params: { token: getToken() },
      });
      return userId;
    } catch (error) {
      return thunkAPI.rejectWithValue({
        userId,
        error: error.response?.data || { message: error.message },
      });
    }
  },
);
