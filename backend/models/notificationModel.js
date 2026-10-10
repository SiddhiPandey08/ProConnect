import mongoose from "mongoose";

const notificationSchema = mongoose.Schema({
  toUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  fromUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  type: {
    type: String,
    enum: [
      "connection_request",
      "connection_accepted",
      "post_like",
      "post_comment",
      "message",
    ],
    required: true,
  },
  message: { type: String },
  messageCount: { type: Number, default: 0 },
  preview: { type: String, maxlength: 80 },
  isRead: { type: Boolean, default: false },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

notificationSchema.index({ recipient: 1, type: 1, sender: 1 });

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
