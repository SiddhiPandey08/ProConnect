import { createAsyncThunk } from "@reduxjs/toolkit";
import { clientServer } from "../../../index";
export const loginUser = createAsyncThunk(
  "user/login",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.post("/login", {
        email: user.email,
        password: user.password,
      });
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      } else {
        return thunkAPI.rejectWithValue({
          message: "token not found",
        });
      }
      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data || { message: error.message },
      );
    }
  },
);

export const registerUser = createAsyncThunk(
  "user/register",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.post("/register", {
        name: user.name,
        email: user.email,
        password: user.password,
        username: user.username,
      });
      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data || { message: error.message },
      );
    }
  },
);

export const getAboutUser = createAsyncThunk(
  "user/getAboutUser",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.get(
        `/get_user_profile/${user.token}`,
      );
      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data || { message: error.message },
      );
    }
  },
);

export const getAllUsers = createAsyncThunk(
  "user/getAllUsers",
  async (_, thunkAPI) => {
    try {
      const response = await clientServer.get("/get_all_users");
      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  },
);
export const sendConnectionRequest = createAsyncThunk(
  "/users/send_connection_request",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.post("/send_connection_request", {
        token: user.token,
        targetUserId: user.userId,
      });

      thunkAPI.dispatch(getConnectionsRequest({ token: user.token }));
      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  },
);

//connections sent by me
export const getConnectionsRequest = createAsyncThunk(
  "user/getConnectionsRequest",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.get("/get_connection_requests", {
        params: {
          token: user.token,
        },
      });
      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  },
);

//connections sent to me
export const getConnectionRequestsForMe = createAsyncThunk(
  "user/getConnectionRequestsForMe",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.get(
        "/get_connection_requests_for_me",
        {
          params: {
            token: user.token,
          },
        },
      );
      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  },
);

export const AcceptConnectionRequest = createAsyncThunk(
  "user/accept_connectionReq",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.post(
        "/respond_to_connection_request",
        {
          action_type: user.action,
          connectionReqId: user.connectionReqId,
          token: user.token,
        },
      );
      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  },
);
export const updateProfileData = createAsyncThunk(
  "auth/updateProfileData",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await clientServer.post("/update_profile_data", payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);
