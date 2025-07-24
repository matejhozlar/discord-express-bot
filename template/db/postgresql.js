import pg from "pg";
import logger from "../config/logger.js";
import dotenv from "dotenv";

dotenv.config();

const pool = new pg.Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export async function connectToDatabase() {
  try {
    await pool.query("SELECT 1");
    logger.info("Connected to PostgreSQL database.");
  } catch (error) {
    logger.error(`Could not connect to DB: ${error}`);
    throw error;
  }
}

export default pool;
