import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
  },
  title: {
    type: String,
    required: [true, "Please provide a title"],
  },
  description: {
    type: String,
    required: [true, "Please provide a description"],
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: [true, "Please provide a price"],
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  thumbnail: {
    image: {
      type: String,
      required: [true, "Please provide an image/thumbnail"],
    },
    public_id: {
      type: String,
      required: [true, "Please provide a cloudinary_id/public_id"],
    },
  },
  videos: {
    url: {
      type: String,
    },
  },
  topicTags: {
    type: [String],
    required: [true, "Please provide topic tags"],
  },
  diffculityLevel: {
    type: String,
    enum: ["beginner", "intermediate", "advanced"],
    required: [true, "Please provide a difficulty level"],
  },
  modules: [
    {
      title: {
        type: String,
        required: [true, "Please provide a module title"],
      },
      description: {
        type: String,
        required: [true, "Please provide a module description"],
      },
    },
  ],
  Enrolled: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

courseSchema.methods.calculateDiscountedPrice = function () {
  return (this.price * (100 - this.discount)) / 100;
};

export const Course = mongoose.model("Course", courseSchema);
