import express from "express";
import CourseController from "../controllers/CourseController.js";

const CourseRoutes = express.Router();

// public routes
CourseRoutes.route("/get-all-courses").get(CourseController.getAllCourses);
CourseRoutes.route("/:courseId").get(CourseController.getCourseInfo);
CourseRoutes.route("/search/:topic").get(
  CourseController.getCoursesByTopicTags
);

export default CourseRoutes;
