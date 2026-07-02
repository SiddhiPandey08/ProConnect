import Notification from "../models/notificationModel.js";
import User from "../models/userModel.js";

export const createNotification = async ({
  toUserId,
  fromUserId,
  type,
  message,
}) => {
  try {
    const notification = new Notification({
      toUserId,
      fromUserId,
      type,
      message,
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error("Failed to create notification:", error.message);
  }
};

export const getNotifications = async (req, res) => {
  try {
    const { token } = req.query;
    const user = await User.findOne({ token });
    if (!user) return res.status(404).json({ message: "User not found" });

    const notifications = await Notification.find({ toUserId: user._id })
      .populate("fromUserId", "name username profilePicture")
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ notifications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markNotificationsRead = async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findOne({ token });
    if (!user) return res.status(404).json({ message: "User not found" });

    await Notification.updateMany(
      { toUserId: user._id, isRead: false },
      { isRead: true },
    );
    res.status(200).json({ message: "Marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
