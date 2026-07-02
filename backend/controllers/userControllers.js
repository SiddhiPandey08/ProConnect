import User from "../models/userModel.js";
import Profile from "../models/profileModel.js";
import ConnectionReq from "../models/connectionModel.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import PDFDocument from "pdfkit";
import fs from "fs";
import { createNotification } from "./notificationControllers.js";
import { io } from "../app.js";

const USER_PUBLIC_FIELDS = "name email username profilePicture";

const convertUserDataToPDF = async (userData) => {
  const doc = new PDFDocument({ margin: 50 });
  const outputPath = crypto.randomBytes(16).toString("hex") + ".pdf";
  const stream = fs.createWriteStream("uploads/" + outputPath);
  doc.pipe(stream);

  const pageWidth = doc.page.width - 100;

  try {
    const imgPath = "uploads/" + userData.userId.profilePicture;
    if (fs.existsSync(imgPath)) {
      const imgSize = 90;
      const imgX = (doc.page.width - imgSize) / 2;
      doc.image(imgPath, imgX, 50, { width: imgSize, height: imgSize });
      doc.moveDown(5);
    }
  } catch (e) {
    doc.moveDown(2);
  }

  doc
    .fontSize(22)
    .font("Helvetica-Bold")
    .text(userData.userId.name, { align: "center" });

  if (userData.currentPosition) {
    doc
      .fontSize(12)
      .font("Helvetica")
      .fillColor("#555555")
      .text(userData.currentPosition, { align: "center" });
  }

  doc
    .fontSize(11)
    .fillColor("#777777")
    .text(`${userData.userId.email}  ·  @${userData.userId.username}`, {
      align: "center",
    });

  doc.moveDown(1);
  doc
    .moveTo(50, doc.y)
    .lineTo(doc.page.width - 50, doc.y)
    .strokeColor("#e0e0e0")
    .stroke();
  doc.moveDown(1);

  if (userData.bio) {
    doc
      .fontSize(11)
      .font("Helvetica")
      .fillColor("#333333")
      .text(userData.bio, { align: "left", width: pageWidth });
    doc.moveDown(1);
  }

  const sectionTitle = (title) => {
    doc
      .fontSize(13)
      .font("Helvetica-Bold")
      .fillColor("#0a66c2")
      .text(title.toUpperCase(), { align: "left" });
    doc
      .moveTo(50, doc.y + 2)
      .lineTo(doc.page.width - 50, doc.y + 2)
      .strokeColor("#0a66c2")
      .lineWidth(0.5)
      .stroke();
    doc.moveDown(0.6);
  };

  if (userData.pastWork && userData.pastWork.length > 0) {
    sectionTitle("Work Experience");
    userData.pastWork.forEach((work) => {
      doc
        .fontSize(11)
        .font("Helvetica-Bold")
        .fillColor("#111111")
        .text(`${work.position}`, { continued: true })
        .font("Helvetica")
        .fillColor("#555555")
        .text(`  ·  ${work.company}`);
      if (work.years) {
        doc
          .fontSize(10)
          .fillColor("#888888")
          .text(`${work.years} year${work.years !== 1 ? "s" : ""}`);
      }
      doc.moveDown(0.5);
    });
    doc.moveDown(0.5);
  }

  if (userData.education && userData.education.length > 0) {
    sectionTitle("Education");
    userData.education.forEach((edu) => {
      if (edu.school || edu.degree) {
        doc
          .fontSize(11)
          .font("Helvetica-Bold")
          .fillColor("#111111")
          .text(edu.school || "Institution not specified");
        doc
          .fontSize(10)
          .font("Helvetica")
          .fillColor("#555555")
          .text(
            [edu.degree, edu.fieldOfStudy].filter(Boolean).join(" · ") ||
              "Degree not specified",
          );
        doc.moveDown(0.5);
      }
    });
  }

  doc
    .fontSize(9)
    .fillColor("#aaaaaa")
    .text(`Generated via ProConnect · ${new Date().toLocaleDateString()}`, {
      align: "center",
    });

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on("finish", () => resolve(outputPath));
    stream.on("error", reject);
  });
};

// ── Auth (no authMiddleware — these create the token) ──────────
export const register = async (req, res, next) => {
  try {
    const { name, email, password, username } = req.body;
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      username,
    });
    await newUser.save();

    const profile = new Profile({ userId: newUser._id });
    await profile.save();
    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User does not exist" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    await User.updateOne({ _id: user._id }, { token });
    return res
      .status(200)
      .json({ message: "Login successful", token, userId: user._id });
  } catch (error) {
    next(error);
  }
};

// ── Profile (protected — req.user from authMiddleware) ─────────
export const uploadProfilePicture = async (req, res, next) => {
  try {
    const user = req.user;
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    user.profilePicture = req.file.filename;
    await user.save();
    return res
      .status(200)
      .json({ message: "Profile picture uploaded successfully" });
  } catch (error) {
    next(error);
  }
};

export const updateUserProfile = async (req, res, next) => {
  try {
    const user = req.user;
    const newUserData = req.body;
    const { username, email } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser && existingUser._id.toString() !== user._id.toString()) {
      return res
        .status(400)
        .json({ message: "Username or email already exists" });
    }
    await User.updateOne({ _id: user._id }, { $set: newUserData });
    return res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    next(error);
  }
};

