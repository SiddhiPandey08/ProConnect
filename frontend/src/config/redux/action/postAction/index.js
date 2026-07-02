import { clientServer } from "../../../index";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const getAllPosts = createAsyncThunk(
  "posts/getAll",
  async (_, thunkAPI) => {
    try {
      const response = await clientServer.get("/posts");
      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data || { message: error.message },
      );
    }
  },
);

export const createPost = createAsyncThunk(
  "posts/create",
  async (postData, thunkAPI) => {
    const { file, body } = postData;
    try {
      const formData = new FormData();
      formData.append("media", file);
      formData.append("token", localStorage.getItem("token"));
      formData.append("body", body);
      const response = await clientServer.post("/createPost", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.status === 200) {
        return thunkAPI.fulfillWithValue(response.data);
      } else {
        return thunkAPI.rejectWithValue({
          message: "Post creation failed",
        });
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data || { message: error.message },
      );
    }
  },
);

export const deletePost = createAsyncThunk(
  "posts/delete",
  async (postId, thunkAPI) => {
    try {
      const response = await clientServer.post("/deletePost", {
        postId: postId,
        token: localStorage.getItem("token"),
      });
      if (response.status === 200) {
        return thunkAPI.fulfillWithValue(response.data);
      } else {
        return thunkAPI.rejectWithValue({
          message: "Post deletion failed",
        });
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data || { message: error.message },
      );
    }
  },
);

export const likePost = createAsyncThunk(
  "posts/like",
  async (postId, thunkAPI) => {
    try {
      const response = await clientServer.post("/increment_likes", {
        postId: postId,
      });
      if (response.status === 200) {
        return { postId, likes: response.data.likes };
      } else {
        return thunkAPI.rejectWithValue({
          message: "Failed to like post",
        });
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data || { message: error.message },
      );
    }
  },
);

export const getAllComments = createAsyncThunk(
  "post/getAllComments",
  async (postId, thunkAPI) => {
    try {
      const response = await clientServer.get(`/get_comments/${postId}`);
      return thunkAPI.fulfillWithValue({
        comments: response.data.comments,
        postId: postId,
      });
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data || { message: error.message },
      );
    }
  },
);

export const createComment = createAsyncThunk(
  "post/createComment",
  async ({ postId, body }, thunkAPI) => {
    try {
      const response = await clientServer.post("/comment", {
        postId,
        body,
        token: localStorage.getItem("token"),
      });
      if (response.status === 200) {
        return thunkAPI.fulfillWithValue(response.data);
      } else {
        return thunkAPI.rejectWithValue({ message: "Failed to post comment" });
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data || { message: error.message },
      );
    }
  },
);
export const updatePost = createAsyncThunk(
  "posts/update",
  async ({ postId, body }) => {
    const token = localStorage.getItem("token");
    await clientServer.patch(`/${postId}`, { token, body });
    return postId;
  },
);
