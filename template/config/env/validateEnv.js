import REQUIRED_VARS from "./vars/requiredVars.js";

import logger from "../../config/logger.js";

export function validateEnv() {
  let hasError = false;
  for (const key of REQUIRED_VARS) {
    if (!process.env[key]) {
      logger.error(`Missing required env variable: ${key}`);
      hasError = true;
    }
  }

  if (hasError) {
    logger.error("Environment validation failed.");
    logger.error("Exiting...");
    process.exit(1);
  } else {
    logger.info("All required environment variables are set.");
  }
}
