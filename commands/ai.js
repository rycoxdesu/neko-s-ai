const { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();
const GlobalConfig = require('../config/globalConfig');
const Conversation = require('../config/conversation');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ai')
    .setDescription('Chat with Neko\'s AI assistant')
    .addStringOption(option =>
      option.setName('prompt')
        .setDescription('Your message to the AI')
        .setRequired(true)
    ),

  /**
   * 
   * @param {ChatInputCommandInteraction} interaction 
   */
  async execute(interaction) {
    await interaction.deferReply();
    
    try {
      const prompt = interaction.options.getString('prompt');
      const userId = interaction.user.id;
      // Coba ambil display name dari member, kalau gak ada pake username
      let displayName = interaction.user.username;
      if (interaction.member && interaction.member.displayName) {
        displayName = interaction.member.displayName;
      }
      // Cek apakah pengguna adalah Ryy berdasarkan username atau nickname
      const isRyy = displayName.toLowerCase().includes('ryy') || 
                    interaction.user.username.toLowerCase().includes('ryy') ||
                    interaction.user.id === process.env.RYY_USER_ID; // Jika kamu ingin spesifik berdasarkan ID
      const username = isRyy ? 'Ryy' : displayName; // Selalu panggil "Ryy" kalau pengguna adalah Ryy
      
      // Dapatkan atau buat sesi percakapan untuk pengguna
      let conversation = await Conversation.findOne({ 
        userId: userId, 
        isActive: true 
      });
      
      if (!conversation) {
        // Buat sesi baru jika belum ada
        const sessionId = `session-${uuidv4().slice(0, 8)}`;
        conversation = new Conversation({
          userId: userId,
          sessionId: sessionId,
          messages: []
        });
        await conversation.save();
      }
      
      // Dapatkan konfigurasi global (default) atau buat baru jika belum ada
      let globalConfig = await GlobalConfig.findOne();
      if (!globalConfig) {
        // Buat konfigurasi global default jika belum ada
        globalConfig = await GlobalConfig.create({
          name: "Neko",
          role: "asisten anime dan main Ryy",
          personality: "tsundere",
          knowledge: "anime",
          limitations: "tidak mengujar kebencian",
          language: "Bahasa Indonesia dengan kata-kata Jepang",
          tone: "kawaii dan ekpresif",
          format_response: "jawaban dengan gaya anime yang ekspresif",
          user_name: "{user}"
        });
      }
      
      // Logging untuk debugging
      console.log('Global Config diambil di command ai:', {
        name: globalConfig.name,
        role: globalConfig.role,
        personality: globalConfig.personality,
        language: globalConfig.language
      });
      
      // Gunakan konfigurasi langsung tanpa default karena field seharusnya udah ada di schema
      const config = {
        name: globalConfig.name,
        role: globalConfig.role,
        personality: globalConfig.personality,
        knowledge: globalConfig.knowledge,
        limitations: globalConfig.limitations,
        language: globalConfig.language,
        tone: globalConfig.tone,
        format_response: globalConfig.format_response,
        user_name: globalConfig.user_name,
        ryy_special_behavior: globalConfig.ryy_special_behavior,
        other_users_behavior: globalConfig.other_users_behavior
      };
      
      // Tambahkan pesan pengguna ke percakapan
      conversation.messages.push({
        role: 'user',
        content: prompt
      });
      
      // Buat konteks berdasarkan konfigurasi global
      const context = 
        `Kamu adalah ${config.name}, seorang ${config.role.split('.')[0]}. ` +
        `Kepribadianmu ${config.personality.split('(')[0]}. ` +
        `Gunakan bahasa ${config.language}. ` +
        `Panggil pengguna dengan sebutan '${config.user_name.replace(/{user}/g, username)}'. ` +
        `Responsmu ${config.format_response.split('.')[0]}. ` +
        `Selalu sertakan emoji anime dan ekspresi tsundere.` +
        (username.toLowerCase() === 'ryy' || interaction.user.id === process.env.RYY_USER_ID
          ? ` Saat bicara dengan Ryy: lebih tsundere, marahin dia main Blade Ball, tapi peduli diam-diam.`
          : ` Saat bicara dengan lainnya: tsundere tapi lebih pelan.`);
      
      // Gabungkan semua pesan sebelumnya dengan konteks dan pesan baru
      let fullPrompt = context + '\n\nRiwayat percakapan:\n';
      for (const msg of conversation.messages) {
        const role = msg.role === 'user' ? 'Pengguna' : 'Assistant';
        fullPrompt += `${role}: ${msg.content}\n`;
      }
      
      fullPrompt += '\nAssistant: (Balaslah sesuai kepribadian dan aturan di atas, dengan mempertimbangkan riwayat percakapan)';
      
      // Gunakan model tanpa system instruction untuk lebih kompatibel
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.5-flash',
        // Tambahkan timeout yang lebih lama
        requestOptions: {
          timeout: 30000, // 30 detik
        }
      });
      
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();
      
      if (text) {
        // Tambahkan respon bot ke percakapan
        conversation.messages.push({
          role: 'model', // Gemini menggunakan 'model' bukan 'assistant'
          content: text
        });
        
        // Batasi jumlah pesan dalam sesi untuk menghindari prompt yang terlalu panjang
        if (conversation.messages.length > 20) { // Batasi 20 pesan terakhir
          conversation.messages = conversation.messages.slice(-20);
        }
        
        await conversation.save();
        
        const embed = new EmbedBuilder()
          .setTitle('Neko\'s AI Response')
          .setDescription(text)
          .setColor('#FF69B4')
          .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
          .setTimestamp();
        
        await interaction.editReply({ embeds: [embed] });
      } else {
        const embed = new EmbedBuilder()
          .setTitle('Neko\'s AI Response')
          .setDescription('No response generated.')
          .setColor('#FF69B4')
          .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
          .setTimestamp();
        
        await interaction.editReply({ embeds: [embed] });
      }
    } catch (error) {
      console.error('Error with AI command:', error);
      
      // Cek apakah errornya karena timeout
      if (error.message && (error.message.includes('timeout') || error.message.includes('Connect Timeout'))) {
        const errorEmbed = new EmbedBuilder()
          .setTitle('Sedang Sibuk~')
          .setDescription(`Maaf ${username}, aku sedang sibuk sekarang. Coba tanya lagi nanti yaa~ (¬_¬)`)
          .setColor('#FFA500') // Oranye untuk warning
          .setTimestamp();
        
        await interaction.editReply({ embeds: [errorEmbed] });
      } else {
        const errorEmbed = new EmbedBuilder()
          .setTitle('Error')
          .setDescription('Sorry, I couldn\'t process your request. Please try again.')
          .setColor('#FF0000')
          .setTimestamp();
        
        await interaction.editReply({ embeds: [errorEmbed] });
      }
    }
  },
};