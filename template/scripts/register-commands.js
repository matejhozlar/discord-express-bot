// Load environment variables from .env into process.env
import dotenv from "dotenv";

// Discord.js REST client + Routes helper
import { REST, Routes } from "discord.js";

// Node.js built-ins for filesystem and path handling
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

dotenv.config(); // Apply .env configuration

// Recreate __filename and __dirname for ESM (they don’t exist by default in ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pull required values from environment
const token = process.env.DISCORD_TOKEN; // Bot token
const clientId = process.env.DISCORD_CLIENT_ID; // Application (client) ID
const guildId = process.env.DISCORD_GUILD_ID; // Development guild (server) ID

// Validate environment variables before proceeding
if (!token || !clientId || !guildId) {
  console.error(
    "Missing DISCORD_TOKEN, DISCORD_CLIENT_ID, or DISCORD_GUILD_ID in .env"
  );
  process.exit(1); // Exit with failure if missing
}

/**
 * Reads all commands from src/commands and converts them to JSON
 * for registration with the Discord API.
 *
 * @returns {Promise<Array<Object>>} Array of command JSON definitions
 */
async function loadCommandData() {
  const commands = [];
  const commandsPath = path.join(__dirname, "..", "src", "commands");

  // Read files in the commands directory
  const entries = await fs.readdir(commandsPath, { withFileTypes: true });

  for (const entry of entries) {
    // Skip anything that’s not a .js file
    if (!entry.isFile() || !entry.name.endsWith(".js")) continue;

    const filePath = path.join(commandsPath, entry.name);

    // Dynamically import the command file (ESM-compatible)
    const mod = await import(pathToFileURL(filePath).href);
    const command = mod.default ?? mod; // Support both default and named export

    // Validate the command shape
    if (command?.data && command?.execute) {
      // Push the command’s JSON definition into the list
      commands.push(command.data.toJSON());
    } else {
      console.warn(
        `[register] skipping ${entry.name} – missing "data" or "execute"`
      );
    }
  }
  return commands;
}

/**
 * Main entry point for the script
 * - Loads command definitions
 * - Registers them with Discord (guild-scoped for fast updates)
 */
async function main() {
  const commands = await loadCommandData();

  // Create REST client and authenticate with token
  const rest = new REST({ version: "10" }).setToken(token);

  try {
    console.log(
      `[register] refreshing ${commands.length} application (/) commands for guild ${guildId}...`
    );

    // Register commands with Discord
    // - applicationGuildCommands → commands are available instantly, but only in this guild
    const data = await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands }
    );

    console.log(`[register] successfully registered ${data.length} commands.`);
  } catch (error) {
    console.error(error);
    process.exit(1); // Exit with failure if API call fails
  }
}

// Run the script
main();
