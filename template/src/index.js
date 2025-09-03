// Load environment variables from .env into process.env
import dotenv from "dotenv";

// Import our own modules:
// - startServer: launches the Express web server
// - startBot / stopBot: starts and stops the Discord bot
import { startServer } from "./server.js";
import { startBot, stopBot } from "./bot.js";

dotenv.config(); // Make .env variables available

// Choose a port for the Express server.
// Falls back to 3000 if PORT is not set in the environment.
const port = process.env.PORT || 3000;

// Immediately-invoked async function expression (IIFE).
// This lets us use async/await at the top level in ESM.
(async () => {
  try {
    // --- STARTUP ---

    // Start the Express web server
    const server = await startServer(port);

    // Start the Discord bot
    await startBot();

    // --- SHUTDOWN HANDLER ---

    // Define a helper to cleanly shut down both server and bot.
    const shutdown = async (signal) => {
      console.log(`\n${signal} received: shutting down...`);
      try {
        // Stop the Discord bot
        await stopBot();

        // Stop the web server
        server.close(() => {
          console.log("HTTP server closed.");
          process.exit(0); // Exit cleanly
        });

        // Safety net: if server doesn't close in 5 seconds, force exit
        setTimeout(() => process.exit(0), 5000).unref();
      } catch (err) {
        console.error("Shutdown error:", err);
        process.exit(1); // Exit with failure code
      }
    };

    // Register shutdown handlers for OS signals:
    // - SIGINT: Ctrl+C in terminal
    // - SIGTERM: Sent by hosting platforms (Heroku, Docker, etc.)
    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (err) {
    // If either the server or bot fails to start, log and exit.
    console.error("Fatal startup error:", err);
    process.exit(1);
  }
})();
