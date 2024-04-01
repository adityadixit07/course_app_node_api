import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const dbConnect = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected with connection host ${conn.connection.host}`);
  } catch (error) {
    console.log("error: ", error.message);
  }
};

export default dbConnect;
