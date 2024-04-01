import { User } from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import dataUri from "../middleware/dataUri.js";
import cloudinary from "cloudinary";
import Course from "../models/Course.js";
import paymentProcessing from "../utils/paymentProcessing.js";
import sendMail from "../utils/sendMail.js";
dotenv.config();
class UserController {
  // register
  static register = async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please fill in all fields" });
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });
    await user.save();

    // send mail to user after registration
    const subject = "Welcome to DevCourses";
    const html = `${user.name} Welcome to DevCourses!🚀`;
    await sendMail(user.email, subject, html);

    res.status(200).json({
      success: true,
      message: `Welcome, ${name}! Happy Learning 🚀`,
      data: user,
      token,
    });
  };
  // login
  static login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please fill in all fields" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });
    const cookieOptions = {
      httpOnly: true,
      expiresIn: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
    };
    res.cookie("token", token, cookieOptions);
    user.password = "mat dekh bhai";
    res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}! Happy Learning 🚀`,
      data: user,
      token,
    });
  };
  // profile
  static userProfile = async (req, res) => {
    try {
      const user = await User.findById(req.user._id).select("-password");
      if (user) {
        return res.status(200).json({
          success: true,
          message: "User profile fetched successfully",
          data: user,
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
  // logut user
  static logout = async (req, res) => {
    res.cookie("token", "none", {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });
    res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  };
  // update profile
  static updateProfile = async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        const avatar = req.file;
        if (avatar) {
          const avatar_uri = dataUri(avatar);
          const avatarUrl = await cloudinary.v2.uploader.upload(
            avatar_uri.content
          );

          user.avatar = {
            public_id: avatarUrl.public_id,
            url: avatarUrl.secure_url,
          };
          res.status(200).json({
            success: true,
            message: "Avatar uploaded successfully",
            data: user,
          });
        }
        if (req.body.password) {
          user.password = req.body.password;
        }
        const updatedUser = await user.save();
        res.status(200).json({
          success: true,
          message: "User profile updated successfully",
          data: updatedUser,
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
  // view purchased courses
  static viewPurchasedCourses = async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      if (user) {
        // ourses info by id of course that is in user.purchasedCourses
        const purchasedCourses = user.purchasedCourses;
        //got purchases course ids now get the courses
        const courses = await Course.find({ _id: { $in: purchasedCourses } });
        return res.status(200).json({
          success: true,
          message: "Purchased courses fetched successfully",
          data: courses,
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
  // enroll in a course
  static enrollInCourse = async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(500).json({
          success: false,
          message: "user not found",
        });
      }

      const course = await Course.findById(req.params.courseId);
      if (!course) {
        return res.status(500).json({
          success: false,
          message: "course not found",
        });
      }
      // check if the user has already purchased the course
      if (user.purchasedCourses.includes(course._id)) {
        return res.status(400).json({
          success: false,
          message: "You have already purchased this course",
        });
      }
      // add course to user's course array
      user.courses.push(course._id);
      await user.save();

      // send mail to user after enrolling in a course
      const subject = "Course Enrollment";
      const html = `
  <style>
    /* Add your CSS styles here */
    body {
      font-family: Arial, sans-serif;
      background-color: #f5f5f5;
      color: #333;
    }
    h1 {
      color: #0066cc;
    }
    p {
      font-size: 16px;
    }
  </style>
  <h1>Hi ${user.name},</h1>
  <p>You have successfully enrolled in the course <strong>${course.title}</strong>. Happy Learning! 🚀</p>
`;

      await sendMail(user.email, subject, html);
      console.log("Email sent to user after enrolling in a course");

      return res.status(200).json({
        success: true,
        message: `Enrolled in course ${course.title} successfully`,
        data: user,
      });
    } catch (error) {
      return res.status(500).json({
        message: "error on purchasing the course",
        success: false,
      });
    }
  };
  // process payment after enrolling in a course
  static processPayment = async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
      // Get particular course from user's courses array
      const course = await Course.findById(req.params.courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      // Make payment
      const paymentDetail = req.body.paymentDetail;
      const paymentResult = await paymentProcessing(paymentDetail);

      // Update user's purchased courses and save user
      user.purchasedCourses.push(course._id);
      await user.save();

      return res.status(200).json({
        success: true,
        message: `Payment processed successfully for course ${course.title}`,
        data: {
          user,
          paymentResult,
        },
      });
    } catch (error) {
      console.error("Error processing payment:", error);
      return res.status(500).json({
        success: false,
        message: "Payment processing failed",
        error: error.message,
      });
    }
  };
}

export default UserController;
