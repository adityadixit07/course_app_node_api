// import OpenAI from "openai";

import dataUri from "../middleware/dataUri.js";
import cloudinary from "cloudinary";
import { Blog } from "../models/Blog.js";

// export const textTranslation = async (req, res) => {
//   const { language, message } = req.body;
//   const openai = new OpenAI({
//     apiKey: process.env.OPENAI_API_KEY,
//   });

//   const retryCount = 3;
//   let retries = 0;

//   const translateText = async () => {
//     try {
//       const response = await openai.chat.completions.create({
//         model: "gpt-3.5-turbo",
//         messages: [
//           {
//             role: "system",
//             content:
//               "you will provide text and language i will translate it for you. and give you as json response.",
//           },
//           {
//             role: "user",
//             content: `Translate this into ${language}: ${message}`,
//           },
//         ],
//       });
//       const translatedText = response.data.choices[0].text.trim();
//       return res.status(200).json({ message: "Success", data: translatedText });
//     } catch (error) {
//       if (
//         error.response &&
//         error.response.status === 429 &&
//         retries < retryCount
//       ) {
//         // If rate limit error and retry count is less than maximum retries, retry after some time
//         retries++;
//         await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for 5 seconds
//         return translateText(); // Retry translation
//       } else {
//         return res
//           .status(500)
//           .json({ message: "Internal Server Error", error: error.message });
//       }
//     }
//   };

//   await translateText(); // Start translation process
// };

//create blog

class BlogController {
  static createBlog = async (req, res, next) => {
    try {
      const { title, description } = req.body;
      if (!title || !description) {
        return res.status(400).json({
          success: false,
          message: "Please provide all required fields",
        });
      }
      const thumbnail = req.file;
      if (thumbnail) {
        const thumbnailUrl = dataUri(thumbnail);
        const mycloud = await cloudinary.v2.uploader.upload(
          thumbnailUrl.content
        );
        const blog = new Blog({
          title,
          description,
          thumbnail: {
            image: mycloud.secure_url,
            public_id: mycloud.public_id,
          },
        });
        await blog.save();
        return res.status(201).json({
          success: true,
          message: "Blog created successfully",
          data: blog,
        });
      } else {
        const blog = new Blog({
          title,
          description,
          thumbnail: {
            image:
              "https://img.freepik.com/free-photo/technology-communication-icons-symbols-concept_53876-120314.jpg?w=996&t=st=1710142861~exp=1710143461~hmac=520a8c6236c13f2ba932b6745b504a2012954814be066019a53b42699c16e2b0",
            public_id: "sfasfafsasdf",
          },
        });
        await blog.save();
        return res.status(201).json({
          success: true,
          message: "Blog created successfully",
          data: blog,
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  };

  // get all blogs
  static allBlogs = async (req, res, next) => {
    try {
      const blogs = await Blog.find().sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        message: "All blogs",
        data: blogs,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  };

  // show single blog
  static singleBlog = async (req, res, next) => {
    try {
      const { id } = req.params;
      const blog = await Blog.findById(id);
      if (!blog) {
        return res.status(404).json({
          success: false,
          message: "Blog not found",
        });
      }
      return res.status(200).json({
        success: true,
        message: "Blog found",
        data: blog,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  };
  static suggestedBlogs = async (req, res, next) => {
    try {
      const mainBlog = await Blog.findById(req.params.blogId);
      const suggestedBlogs = await Blog.find({
        tags: { $in: mainBlog.tags },
      }).limit(3);

      return res.status(200).json({
        success: true,
        message: "Suggested blogs",
        data: suggestedBlogs,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  };
}

export default BlogController;
