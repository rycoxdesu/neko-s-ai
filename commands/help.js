const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Get help information about Neko\'s Circle AI bot'),

  async execute(interaction) {
    const helpEmbed = new EmbedBuilder()
      .setTitle("Neko's Circle - AI Bot Help")
      .setDescription("Here are the commands available in Neko's Circle:")
      .setColor('#FF69B4')
      .addFields(
        {
          name: '/ai',
          value: 'Chat with the AI assistant using Gemini Pro. Just type your message and get a response.',
          inline: false
        },
        {
          name: '/help',
          value: 'Show this help message.',
          inline: false
        }
      )
      .setFooter({ text: 'Neko\'s Circle AI Bot', iconURL: interaction.client.user.displayAvatarURL() })
      .setTimestamp();

    await interaction.reply({ embeds: [helpEmbed], ephemeral: true });
  },
};