export const getUserProfile = async (req, res, next) => {
  try {
    const user = req.user;
    const userProfile = await Profile.findOne({ userId: user._id }).populate(
      "userId",
      USER_PUBLIC_FIELDS,
    );
    return res.status(200).json({ user: userProfile });
  } catch (err) {
    next(err);
  }
};

export const updateProfileData = async (req, res, next) => {
  try {
    const user = req.user;
    const { name, ...newProfileData } = req.body;

    if (name) {
      await User.updateOne({ _id: user._id }, { $set: { name } });
    }

    const profile_to_update = await Profile.findOne({ userId: user._id });
    Object.assign(profile_to_update, newProfileData);
    await profile_to_update.save();
    return res
      .status(200)
      .json({ message: "Profile data updated successfully" });
  } catch (err) {
    next(err);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await Profile.find().populate("userId", USER_PUBLIC_FIELDS);
    return res.status(200).json({ users });
  } catch (err) {
    next(err);
  }
};

export const downloadResume = async (req, res, next) => {
  try {
    const user_id = req.query.id;
    const profile = await Profile.findById(user_id).populate(
      "userId",
      USER_PUBLIC_FIELDS,
    );
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    const outputPath = await convertUserDataToPDF(profile);
    return res.json({ message: outputPath });
  } catch (err) {
    next(err);
  }
};

// ── Connections (protected) ─────────────────────────────────────
export const sendConnectionRequest = async (req, res, next) => {
  try {
    const user = req.user;
    const { targetUserId } = req.body;

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: "Target user not found" });
    }
    if (user._id.equals(targetUser._id)) {
      return res
        .status(400)
        .json({ message: "Cannot send request to yourself" });
    }

    const existingRequest = await ConnectionReq.findOne({
      fromUserId: user._id,
      toUserId: targetUser._id,
    });

    if (existingRequest) {
      if (existingRequest.status_accepted === false) {
        existingRequest.status_accepted = null; // reset to pending, avoid duplicate docs
        await existingRequest.save();
        // (re-fire notification here if you want)
        return res
          .status(200)
          .json({ message: "Connection request sent successfully" });
      }
      return res
        .status(400)
        .json({ message: "Connection request already sent" });
    }

    const newRequest = new ConnectionReq({
      fromUserId: user._id,
      toUserId: targetUser._id,
    });
    await newRequest.save();

    const notification = await createNotification({
      toUserId: targetUser._id,
      fromUserId: user._id,
      type: "connection_request",
      message: `${user.name} sent you a connection request`,
    });
    io.to(targetUser._id.toString()).emit("new_notification", notification);
    return res
      .status(200)
      .json({ message: "Connection request sent successfully" });
  } catch (err) {
    next(err);
  }
};

export const getMyConnectionRequests = async (req, res, next) => {
  try {
    const user = req.user;
    const connectionRequests = await ConnectionReq.find({
      fromUserId: user._id,
    }).populate("toUserId", USER_PUBLIC_FIELDS);
    return res.status(200).json({ connectionRequests });
  } catch (err) {
    next(err);
  }
};

export const getConnectionRequestsForMe = async (req, res, next) => {
  try {
    const user = req.user;
    const connectionRequests = await ConnectionReq.find({
      toUserId: user._id,
    }).populate("fromUserId", USER_PUBLIC_FIELDS);
    return res.status(200).json({ connectionRequests });
  } catch (err) {
    next(err);
  }
};

export const respondToConnectionRequest = async (req, res, next) => {
  try {
    const user = req.user;
    const { connectionReqId, action_type } = req.body;

    const connectionRequest = await ConnectionReq.findById(connectionReqId);
    if (!connectionRequest) {
      return res.status(404).json({ message: "Connection request not found" });
    }
    if (!connectionRequest.toUserId.equals(user._id)) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    if (connectionRequest.status_accepted) {
      return res
        .status(400)
        .json({ message: "Connection request already accepted" });
    }
    if (!["accept", "reject"].includes(action_type)) {
      return res.status(400).json({ message: "Invalid action type" });
    }

    if (action_type === "accept") {
      connectionRequest.status_accepted = true;
      await connectionRequest.save();

      const notification = await createNotification({
        toUserId: connectionRequest.fromUserId,
        fromUserId: user._id,
        type: "connection_accepted",
        message: `${user.name} accepted your connection request`,
      });
      io.to(connectionRequest.fromUserId.toString()).emit(
        "new_notification",
        notification,
      );
    } else {
      connectionRequest.status_accepted = false;
      await connectionRequest.save();
    }

    return res
      .status(200)
      .json({ message: "Connection request updated successfully" });
  } catch (err) {
    next(err);
  }
};

export const getUserProfileByUsername = async (req, res, next) => {
  try {
    const { username } = req.query;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const userProfile = await Profile.findOne({ userId: user._id }).populate(
      "userId",
      USER_PUBLIC_FIELDS,
    );
    return res.status(200).json({ profile: userProfile });
  } catch (err) {
    next(err);
  }
};
