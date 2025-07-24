import { Client, GatewayIntentBits, Partials, MessageFlags } from "discord.js";
import logger from "../config/logger.js";
import { loadCommands } from "./loader/commandLoader.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Channel],
});

let commandHandlers = new Map();

export async function initDiscordBot(db) {
  commandHandlers = await loadCommands();

  client.once("ready", () => {
    logger.info(`Discord bot logged in as ${client.user.tag}`);
  });

  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = commandHandlers.get(interaction.commandName);
    if (!command) {
      logger.warn(`Uknown command: ${interaction.commandName}`);
      return;
    }

    try {
      await command.execute(interaction, db);
    } catch (error) {
      logger.error(`Command error: ${error}`);
      await interaction.reply({
        content: "❌ There was an error executing this command.",
        flags: MessageFlags.Ephemeral,
      });
    }
  });

  try {
    await client.login(process.env.DISCORD_BOT_TOKEN);
  } catch (error) {
    logger.error("Failed to login discord bot:", error);
    throw error;
  }

  return { client, commandHandlers };
}
