const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ConfigManager = require('../utils/ConfigManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setting')
    .setDescription('Ubah pengaturan bot')
    .addSubcommand(subcommand =>
      subcommand
        .setName('name')
        .setDescription('Ubah nama bot')
        .addStringOption(option =>
          option.setName('value')
            .setDescription('Nama baru')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('role')
        .setDescription('Ubah role bot')
        .addStringOption(option =>
          option.setName('value')
            .setDescription('Role baru')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('personality')
        .setDescription('Ubah kepribadian bot')
        .addStringOption(option =>
          option.setName('value')
            .setDescription('Kepribadian baru')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('language')
        .setDescription('Ubah bahasa bot')
        .addStringOption(option =>
          option.setName('value')
            .setDescription('Bahasa baru')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('knowledge')
        .setDescription('Ubah pengetahuan bot')
        .addStringOption(option =>
          option.setName('value')
            .setDescription('Pengetahuan baru')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('tone')
        .setDescription('Ubah nada bicara bot')
        .addStringOption(option =>
          option.setName('value')
            .setDescription('Nada bicara baru')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('format_response')
        .setDescription('Ubah format jawaban bot')
        .addStringOption(option =>
          option.setName('value')
            .setDescription('Format jawaban baru')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('user_name')
        .setDescription('Ubah panggilan pengguna')
        .addStringOption(option =>
          option.setName('value')
            .setDescription('Panggilan pengguna baru')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('view')
        .setDescription('Lihat pengaturan saat ini')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('reset')
        .setDescription('Reset pengaturan ke default')
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const userId = interaction.user.id;

    try {
      const configManager = new ConfigManager();
      let config = await configManager.readConfig();

      if (subcommand === 'view') {
        const embed = new EmbedBuilder()
          .setTitle('_pengaturan Bot Saat Ini_')
          .addFields(
            { name: 'Nama', value: config.name, inline: true },
            { name: 'Role', value: config.role, inline: true },
            { name: 'Kepribadian', value: config.personality, inline: true },
            { name: 'Pengetahuan', value: config.knowledge, inline: true },
            { name: 'Bahasa', value: config.language, inline: true },
            { name: 'Nada Bicara', value: config.tone, inline: true },
            { name: 'Format Jawaban', value: config.format_response, inline: false },
            { name: 'Panggilan Pengguna', value: config.user_name, inline: false }
          )
          .setColor('#FF69B4')
          .setTimestamp();

        return await interaction.reply({ embeds: [embed], ephemeral: true });
      }

      if (subcommand === 'name') {
        const newValue = interaction.options.getString('value');
        const success = await configManager.updateConfig({ name: newValue });
        
        if (success) {
          const embed = new EmbedBuilder()
            .setTitle('Nama Berhasil Diubah')
            .setDescription(`Nama bot sekarang menjadi: **${newValue}**`)
            .setColor('#00FF00')
            .setTimestamp();
          
          return await interaction.reply({ embeds: [embed], ephemeral: true });
        } else {
          const embed = new EmbedBuilder()
            .setTitle('Gagal Mengubah Nama')
            .setDescription('Terjadi kesalahan saat menyimpan pengaturan.')
            .setColor('#FF0000')
            .setTimestamp();
          
          return await interaction.reply({ embeds: [embed], ephemeral: true });
        }
      }

      if (subcommand === 'role') {
        const newValue = interaction.options.getString('value');
        const success = await configManager.updateConfig({ role: newValue });
        
        if (success) {
          const embed = new EmbedBuilder()
            .setTitle('Role Berhasil Diubah')
            .setDescription(`Role bot sekarang menjadi: **${newValue}**`)
            .setColor('#00FF00')
            .setTimestamp();
          
          return await interaction.reply({ embeds: [embed], ephemeral: true });
        } else {
          const embed = new EmbedBuilder()
            .setTitle('Gagal Mengubah Role')
            .setDescription('Terjadi kesalahan saat menyimpan pengaturan.')
            .setColor('#FF0000')
            .setTimestamp();
          
          return await interaction.reply({ embeds: [embed], ephemeral: true });
        }
      }

      if (subcommand === 'personality') {
        const newValue = interaction.options.getString('value');
        const success = await configManager.updateConfig({ personality: newValue });
        
        if (success) {
          const embed = new EmbedBuilder()
            .setTitle('Kepribadian Berhasil Diubah')
            .setDescription(`Kepribadian bot sekarang menjadi: **${newValue}**`)
            .setColor('#00FF00')
            .setTimestamp();
          
          return await interaction.reply({ embeds: [embed], ephemeral: true });
        } else {
          const embed = new EmbedBuilder()
            .setTitle('Gagal Mengubah Kepribadian')
            .setDescription('Terjadi kesalahan saat menyimpan pengaturan.')
            .setColor('#FF0000')
            .setTimestamp();
          
          return await interaction.reply({ embeds: [embed], ephemeral: true });
        }
      }

      if (subcommand === 'language') {
        const newValue = interaction.options.getString('value');
        const success = await configManager.updateConfig({ language: newValue });
        
        if (success) {
          const embed = new EmbedBuilder()
            .setTitle('Bahasa Berhasil Diubah')
            .setDescription(`Bahasa bot sekarang menjadi: **${newValue}**`)
            .setColor('#00FF00')
            .setTimestamp();
          
          return await interaction.reply({ embeds: [embed], ephemeral: true });
        } else {
          const embed = new EmbedBuilder()
            .setTitle('Gagal Mengubah Bahasa')
            .setDescription('Terjadi kesalahan saat menyimpan pengaturan.')
            .setColor('#FF0000')
            .setTimestamp();
          
          return await interaction.reply({ embeds: [embed], ephemeral: true });
        }
      }

      if (subcommand === 'knowledge') {
        const newValue = interaction.options.getString('value');
        const success = await configManager.updateConfig({ knowledge: newValue });
        
        if (success) {
          const embed = new EmbedBuilder()
            .setTitle('Pengetahuan Berhasil Diubah')
            .setDescription(`Pengetahuan bot sekarang menjadi: **${newValue}**`)
            .setColor('#00FF00')
            .setTimestamp();
          
          return await interaction.reply({ embeds: [embed], ephemeral: true });
        } else {
          const embed = new EmbedBuilder()
            .setTitle('Gagal Mengubah Pengetahuan')
            .setDescription('Terjadi kesalahan saat menyimpan pengaturan.')
            .setColor('#FF0000')
            .setTimestamp();
          
          return await interaction.reply({ embeds: [embed], ephemeral: true });
        }
      }

      if (subcommand === 'tone') {
        const newValue = interaction.options.getString('value');
        const success = await configManager.updateConfig({ tone: newValue });
        
        if (success) {
          const embed = new EmbedBuilder()
            .setTitle('Nada Bicara Berhasil Diubah')
            .setDescription(`Nada bicara bot sekarang menjadi: **${newValue}**`)
            .setColor('#00FF00')
            .setTimestamp();
          
          return await interaction.reply({ embeds: [embed], ephemeral: true });
        } else {
          const embed = new EmbedBuilder()
            .setTitle('Gagal Mengubah Nada Bicara')
            .setDescription('Terjadi kesalahan saat menyimpan pengaturan.')
            .setColor('#FF0000')
            .setTimestamp();
          
          return await interaction.reply({ embeds: [embed], ephemeral: true });
        }
      }

      if (subcommand === 'format_response') {
        const newValue = interaction.options.getString('value');
        const success = await configManager.updateConfig({ format_response: newValue });
        
        if (success) {
          const embed = new EmbedBuilder()
            .setTitle('Format Jawaban Berhasil Diubah')
            .setDescription(`Format jawaban bot sekarang menjadi: **${newValue}**`)
            .setColor('#00FF00')
            .setTimestamp();
          
          return await interaction.reply({ embeds: [embed], ephemeral: true });
        } else {
          const embed = new EmbedBuilder()
            .setTitle('Gagal Mengubah Format Jawaban')
            .setDescription('Terjadi kesalahan saat menyimpan pengaturan.')
            .setColor('#FF0000')
            .setTimestamp();
          
          return await interaction.reply({ embeds: [embed], ephemeral: true });
        }
      }

      if (subcommand === 'user_name') {
        const newValue = interaction.options.getString('value');
        const success = await configManager.updateConfig({ user_name: newValue });
        
        if (success) {
          const embed = new EmbedBuilder()
            .setTitle('Panggilan Pengguna Berhasil Diubah')
            .setDescription(`Panggilan pengguna bot sekarang menjadi: **${newValue}**`)
            .setColor('#00FF00')
            .setTimestamp();
          
          return await interaction.reply({ embeds: [embed], ephemeral: true });
        } else {
          const embed = new EmbedBuilder()
            .setTitle('Gagal Mengubah Panggilan Pengguna')
            .setDescription('Terjadi kesalahan saat menyimpan pengaturan.')
            .setColor('#FF0000')
            .setTimestamp();
          
          return await interaction.reply({ embeds: [embed], ephemeral: true });
        }
      }

      if (subcommand === 'reset') {
        const success = await configManager.resetConfig();
        
        if (success) {
          const embed = new EmbedBuilder()
            .setTitle('Pengaturan Berhasil Direset')
            .setDescription('Semua pengaturan telah dikembalikan ke nilai default.')
            .setColor('#00FF00')
            .setTimestamp();
          
          return await interaction.reply({ embeds: [embed], ephemeral: true });
        } else {
          const embed = new EmbedBuilder()
            .setTitle('Gagal Mereset Pengaturan')
            .setDescription('Terjadi kesalahan saat mereset pengaturan.')
            .setColor('#FF0000')
            .setTimestamp();
          
          return await interaction.reply({ embeds: [embed], ephemeral: true });
        }
      }
    } catch (error) {
      console.error('Error in setting command:', error);
      
      const errorEmbed = new EmbedBuilder()
        .setTitle('Error')
        .setDescription('Terjadi kesalahan saat mengubah pengaturan.')
        .setColor('#FF0000')
        .setTimestamp();
        
      return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};