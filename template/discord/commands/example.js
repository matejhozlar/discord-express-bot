import { SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("example")
  .setDescription("Send an example message");

export async function execute(interaction) {
  return await interaction.reply({
    content: "Hello!",
  });
}
