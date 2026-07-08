import { createSlice } from "@reduxjs/toolkit";
import {
  getAllPosts,
  getAllComments,
  createComment,
  likePost,
} from "../../action/postAction";
const initialState = {
  posts: [],
  isError: false,
  postsFetched: false,
  isLoading: false,
  message: "",
  loggedIn: false,
  comments: [],
  postId: null,
};

const postSlice = createSlice({
  name: "post",
  initialState,
  reducers: {
    reset: () => initialState,
    resetPostId: (state) => {
      state.postId = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getAllPosts.pending, (state) => {
      state.isLoading = true;
      state.message = "Fetching posts...";
    });
    builder.addCase(getAllPosts.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isError = false;
      state.postsFetched = true;
      state.posts = action.payload;
      state.message = "Posts fetched successfully";
    });
    builder.addCase(getAllPosts.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.message =
        action.payload?.message ||
        action.error.message ||
        "Failed to fetch posts";
    });

    builder.addCase(getAllComments.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isError = false;
      state.comments = action.payload.comments || []; // never undefined
      state.postId = action.payload.postId;
      state.message = "Comments fetched successfully";
    });
    builder.addCase(getAllComments.pending, (state, action) => {
      state.isLoading = true;
      state.comments = []; // clear stale comments from the previous post while loading
      state.message = "Fetching comments...";
    });
    builder.addCase(getAllComments.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.comments = []; // don't leave stale/undefined comments on failure
      state.message =
        action.payload?.message ||
        action.error.message ||
        "Failed to fetch comments";
    });

    builder.addCase(createComment.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(createComment.fulfilled, (state) => {
      state.isLoading = false;
      state.isError = false;
      state.message = "Comment posted successfully";
      // comments list is refreshed by the getAllComments dispatch that follows in the component
    });
    builder.addCase(createComment.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.message =
        action.payload?.message ||
        action.error.message ||
        "Failed to post comment";
    });
    builder.addCase(likePost.fulfilled, (state, action) => {
      const postId = action.payload.postId;
      const newLikes = action.payload.likes;
      const post = state.posts.find((p) => p._id === postId);
      if (post) {
        post.likes = newLikes;
      }
    });
  },
});

export default postSlice.reducer;
export const { reset, resetPostId } = postSlice.actions;
