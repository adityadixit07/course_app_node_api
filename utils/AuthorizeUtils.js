import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { Admin } from "../models/Admin.js";

export const authorizeAdminToken = async (req, res, next) => {
  const token = req.headers["authorization"].split(" ")[1].trim();
  // console.log(token)
  if (!token) {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Token not provided",
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log(decoded.id, "decoded id");
    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    const cookieOptions = {
      httpOnly: true,
      expiresIn: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
    };

    res.cookie("token", token, cookieOptions);
    req.admin = admin;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const authorize = async (req, res, next) => {
  const token = req.headers["authorization"].split(" ")[1].trim();
  if (!token)
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized access" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    const cookieOptions = {
      httpOnly: true,
      expiresIn: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
    };
    res.cookie("token", token, cookieOptions);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
