// Node.js built-in modules
import fs from "node:fs/promises"; // Promises-based filesystem API
import path from "node:path"; // Utilities for working with file paths
import { fileURLToPath, pathToFileURL } from "node:url"; // Convert between file URLs and paths

// Discord.js imports
import { Client, Collection, Events, GatewayIntentBits } from "discord.js";

// Dotenv loads variables from `.env` into process.env
import dotenv from "dotenv";
dotenv.config();

// __filename and __dirname equivalents for ESM
// In CommonJS, Node gives you __filename/__dirname automatically.
// In ESM, we need to recreate them manually.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// We'll keep the Discord client in a variable so we can start and stop it cleanly.
let client;

/**
 * Loads all command files from the ./commands folder.
 * Each command must export an object with:
 *   - data   (SlashCommandBuilder instance)
 *   - execute(interaction) function
 */
async function loadCommands() {
  const commands = new Collection(); // Collection is a Map-like structure from discord.js
  const commandsPath = path.join(__dirname, "commands");

  // Read directory contents, keeping file type information
  const entries = await fs.readdir(commandsPath, { withFileTypes: true });

  for (const entry of entries) {
    // Skip non-files and non-JS files
    if (!entry.isFile() || !entry.name.endsWith(".js")) continue;

    const filePath = path.join(commandsPath, entry.name);

    // Dynamically import the command (ESM way, instead of require())
    const mod = await import(pathToFileURL(filePath).href);

    // Commands may be exported as `export default {}` or `export const ...`
    // This supports both.
    const command = mod.default ?? mod;

    // Validate command object
    if (command?.data && command?.execute) {
      // Store the command by its name so we can look it up later
      commands.set(command.data.name, command);
    } else {
      console.warn(
        `[bot] The command at ${filePath} is missing "data" or "execute".`
      );
    }
  }
  return commands;
}

/**
 * Starts the Discord bot.
 * - Creates a client
 * - Loads commands
 * - Registers event listeners
 * - Logs into Discord
 */
export async function startBot() {
  if (!process.env.DISCORD_TOKEN) {
    throw new Error("Missing DISCORD_TOKEN in environment.");
  }

  // Create the Discord client with minimal intents (Guilds only in this template).
  client = new Client({ intents: [GatewayIntentBits.Guilds] });

  // Load commands into the client
  client.commands = await loadCommands();

  // Fired once when the bot successfully logs in
  client.once(Events.ClientReady, (c) => {
    console.log(`[bot] logged in as ${c.user.tag}`);
  });

  // Fired on *every* interaction (slash commands, buttons, menus, etc.)
  client.on(Events.InteractionCreate, async (interaction) => {
    // Only handle slash (chat input) commands
    if (!interaction.isChatInputCommand()) return;

    // Look up the command by its name
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.error(
        `[bot] No command matching ${interaction.commandName} was found.`
      );
      return;
    }

    // Run the command
    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);

      // If the reply was already sent or deferred, we must use followUp
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "There was an error while executing this command!",
          ephemeral: true, // ephemeral = only visible to the user
        });
      } else {
        // Otherwise, we can reply normally
        await interaction.reply({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
      }
    }
  });

  // Finally, log the bot in using your token from .env
  await client.login(process.env.DISCORD_TOKEN);
}

/**
 * Stops the bot gracefully.
 * Destroys the Discord client so connections are closed.
 */
export async function stopBot() {
  if (client) {
    await client.destroy();
    console.log("[bot] client destroyed");
  }
}
