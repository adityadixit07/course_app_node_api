import Stripe from "stripe";
import dotenv from "dotenv";
import { User } from "../models/User.js";
import { Course } from "../models/Course.js";
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2020-08-27",
});


const doPayment = async (courseId, userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const course = await Course.findById(courseId);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }
    const paymentIntent = await stripe.paymentIntents.create({
      amount: course.price * 100,
      currency: "usd",
      metadata: { integration_check: "accept_a_payment" },
    });
    return paymentIntent;
  } catch (error) {
    return error;
  }
};

export default doPayment;