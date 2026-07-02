import mongoose from "mongoose";

const notificationSchema = mongoose.Schema({
  toUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  fromUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: [
      "connection_request",
      "connection_accepted",
      "post_like",
      "post_comment",
    ],
    required: true,
  },
  message: { type: String },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
