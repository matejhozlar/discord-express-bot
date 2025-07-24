import Database from "better-sqlite3";
import path from "path";
import logger from "../config/logger.js";

let db;

export async function connectToDatabase() {
  try {
    db = new Database(path.resolve("data.sqlite"));
    db.pragma("journal_mode = WAL");
    logger.info("Connected to SQLite database.");
  } catch (error) {
    logger.error(`Could not connect to SQLite: ${error}`);
    throw error;
  }
}

export function getDb() {
  return db;
}
