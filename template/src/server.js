// Import the Express framework
import express from "express";

/**
 * Starts an Express web server.
 *
 * @param {number} port - The port number to listen on (default: 3000)
 * @returns {Promise<import("http").Server>} - A Promise that resolves with the HTTP server instance
 */
export function startServer(port = 3000) {
  return new Promise((resolve) => {
    // Create a new Express application
    const app = express();

    /**
     * Root route ("/")
     * - Returns a small JSON object with:
     *   - ok: simple status flag (true = server is alive)
     *   - name: identifies the service (useful if you run multiple services)
     *   - uptime: how many seconds the Node process has been running
     *
     * This can be useful for checking from a browser or API client.
     */
    app.get("/", (_req, res) => {
      res.json({
        ok: true,
        name: "discord-express-bot-template",
        uptime: process.uptime(),
      });
    });

    /**
     * Health-check route ("/health")
     * - Returns a plain "ok" string.
     * - Commonly used by load balancers, uptime monitors, or container orchestrators
     *   (e.g., Docker, Kubernetes) to quickly check if the service is responding.
     */
    app.get("/health", (_req, res) => {
      res.send("ok");
    });

    /**
     * Start the server
     * - app.listen() creates an underlying HTTP server and begins listening.
     * - Once the server is ready, we log the address and resolve the Promise
     *   with the server instance (so it can later be shut down).
     */
    const server = app.listen(port, () => {
      console.log(`[web] listening on http://localhost:${port}`);
      resolve(server);
    });
  });
}
