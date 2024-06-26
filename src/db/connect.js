import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import { dbLogger } from "../utils/logger.js";

const connectWithDb = async () => {
  try {
    const connection = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log("MongoDB connected successfully.");
  } catch (error) {
    console.log("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectWithDb;
