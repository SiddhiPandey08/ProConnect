import { Router } from "express";
import { activeCheck } from "../controllers/postControllers.js";
import multer from "multer";
import {
  createPost,
  getPosts,
  deletePost,
  commentPost,
  get_comments_by_post,
  increment_likes,
  delete_comments_of_user,
  updatePost,
  getPostById,
} from "../controllers/postControllers.js";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

const router = Router();

router.route("/").get(activeCheck);
router.route("/createPost").post(upload.single("media"), createPost);
router.route("/posts").get(getPosts);
router.route("/deletePost").post(deletePost);
router.route("/comment").post(commentPost);
router.route("/get_comments/:postId").get(get_comments_by_post);
router.route("/increment_likes").post(increment_likes);
router.route("/delete_comment").post(delete_comments_of_user);
router.route("/getAllPosts").get(getPosts);
router.patch("/posts/:id", updatePost);
router.route("/get_post/:postId").get(getPostById);
export default router;
