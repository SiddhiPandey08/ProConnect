import mongoose from "mongoose";

const postSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
  updatedAt: {
    type: Date,
    default: new Date(),
  },
  likes: {
    type: Number,
    default: 0,
  },
  media: {
    type: String,
    default: null,
  },
  active: {
    type: Boolean,
    default: true,
  },
  fileType: {
    type: String,
    default: null,
  },
});

const Post = mongoose.model("Post", postSchema);

export default Post;
