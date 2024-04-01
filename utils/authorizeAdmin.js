import { Admin } from "../models/Admin.js";

const authorizeAdmin = async (req, res, next) => {
  const { email } = req.body;
  const user = await Admin.findOne({ email });

  

  if (!user || user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "You are not authorized to access this route",
    });
  }
  next();
};

export default authorizeAdmin;
