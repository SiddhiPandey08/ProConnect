import mongoose from "mongoose";

const educationSchema = mongoose.Schema({
  school: {
    type: String,
    default: null,
  },
  degree: {
    type: String,
    default: null,
  },
  fieldOfStudy: {
    type: String,
    default: null,
  },
});

const experienceSchema = mongoose.Schema({
  company: { type: String, default: null },
  position: { type: String, default: null },
  startMonth: { type: String, default: null },
  startYear: { type: Number, default: null },
  endMonth: { type: String, default: null },
  endYear: { type: Number, default: null },
  current: { type: Boolean, default: false }, // "I currently work here"
});

const profileSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  bio: {
    type: String,
    default: null,
  },
  currentPosition: {
    type: String,
    default: null,
  },
  pastWork: {
    type: [experienceSchema],
    default: [],
  },
  education: {
    type: [educationSchema],
    default: [],
  },
});

const Profile = mongoose.model("Profile", profileSchema);

export default Profile;
