import User from "../models/userModel.js";

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.body.token || req.query.token || req.params.token;

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const user = await User.findOne({ token });
    if (!user) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

export default authMiddleware;
