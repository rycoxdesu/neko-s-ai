const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const GlobalConfig = require('../config/globalConfig');

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
      // Periksa apakah pengguna adalah owner (kamu bisa sesuaikan ini)
      // Di sini, kita anggap semua orang bisa ubah setting karena gak ada sistem permission
      let globalConfig = await GlobalConfig.findOne();
      if (!globalConfig) {
        globalConfig = await GlobalConfig.create({
          name: "Megumin",
          role: "asisten anime",
          personality: "tsundere",
          knowledge: "anime",
          limitations: "tidak mengujar kebencian",
          language: "Bahasa Indonesia dengan kata-kata Jepang",
          tone: "kawaii dan ekpresif",
          format_response: "jawaban dengan gaya anime yang ekspresif",
          user_name: "{user}"
        });
      }

      if (subcommand === 'view') {
        const embed = new EmbedBuilder()
          .setTitle('_pengaturan Bot Saat Ini_')
          .addFields(
            { name: 'Nama', value: globalConfig.name, inline: true },
            { name: 'Role', value: globalConfig.role, inline: true },
            { name: 'Kepribadian', value: globalConfig.personality, inline: true },
            { name: 'Pengetahuan', value: globalConfig.knowledge, inline: true },
            { name: 'Bahasa', value: globalConfig.language, inline: true },
            { name: 'Nada Bicara', value: globalConfig.tone, inline: true },
            { name: 'Format Jawaban', value: globalConfig.format_response, inline: false },
            { name: 'Panggilan Pengguna', value: globalConfig.user_name, inline: false }
          )
          .setColor('#FF69B4')
          .setTimestamp();

        return await interaction.reply({ embeds: [embed], ephemeral: true });
      }

      if (subcommand === 'name') {
        const newValue = interaction.options.getString('value');
        globalConfig.name = newValue;
        await globalConfig.save();
        
        const embed = new EmbedBuilder()
          .setTitle('Nama Berhasil Diubah')
          .setDescription(`Nama bot sekarang menjadi: **${newValue}**`)
          .setColor('#00FF00')
          .setTimestamp();
        
        return await interaction.reply({ embeds: [embed], ephemeral: true });
      }

      if (subcommand === 'role') {
        const newValue = interaction.options.getString('value');
        globalConfig.role = newValue;
        await globalConfig.save();
        
        const embed = new EmbedBuilder()
          .setTitle('Role Berhasil Diubah')
          .setDescription(`Role bot sekarang menjadi: **${newValue}**`)
          .setColor('#00FF00')
          .setTimestamp();
        
        return await interaction.reply({ embeds: [embed], ephemeral: true });
      }

      if (subcommand === 'personality') {
        const newValue = interaction.options.getString('value');
        globalConfig.personality = newValue;
        await globalConfig.save();
        
        const embed = new EmbedBuilder()
          .setTitle('Kepribadian Berhasil Diubah')
          .setDescription(`Kepribadian bot sekarang menjadi: **${newValue}**`)
          .setColor('#00FF00')
          .setTimestamp();
        
        return await interaction.reply({ embeds: [embed], ephemeral: true });
      }

      if (subcommand === 'language') {
        const newValue = interaction.options.getString('value');
        globalConfig.language = newValue;
        await globalConfig.save();
        
        const embed = new EmbedBuilder()
          .setTitle('Bahasa Berhasil Diubah')
          .setDescription(`Bahasa bot sekarang menjadi: **${newValue}**`)
          .setColor('#00FF00')
          .setTimestamp();
        
        return await interaction.reply({ embeds: [embed], ephemeral: true });
      }

      if (subcommand === 'knowledge') {
        const newValue = interaction.options.getString('value');
        globalConfig.knowledge = newValue;
        await globalConfig.save();
        
        const embed = new EmbedBuilder()
          .setTitle('Pengetahuan Berhasil Diubah')
          .setDescription(`Pengetahuan bot sekarang menjadi: **${newValue}**`)
          .setColor('#00FF00')
          .setTimestamp();
        
        return await interaction.reply({ embeds: [embed], ephemeral: true });
      }

      if (subcommand === 'tone') {
        const newValue = interaction.options.getString('value');
        globalConfig.tone = newValue;
        await globalConfig.save();
        
        const embed = new EmbedBuilder()
          .setTitle('Nada Bicara Berhasil Diubah')
          .setDescription(`Nada bicara bot sekarang menjadi: **${newValue}**`)
          .setColor('#00FF00')
          .setTimestamp();
        
        return await interaction.reply({ embeds: [embed], ephemeral: true });
      }

      if (subcommand === 'format_response') {
        const newValue = interaction.options.getString('value');
        globalConfig.format_response = newValue;
        await globalConfig.save();
        
        const embed = new EmbedBuilder()
          .setTitle('Format Jawaban Berhasil Diubah')
          .setDescription(`Format jawaban bot sekarang menjadi: **${newValue}**`)
          .setColor('#00FF00')
          .setTimestamp();
        
        return await interaction.reply({ embeds: [embed], ephemeral: true });
      }

      if (subcommand === 'user_name') {
        const newValue = interaction.options.getString('value');
        globalConfig.user_name = newValue;
        await globalConfig.save();
        
        const embed = new EmbedBuilder()
          .setTitle('Panggilan Pengguna Berhasil Diubah')
          .setDescription(`Panggilan pengguna bot sekarang menjadi: **${newValue}**`)
          .setColor('#00FF00')
          .setTimestamp();
        
        return await interaction.reply({ embeds: [embed], ephemeral: true });
      }

      if (subcommand === 'reset') {
        // Reset semua nilai ke default
        globalConfig.name = "Megumin";
        globalConfig.role = "asisten anime";
        globalConfig.personality = "tsundere";
        globalConfig.knowledge = "anime";
        globalConfig.limitations = "tidak mengujar kebencian";
        globalConfig.language = "Bahasa Indonesia dengan kata-kata Jepang";
        globalConfig.tone = "kawaii dan ekpresif";
        globalConfig.format_response = "jawaban dengan gaya anime yang ekspresif";
        globalConfig.user_name = "{user}";
        
        await globalConfig.save();
        
        const embed = new EmbedBuilder()
          .setTitle('Pengaturan Berhasil Direset')
          .setDescription('Semua pengaturan telah dikembalikan ke nilai default.')
          .setColor('#00FF00')
          .setTimestamp();
        
        return await interaction.reply({ embeds: [embed], ephemeral: true });
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