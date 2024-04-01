import dataUri from "../middleware/dataUri.js";
import { Admin } from "../models/Admin.js";
import { Course } from "../models/Course.js";
import cloudinary from "cloudinary";
import { User } from "../models/User.js";

class CourseController {
  // create a new course

  static createCourse = async (req, res) => {
    const { title, description, price, discount, topicTags, diffculityLevel } =
      req.body;

    if (
      !title ||
      !description ||
      !price ||
      !discount ||
      !topicTags ||
      !difficultyLevel
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Please fill all fields" });
    }
    const thumbnail = req.file;
    if (!thumbnail) {
      return res
        .status(400)
        .json({ success: false, message: "Please upload a thumbnail" });
    }
    const thumbnailUrl = dataUri(thumbnail);
    try {
      const mycloud = await cloudinary.v2.uploader.upload(thumbnailUrl.content);
      const sanitizedTopicTags = topicTags.split(",").map((tag) => tag.trim());
      const course = await Course.create({
        createdBy: req.admin._id,
        title,
        description: stripHtmlTags(description),
        price,
        discount,
        thumbnail: {
          image: mycloud.secure_url,
          public_id: mycloud.public_id,
        },
        topicTags: sanitizedTopicTags,
        totalPrice: price - (price * discount) / 100,
        diffculityLevel,
      });
      await course.save();
      //user is already authorized so find the admin by email
      const admin = await Admin.findOne({ email: req.admin.email });
      admin.totalCourses.push(course._id);
      await admin.save();
      res.status(201).json({
        data: course,
        message: "Course created successfully",
        success: true,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
  // add modules on existing course only by the author/admin
  static addModules = async (req, res) => {
    const id = req.params.courseId;
    const modules = req.body;
    try {
      const course = await Course.findById(id);
      await course.modules.push(...modules);
      await course.save();
      res.status(200).json({
        data: course,
        message: "Modules added successfully",
        success: true,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // delete a course
  static deleteCourse = async (req, res) => {
    const id = req.params.courseId;
    try {
      // remove the course from the admin's totalCourses array
      const admin = await Admin.findByIdAndUpdate(
        req.admin._id,
        { $pull: { totalCourses: id } },
        { new: true }
      );
      if (!admin) {
        return res.status(404).json({
          success: false,
          message: "Admin not found",
        });
      }
      const findCourse = await Course.findById(id);
      if (!findCourse) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }
      const course = await Course.findByIdAndDelete(id);
      await admin.save();
      await course.save();
      res.status(200).json({
        // data: course,
        message: "Course deleted successfully",
        success: true,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  //   update a course price and discount
  static updateCourse = async (req, res) => {
    const id = req.params.courseId;
    const { price, discount } = req.body;
    try {
      const course = await Course.findByIdAndUpdate(
        id,
        { price, discount, totalPrice: price - (price * discount) / 100 },
        { new: true }
      );
      await course.save();
      res.status(200).json({
        data: course,
        message: "Course updated successfully",
        success: true,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // upload video on particular course
  static uploadCourseOnVideo = async (req, res) => {
    const id = req.params.courseId;
    try {
      if (id === undefined) {
        return res
          .status(400)
          .json({ success: false, message: "Please provide a course id" });
      }
      const video = req.file;
      if (!video) {
        return res
          .status(400)
          .json({ success: false, message: "Please upload a video" });
      }
      const videoUrl = dataUri(video);
      const mycloud = await cloudinary.v2.uploader.upload(videoUrl.content);

      const course = await Course.findById(id);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }
      await course.videos.push(mycloud.secure_url);
      res.status(200).json({
        data: course,
        message: "Video uploaded successfully",
        success: true,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // ------------------> user side <-----------------

  // get course based on difficulty level and topic tags
  static getAllCourses = async (req, res) => {
    try {
      const { difficultyLevel, topicTags } = req.query;
      const filters = {};
      if (difficultyLevel) filters.difficultyLevel = difficultyLevel;
      if (topicTags) filters.topicTags = { $in: topicTags.split(",") }; //  topicTags is an array

      // Pagination options
      const page = parseInt(req.query.page) || 1; // Default to page 1
      const limit = parseInt(req.query.limit) || 5; // Default to limit of 5 records per page

      // Query courses based on filters
      const courses = await Course.find(filters)
        .skip((page - 1) * limit)
        .limit(limit);

      // Count total number of courses (for pagination)
      const totalCourses = await Course.countDocuments(filters);

      // Calculate total number of pages
      const totalPages = Math.ceil(totalCourses / limit);

      // Return paginated course data
      res.status(200).json({
        success: true,
        page,
        totalPages,
        totalCourses,
        courses,
      });
    } catch (error) {
      console.error("Error fetching courses:", error);
      res
        .status(500)
        .json({ success: false, message: "Error fetching courses" });
    }
  };

  //   fetch the course by topic tags
  static getCoursesByTopicTags = async (req, res) => {
    const topic = req.params.topic;
    try {
      const courses = await Course.find({
        topicTags: { $regex: new RegExp(topic, "i") },
      });
      if (courses.length === 0) {
        return res.status(200).json({
          message: "No Course Found",
        });
      }
      res.status(200).json({
        data: courses,
        message: "Courses fetched successfully",
        success: true,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // get a single course info
  static getCourseInfo = async (req, res) => {
    const id = req.params.courseId;
    try {
      const course = await Course.findById(id);
      res.status(200).json({
        data: course,
        message: "Course fetched successfully",
        success: true,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
}

export default CourseController;
