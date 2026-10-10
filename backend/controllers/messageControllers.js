import mongoose from "mongoose";
import ConnectionReq from "../models/connectionModel.js";
import Message from "../models/messageModel.js";
import User from "../models/userModel.js";
import Notification from "../models/notificationModel.js";
import { io } from "../app.js";

const getUserId = (user) => user._id;

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const hasAcceptedConnection = async (firstUserId, secondUserId) =>
  ConnectionReq.exists({
    status_accepted: true,
    $or: [
      { fromUserId: firstUserId, toUserId: secondUserId },
      { fromUserId: secondUserId, toUserId: firstUserId },
    ],
  });

const getConnectedTarget = async (req, res) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    res.status(404).json({ message: "User not found" });
    return null;
  }

  if (String(req.user._id) === String(userId)) {
    res.status(400).json({ message: "Cannot message yourself" });
    return null;
  }

  const targetUser = await User.findById(userId).select("_id");
  if (!targetUser) {
    res.status(404).json({ message: "User not found" });
    return null;
  }

  const connected = await hasAcceptedConnection(getUserId(req.user), targetUser._id);
  if (!connected) {
    res.status(403).json({ message: "Messaging requires an accepted connection" });
    return null;
  }

  return targetUser;
};

export const sendMessage = async (req, res, next) => {
  try {
    const targetUser = await getConnectedTarget(req, res);
    if (!targetUser) return;

    const message = await Message.create({
      sender: req.user._id,
      receiver: targetUser._id,
      content: req.body.content,
    });

    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "name username profilePicture")
      .populate("receiver", "name username profilePicture");

    if (String(message.sender) !== String(message.receiver)) {
      const now = new Date();
      const notification = await Notification.findOneAndUpdate(
        {
          recipient: message.receiver,
          type: "message",
          sender: message.sender,
        },
        {
          $inc: { messageCount: 1 },
          $set: {
            preview: message.content.slice(0, 80),
            read: false,
            updatedAt: now,
          },
          $setOnInsert: { createdAt: now },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      ).populate("sender", "name username profilePicture");

      io.to(`user:${targetUser._id}`).emit("new_notification", notification);
    }

    io.to(`user:${targetUser._id}`).emit("new_message", populatedMessage);
    res.status(201).json({ message: populatedMessage });
  } catch (err) {
    next(err);
  }
};

export const getMessageThread = async (req, res, next) => {
  try {
    const targetUser = await getConnectedTarget(req, res);
    if (!targetUser) return;

    const { cursor } = req.query;
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 20, 1), 100);

    const query = {
      $or: [
        { sender: req.user._id, receiver: targetUser._id },
        { sender: targetUser._id, receiver: req.user._id },
      ],
    };

    if (cursor) {
      if (!isValidObjectId(cursor)) {
        return res.status(422).json({ message: "Invalid cursor" });
      }
      query._id = { $lt: cursor };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit)
      .populate("sender", "name username profilePicture")
      .populate("receiver", "name username profilePicture");

    res.json({
      messages,
      nextCursor: messages.length === limit ? messages[messages.length - 1]._id : null,
    });
  } catch (err) {
    next(err);
  }
};

export const getConversations = async (req, res, next) => {
  try {
    const acceptedConnections = await ConnectionReq.find({
      status_accepted: true,
      $or: [{ fromUserId: req.user._id }, { toUserId: req.user._id }],
    }).select("fromUserId toUserId");

    const connectedUserIds = acceptedConnections.map((connection) =>
      String(connection.fromUserId) === String(req.user._id)
        ? connection.toUserId
        : connection.fromUserId,
    );

    if (connectedUserIds.length === 0) {
      return res.json({ conversations: [] });
    }

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: req.user._id, receiver: { $in: connectedUserIds } },
            { receiver: req.user._id, sender: { $in: connectedUserIds } },
          ],
        },
      },
      { $sort: { createdAt: -1, _id: -1 } },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$sender", req.user._id] },
              "$receiver",
              "$sender",
            ],
          },
          latestMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$receiver", req.user._id] },
                    { $eq: ["$readAt", null] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 0,
          user: {
            _id: "$user._id",
            name: "$user.name",
            username: "$user.username",
            profilePicture: "$user.profilePicture",
          },
          latestMessage: 1,
          unreadCount: 1,
        },
      },
      { $sort: { "latestMessage.createdAt": -1, "latestMessage._id": -1 } },
    ]);

    res.json({ conversations });
  } catch (err) {
    next(err);
  }
};

export const markMessagesRead = async (req, res, next) => {
  try {
    const targetUser = await getConnectedTarget(req, res);
    if (!targetUser) return;

    const result = await Message.updateMany(
      {
        sender: targetUser._id,
        receiver: req.user._id,
        readAt: null,
      },
      { $set: { readAt: new Date() } },
    );

    const notification = await Notification.findOneAndDelete({
      recipient: req.user._id,
      type: "message",
      sender: targetUser._id,
    });
    if (notification) {
      io.to(`user:${req.user._id}`).emit("notification_removed", {
        notificationId: notification._id,
        senderId: targetUser._id,
      });
    }

    res.json({ updatedCount: result.modifiedCount });
  } catch (err) {
    next(err);
  }
};
