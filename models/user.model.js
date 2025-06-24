import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    userName: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profileImage: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    headline: { type: String, default: "" },
    skills: [{ type: String }],
    education: [
      {
        collage: { type: String },
        degree: { type: String },
        filedOfStudy: { type: String },
      },
    ],
    location: { type: String },
    gender: { type: String, enum: ["male", "female", "other"] },
    experience: [
      {
        title: { type: String },
        company: { type: String },
        description: { type: String },
      },
    ],
    connection: [{ type: mongoose.Schema.Types.ObjectId, ref:"User" }],
  },
  { timestamp: true }
);

const User = mongoose.model("User", userSchema);

export default User;
