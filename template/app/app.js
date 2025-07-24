import express from "express";

import logger from "../config/logger.js";

const app = express();

app.use(express.json());

app.use((error, req, res, next) => {
  logger.error(
    `Unhandled Express error at ${req.method} ${req.url}: ${logError(error)}`
  );
  res.status(500).json({ error: "Internal server error" });
});

process.on("unhandledRejection", (reason) => {
  logger.error(`Unhandled promise rejection: ${reason}`);
});

export default app;
