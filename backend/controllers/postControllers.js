import Post from "../models/postModel.js";
import Comment from "../models/commentModel.js";
import User from "../models/userModel.js";
import Profile from "../models/profileModel.js";
import bcrypt from "bcrypt";

export const activeCheck = (req, res) => {
  return res.status(200).json({ message: "Active" });
};

export const createPost = async (req, res) => {
  const { token } = req.body;
  try {
    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const post = new Post({
      userId: user._id,
      body: req.body.body,
      media: req.file != undefined ? req.file.filename : null,
      fileType: req.file != undefined ? req.file.mimetype.split("/")[1] : null,
    });
    await post.save();
    return res.status(201).json({ message: "Post created successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate(
      "userId",
      "name username profilePicture",
    );
    return res.status(200).json(posts);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deletePost = async (req, res) => {
  const { postId, token } = req.body;
  try {
    const user = await User.findOne({ token: token }).select("_id");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const post = await Post.findOne({ _id: postId, userId: user._id });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (post.userId.toString() !== user._id.toString()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    await Post.deleteOne({ _id: postId });
    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const commentPost = async (req, res) => {
  const { token, postId } = req.body;
  const commentBody = req.body.body;
  try {
    const user = await User.findOne({ token: token }).select("_id");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    const comment = new Comment({
      userId: user._id,
      postId: postId,
      body: commentBody,
    });

    await comment.save();
    return res.status(200).json({ message: "Comment added successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

export const get_comments_by_post = async (req, res) => {
  const { postId } = req.params;
  try {
    const comments = await Comment.find({ postId: postId }).populate(
      "userId",
      "name username profilePicture",
    );
    return res.status(200).json({ comments });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const delete_comments_of_user = async (req, res) => {
  const { token, commentId } = req.body;
  try {
    const user = await User.findOne({ token: token }).select("_id");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const comment = await Comment.findOne({ _id: commentId, userId: user._id });
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    if (comment.userId.toString() !== user._id.toString()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    await Comment.deleteOne({ _id: commentId });
    return res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const increment_likes = async (req, res) => {
  const { postId } = req.body;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    post.likes += 1;
    await post.save();
    return res
      .status(200)
      .json({ message: "Likes incremented successfully", likes: post.likes });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updatePost = async (req, res) => {
  try {
    const { token, body } = req.body;
    const user = await User.findOne({ token });
    if (!user) return res.status(404).json({ message: "User not found" });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.userId.toString() !== user._id.toString())
      return res.status(403).json({ message: "Unauthorized" });

    post.body = body;
    await post.save();
    res.status(200).json({ message: "Post updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getPostById = async (req, res) => {
  const { postId } = req.params;
  try {
    const post = await Post.findById(postId).populate(
      "userId",
      "name username profilePicture",
    );
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    return res.status(200).json({ post });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
