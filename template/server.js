// Load environment variables from .env file
import dotenv from "dotenv";
import { validateEnv } from "./config/env/validateEnv.js"; // Validates required env vars at startup

// Node.js core and third-party packages
import http from "http";
import { Server as SocketIOServer } from "socket.io";

// Import internal components
import { initDiscordBot } from "./discord/index.js"; // Discord bot logic
import app from "./app/app.js"; // Express app
import logger from "./config/logger.js"; // Centralized logger

// Validate and load environment variables
validateEnv();
dotenv.config();

// Define port from .env
const PORT = process.env.PORT;

// Create an HTTP server (Express + WebSocket)
const httpServer = http.createServer(app);

// Set up Socket.IO for WebSocket communication
const io = new SocketIOServer(httpServer, {
  cors: { origin: "*" }, // In production, restrict this to your domain
});

/* 
====================================================================================
OPTIONAL: CHOOSE AND CONNECT A DATABASE
------------------------------------------------------------------------------------
You can connect your project to a supported database. Available options:

  ✅ PostgreSQL:   "./db/postgresql.js"
  ✅ MySQL:        "./db/mysql.js"
  ✅ MongoDB:      "./db/mongodb.js"
  ✅ SQLite:       "./db/sqlite.js"

Choose one and import it below. Example for PostgreSQL:

  import db, { connectToDatabase } from "./db/postgresql.js";

If you DON'T want any database:
  - Comment/remove the import
  - Remove the call to connectToDatabase()
  - Remove `await db.end()` from shutdown logic
  - Call `initDiscordBot(io)` without `db`

====================================================================================
*/

// SELECT the DB module you're using below:
import db, { connectToDatabase } from "./db/postgresql.js";
// import db, { connectToDatabase } from "./db/mysql.js";
// import mongoose, { connectToDatabase } from "./db/mongodb.js";
// import { getDb, connectToDatabase } from "./db/sqlite.js";

// 🔌 Connect to the database (remove if unused)
await connectToDatabase();

// Initialize the Discord bot (pass DB and Socket.IO)
await initDiscordBot(db, io);
// If no DB: use → await initDiscordBot(io);

/**
 * Start HTTP + WebSocket server
 */
httpServer.listen(PORT, () => {
  logger.info(`Server running at http://localhost:${PORT}`);
});

/**
 * Graceful shutdown handler
 */
process.on("SIGINT", async () => {
  logger.info("Gracefully shutting down...");

  try {
    // Remove or modify this depending on your DB type
    if (db?.end) await db.end(); // PostgreSQL or MySQL
    //if (mongoose?.connection) await mongoose.connection.close(); // MongoDB
    // No close needed for SQLite (memory or file-based)

    io.close(); // Close WebSocket server

    httpServer.close(() => {
      logger.info("Server closed. Exiting...");
      process.exit(0);
    });
  } catch (error) {
    logger.error(`Error during shutdown: ${error}`);
    process.exit(1);
  }
});
