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

// Validate .env vars first
validateEnv();
dotenv.config(); // Must come after validateEnv()

// Define port from .env
const PORT = process.env.PORT;

// Create an HTTP server to run Express + WebSocket
const httpServer = http.createServer(app);

// Set up Socket.IO server (WebSocket)
const io = new SocketIOServer(httpServer, {
  cors: { origin: "*" }, // In production, restrict this
});

/* 
==============================================
OPTIONAL: REMOVE DATABASE CONNECTION
----------------------------------------------
If you're not using a DB, comment/remove the following:
  - The DB import
  - connectToDatabase()
  - await db.end() in shutdown
  - Pass only `io` to the Discord bot
==============================================
*/

// 🔻 REMOVE THIS LINE IF NOT USING DATABASE
import db, { connectToDatabase } from "./db/index.js";

// 🔻 REMOVE THIS LINE IF NOT USING DATABASE
await connectToDatabase();

//  Pass only io if you're not using DB
await initDiscordBot(db, io);
// await initDiscordBot(io);  ⬅ This is cleaner if DB is unused

// Start listening for HTTP and WebSocket requests
httpServer.listen(PORT, () => {
  logger.info(`Server running at http://localhost:${PORT}`);
});

// Graceful shutdown handler (Ctrl+C / SIGINT)
process.on("SIGINT", async () => {
  logger.info("Gracefully shutting down...");
  try {
    // 🔻 REMOVE THIS LINE IF NOT USING DATABASE
    await db.end();

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
