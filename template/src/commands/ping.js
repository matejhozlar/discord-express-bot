// Import the builder that helps us define slash commands
import { SlashCommandBuilder } from "discord.js";

export default {
  // The "data" property defines the structure of our slash command.
  // SlashCommandBuilder is a helper that ensures the command follows Discord's format.
  data: new SlashCommandBuilder()
    .setName("ping") // This is the command name: users will type `/ping` in Discord.
    .setDescription("Replies with Pong!"), // A short description shown in Discord's UI.

  // The "execute" method is what runs when someone uses this command.
  // It receives an "interaction" object, which represents the user's command.
  async execute(interaction) {
    // Step 1: Reply to the interaction.
    // This sends a simple "Pong!" message back to the user.
    // Note: We no longer use { fetchReply: true } (deprecated in discord.js v14.16).
    await interaction.reply("Pong!");

    // Step 2: Fetch the reply we just sent.
    // Why? Because "interaction.reply()" itself doesn't return the sent message object anymore.
    // By calling "interaction.fetchReply()", we can retrieve the full message Discord created.
    const sent = await interaction.fetchReply();

    // Step 3: Calculate latency.
    // Each Discord message has a "createdTimestamp".
    // By subtracting the interaction's creation time from the bot's reply time,
    // we get how many milliseconds it took for the bot to respond.
    const latency = sent.createdTimestamp - interaction.createdTimestamp;

    // Step 4: Send a follow-up message showing the latency.
    // "followUp" is used when you want to send another message
    // in the same interaction thread after the initial reply.
    await interaction.followUp({ content: `Latency: ${latency}ms` });
  },
};
