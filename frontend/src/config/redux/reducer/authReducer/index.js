import { createSlice } from "@reduxjs/toolkit";
import { getAllUsers, loginUser, registerUser } from "../../action/authAction";
import { getAboutUser } from "../../action/authAction";
import {
  getConnectionsRequest,
  getConnectionRequestsForMe,
} from "../../action/authAction";

const initialState = {
  user: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  loggedIn: false,
  profileFetched: false,
  isTokenPresent: false,
  connections: [],
  connectionRequests: [],
  message: "",
  all_users: [],
  all_users_fetched: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    reset: () => initialState,
    handleLoginUser: (state) => {
      state.message = "Login successful";
    },
    emptyMessage: (state) => {
      state.message = "";
    },
    setIsTokenPresent: (state) => {
      state.isTokenPresent = true;
    },
    setIsTokenNotPresent: (state) => {
      state.isTokenPresent = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.message = "Knocking on the door...";
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.loggedIn = true;
        state.isError = false;
        state.user = action.payload;
        state.message = "Login successful";
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message =
          action.payload?.message || action.error.message || "Login failed";
      })
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.message = "Registering user...";
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.loggedIn = false;
        state.isError = false;
        state.user = action.payload;
        state.message = "Registration successful , please login to continue";
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message =
          action.payload?.message || action.payload || "Registration failed";
      })
      .addCase(getAboutUser.fulfilled, (state, action) => {
        state.profileFetched = true;
        state.user = action.payload.user;
        state.isError = false;
        state.isLoading = false;
        state.loggedIn = true;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.isError = false;
        state.isLoading = false;
        state.all_users = action.payload.users;
        state.all_users_fetched = true;
      })
      .addCase(getConnectionsRequest.fulfilled, (state, action) => {
        state.isError = false;
        state.isLoading = false;
        state.connections = action.payload.connectionRequests;
      })
      .addCase(getConnectionsRequest.rejected, (state, action) => {
        state.isError = true;
        state.isLoading = false;
        state.message =
          action.payload?.message ||
          action.error.message ||
          "Fetching connections failed";
      })
      .addCase(getConnectionsRequest.pending, (state) => {
        state.isLoading = true;
        state.message = "Fetching connections...";
      })
      .addCase(getConnectionRequestsForMe.fulfilled, (state, action) => {
        state.isError = false;
        state.isLoading = false;
        state.connectionRequests = action.payload.connectionRequests;
      })
      .addCase(getConnectionRequestsForMe.rejected, (state, action) => {
        state.isError = true;
        state.isLoading = false;
        state.message =
          action.payload?.message ||
          action.error.message ||
          "Fetching connection requests failed";
      })
      .addCase(getConnectionRequestsForMe.pending, (state) => {
        state.isLoading = true;
        state.message = "Fetching connection requests...";
      });
  },
});

export const {
  reset,
  handleLoginUser,
  emptyMessage,
  setIsTokenNotPresent,
  setIsTokenPresent,
  isTokenPresent,
} = authSlice.actions;
export default authSlice.reducer;
