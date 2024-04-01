import { Admin } from "../models/Admin.js";
import jwt from "jsonwebtoken";

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please fill in all fields" });
    }
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }
    if (admin.password !== password) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });
    admin.password = "too see others password is a bad habit";
    res.status(200).json({
      success: true,
      message: ` logged in successfully`,
      data: admin,
      token,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAdminProfile = async (req, res) => {
  try {
    const { name, website, totalExp, about } = req.body;
    let adminProfile = await Admin.findById(req.admin._id);
    if (!name || !website || !totalExp || !about) {
      res.status(404).json({
        success: false,
        message: "Fields are missing...☹",
      });
    }
    if (adminProfile) {
      adminProfile.name = name;
      adminProfile.website = website;
      adminProfile.totaLExp = totalExp;
      adminProfile.about = about;
      await adminProfile.save();

      return res.status(200).json({
        success: true,
        message: "Profile Updated successfully 🎉",
        data: adminProfile,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Admin profile not found",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
