import { createSlice } from "@reduxjs/toolkit";
import { getAllUsers, loginUser, registerUser } from "../../action/authAction";
import { getAboutUser } from "../../action/authAction";
import {
  getConnectionsRequest,
  getConnectionRequestsForMe,
  updateProfileData,
  getMutualConnections,
} from "../../action/authAction";

const initialState = {
  user: [],
  showProfilePrompt: false,
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
  justRegistered: false,
  mutualConnections: [],
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
    closeProfilePrompt: (state) => {
      state.showProfilePrompt = false;
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

        if (state.justRegistered) {
          state.showProfilePrompt = true; // Show prompt now that they are logged in
          state.justRegistered = false; // Reset flag
        }

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
        state.justRegistered = true; // Mark that they just created an account
        state.message = "Registration successful, please login to continue";
      })
      .addCase(updateProfileData.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateProfileData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.showProfilePrompt = false;
        state.user = { ...state.user, ...action.payload };
        state.message = "Profile updated successfully!";
      })
      .addCase(updateProfileData.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload?.message || "Profile update failed";
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
      })
      .addCase(getMutualConnections.fulfilled, (state, action) => {
        state.isLoading = false;
        state.mutualConnections = action.payload.mutualConnections;
      });
  },
});

export const {
  reset,
  handleLoginUser,
  emptyMessage,
  setIsTokenNotPresent,
  setIsTokenPresent,
  closeProfilePrompt,
} = authSlice.actions;
export default authSlice.reducer;
