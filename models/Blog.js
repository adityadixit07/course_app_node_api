import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Provide title"],
  },
  description: {
    type: String,
    required: [true, "Provide Description"],
  },
  thumbnail: {
    image: {
      type: String,
    },
    public_id: {
      type: String,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Blog = mongoose.model("Blog", blogSchema);
