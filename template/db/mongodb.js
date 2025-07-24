import mongoose from "mongoose";
import dotenv from "dotenv";
import logger from "../config/logger.js";

dotenv.config();

export async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: process.env.DB_DATABASE, // optional, if using multi-db URI
    });

    logger.info("Connected to MongoDB.");
  } catch (error) {
    logger.error(`Could not connect to MongoDB: ${error}`);
    throw error;
  }
}

export default mongoose;
