import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  // id is the payment id from stripe
  id: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  created: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});


export const Payment = mongoose.model("Payment", paymentSchema);