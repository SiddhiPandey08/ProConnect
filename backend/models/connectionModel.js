import mongoose from "mongoose";

const connectionSchema = mongoose.Schema({
  fromUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  toUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status_accepted: {
    type: Boolean,
    default: null,
  },
});

const ConnectionReq = mongoose.model("Connection", connectionSchema);

export default ConnectionReq;
