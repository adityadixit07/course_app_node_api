import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
  },
  email: {
    type: String,
    required: [true, "Please provide a email"],
    unique: true,
  },
  about: {
    type: String,
  },
  website: {
    type: String,
  },
  totaLExp: {
    type: Number,
  },
  avatar: {
    image: {
      type: String,
    },
    public_id: {
      type: String,
    },
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
  },
  role: {
    type: String,
    default: "admin",
    enum: ["admin"],
  },
  totalCourses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
  ],
});

export const Admin = mongoose.model("Admin", adminSchema);
