import path from "path";
import fs from "fs";
import { pathToFileURL, fileURLToPath } from "url";

// logger
import logger from "../../config/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function loadCommands() {
  const commandsPath = path.join(__dirname, "..", "commands");
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));

  const commandHandlers = new Map();

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const commandModule = await import(pathToFileURL(filePath).href);

    if (commandModule.data && typeof commandModule.execute === "function") {
      commandHandlers.set(commandModule.data.name, commandModule);
    } else {
      logger.warn(`Skipped loading ${file} - missing data or execute()`);
    }
  }

  logger.info(`Loaded ${commandHandlers.size} Discord command(s).`);
  return commandHandlers;
}
