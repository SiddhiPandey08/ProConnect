import { Router } from "express";
import {
  register,
  login,
  uploadProfilePicture,
  updateUserProfile,
  getUserProfile,
  updateProfileData,
  getAllUsers,
  downloadResume,
  respondToConnectionRequest,
  sendConnectionRequest,
  getConnectionRequestsForMe,
  getUserProfileByUsername,
  getMyConnectionRequests,
} from "../controllers/userControllers.js";
import multer from "multer";
import validate from "../middlewares/validate.js";
import { registerSchema, loginSchema } from "../validators/authValidators.js";
import { authLimiter } from "../middlewares/rateLimiter.js";
import {
  updateProfileSchema,
  updateUserProfileSchema,
} from "../validators/profileValidators.js";
import { sendConnectionSchema } from "../validators/connectionValidators.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// ── Auth ─────────────────────────────────────────────
router.route("/login").post(authLimiter, validate(loginSchema), login);
router.route("/register").post(authLimiter, validate(registerSchema), register);

// ── Profile (protected) ─────────────────────────────────
router
  .route("/upload_profile_picture")
  .post(authMiddleware, upload.single("profilePicture"), uploadProfilePicture);

router
  .route("/update_profile")
  .post(authMiddleware, validate(updateUserProfileSchema), updateUserProfile);

router.route("/get_user_profile/:token").get(authMiddleware, getUserProfile);

router
  .route("/update_profile_data")
  .post(authMiddleware, validate(updateProfileSchema), updateProfileData);

router.route("/get_all_users").get(getAllUsers);

router.route("/download_resume").get(downloadResume);

// ── Connections (protected) ─────────────────────────────
router
  .route("/respond_to_connection_request")
  .post(authMiddleware, respondToConnectionRequest);

router
  .route("/send_connection_request")
  .post(authMiddleware, validate(sendConnectionSchema), sendConnectionRequest);

router
  .route("/get_connection_requests_for_me")
  .get(authMiddleware, getConnectionRequestsForMe);

router
  .route("/get_connection_requests")
  .get(authMiddleware, getMyConnectionRequests);

router.route("/get_user_by_username").get(getUserProfileByUsername);

export default router;
