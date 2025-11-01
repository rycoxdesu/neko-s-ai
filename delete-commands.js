const { REST, DiscordAPIError } = require('@discordjs/rest');
const { Routes } = require('discord.js');
require('dotenv').config();

(async () => {
  try {
    console.log('Started deleting all application (/) commands.');
    
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    // Hapus semua command di guild
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), // Guild specific
      { body: [] }
    );

    console.log('Successfully deleted all guild application (/) commands.');
  } catch (error) {
    console.error('Error deleting guild commands:', error);
  }
})();