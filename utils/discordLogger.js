const { EmbedBuilder } = require('discord.js');

class DiscordLogger {
  constructor(client) {
    this.client = client;
    this.logChannelId = '1433983234873495745'; // Channel ID yang kamu berikan
    // Hanya log error ke channel
    this.onlyLogErrors = true;
  }

  async log(message, type = 'info') {
    try {
      // Hanya kirim ke channel jika hanya log error dan tipe adalah error
      if (this.onlyLogErrors && type !== 'error') {
        // Tetap log ke console untuk debugging
        console.log(`[DISCORD LOGGER ${type.toUpperCase()}]`, message);
        return;
      }

      const channel = await this.client.channels.fetch(this.logChannelId);
      if (!channel) {
        console.log(`[DISCORD LOGGER] Could not find log channel: ${this.logChannelId}`);
        return;
      }

      const colorMap = {
        info: '#00FF00',      // Hijau
        warn: '#FFFF00',      // Kuning
        error: '#FF0000',     // Merah
        success: '#0000FF'    // Biru
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
        .setColor(colorMap[type] || '#808080') // Abu-abu jika tipe tidak dikenal
        .setTimestamp()
        .setFooter({ text: 'Neko\'s Circle AI Bot Logger' });

      await channel.send({ embeds: [embed] });
      
      // Juga log ke console
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