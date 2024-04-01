import express from "express";
import {
  loginAdmin,
  updateAdminProfile,
} from "../controllers/AdminController.js";
import authorizeAdmin from "../utils/authorizeAdmin.js";
import CourseController from "../controllers/CourseController.js";
import { authorizeAdminToken } from "../utils/AuthorizeUtils.js";
import uploadVideo, { uploadFile } from "../middleware/uploadVide.js";

const AdminRoutes = express.Router();

AdminRoutes.route("/login").post(authorizeAdmin, loginAdmin);
AdminRoutes.route("/create-course").post(
  authorizeAdminToken,
  uploadFile,
  CourseController.createCourse
);
AdminRoutes.route("/add-module/:courseId").put(
  authorizeAdminToken,
  CourseController.addModules
);
AdminRoutes.route("/delete-course/:courseId").delete(
  authorizeAdminToken,
  CourseController.deleteCourse
);

AdminRoutes.route("/update-course/:courseId").put(
  authorizeAdminToken,
  CourseController.updateCourse
);

AdminRoutes.route("/upload-video/:courseId").put(
  authorizeAdminToken,
  uploadVideo,
  CourseController.uploadCourseOnVideo
);

// update admin profile
AdminRoutes.route("/update-profile").put(
  authorizeAdminToken,
  updateAdminProfile
);

export default AdminRoutes;
