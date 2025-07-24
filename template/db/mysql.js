import mysql from "mysql2/promise";
import dotenv from "dotenv";
import logger from "../config/logger.js";

dotenv.config();

let pool;

export async function connectToDatabase() {
  try {
    pool = await mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      database: process.env.DB_DATABASE,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    await pool.query("SELECT 1");
    logger.info("Connected to MySQL database.");
  } catch (error) {
    logger.error(`Could not connect to MySQL: ${error}`);
    throw error;
  }
}

export function getDb() {
  return pool;
}
