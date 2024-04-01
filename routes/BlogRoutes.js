import express from "express";
import { uploadFile } from "../middleware/uploadVide.js";
import BlogController from "../controllers/BlogController.js";

const BlogRoutes = express.Router();

BlogRoutes.route("/create-blog").post(uploadFile, BlogController.createBlog);
BlogRoutes.route("/all-blogs").get(BlogController.allBlogs);

export default BlogRoutes;
