const { EmbedBuilder } = require('discord.js');

class DiscordLogger {
  constructor(client) {
    this.client = client;
    this.logChannelId = '1433983234873495745';
    this.onlyLogErrors = true;
  }

  async log(message, type = 'info') {
    try {
      if (this.onlyLogErrors && type !== 'error') {
        console.log(`[DISCORD LOGGER ${type.toUpperCase()}]`, message);
        return;
      }

      const channel = await this.client.channels.fetch(this.logChannelId);
      if (!channel) {
        console.log(`[DISCORD LOGGER] Could not find log channel: ${this.logChannelId}`);
        return;
      }

      const colorMap = {
        info: '#00FF00',
        warn: '#FFFF00',
        error: '#FF0000',
        success: '#0000FF'
      };

      const titleMap = {
        info: 'Info Log',
        warn: 'Warning Log',
        error: 'Error Log',
        success: 'Success Log'
      };

      const embed = new EmbedBuilder()
        .setTitle(`🤖 ${titleMap[type] || 'Log Message'}`)
        .setDescription(message)
        .setColor(colorMap[type] || '#808080')
        .setTimestamp()
        .setFooter({ text: 'Neko\'s Circle AI Bot Logger' });

      await channel.send({ embeds: [embed] });
      
      console.log(`[DISCORD LOGGER ${type.toUpperCase()}]`, message);
    } catch (error) {
      console.error('[DISCORD LOGGER] Error sending log to channel:', error.message);
    }
  }

  async info(message) {
    await this.log(message, 'info');
  }

  async warn(message) {
    await this.log(message, 'warn');
  }

  async error(message) {
    await this.log(message, 'error');
  }

  async success(message) {
    await this.log(message, 'success');
  }
}

module.exports = DiscordLogger;