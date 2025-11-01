const {
  Client,
  GatewayIntentBits,
  Collection,
  Events,
  ActivityType,
  REST,
  Routes,
} = require("discord.js");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();
const connectDB = require("./config/database");
const Logger = require("./utils/logger");
const DiscordLogger = require("./utils/discordLogger");
const Conversation = require("./config/conversation");
const ConfigManager = require('./utils/ConfigManager');
const { handleKeywordCommands } = require('./utils/keywordCommands');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
});

let discordLogger;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Karena hanya menggunakan mention/reply/kata kunci, tidak perlu memuat command slash
// client.commands = new Collection();
// const commandsPath = path.join(__dirname, "commands");
// const commandFiles = fs
//   .readdirSync(commandsPath)
//   .filter((file) => file.endsWith(".js"));
// 
// for (const file of commandFiles) {
//   const filePath = path.join(commandsPath, file);
//   const command = require(filePath);
//   client.commands.set(command.data.name, command);
//   Logger.log(`Loaded command: ${command.data.name}`);
// }

connectDB();

client.once(Events.ClientReady, async () => {
  Logger.success(`${client.user.tag} is online!`);

  discordLogger = new DiscordLogger(client);
  await discordLogger.success(`🤖 ${client.user.tag} is online!`);

  try {
    const configManager = new ConfigManager();
    const config = await configManager.readConfig();
    console.log('Konfigurasi Global dari file JSON:', {
      name: config.name,
      role: config.role,
      personality: config.personality,
      language: config.language,
    });
  } catch (error) {
    console.error("Error saat membaca konfigurasi:", error);
  }

  // Kode registrasi command dihapus karena tidak lagi menggunakan command slash
  // try {
  //   const commands = [];
  //   const commandsPath = path.join(__dirname, "commands");
  //   const commandFiles = fs
  //     .readdirSync(commandsPath)
  //     .filter((file) => file.endsWith(".js"));
  // 
  //   for (const file of commandFiles) {
  //     const filePath = path.join(commandsPath, file);
  //     const command = require(filePath);
  //     commands.push(command.data.toJSON());
  //   }
  // 
  //   const rest = new REST({ version: "10" }).setToken(
  //     process.env.DISCORD_TOKEN
  //   );
  // 
  //   Logger.log(
  //     `Started refreshing ${commands.length} application (/) commands.`
  //   );
  // 
  //   const data = await rest.put(
  //     Routes.applicationGuildCommands(
  //       process.env.CLIENT_ID,
  //       process.env.GUILD_ID
  //     ),
  //     { body: commands }
  //   );
  // 
  //   Logger.log(
  //     `Successfully reloaded ${data.length} application (/) commands.`
  //   );
  // } catch (error) {
  //   Logger.error("Error registering commands:", error);
  //   if (discordLogger)
  //     await discordLogger.error(`Error registering commands: ${error.message}`);
  // }

  client.user.setActivity({
    name: "AI with | Neko's Circle",
    type: ActivityType.Listening,
  });

  Logger.log("Bot is ready and listening for commands!");
});

// client.on(Events.InteractionCreate, async (interaction) => {
//   if (!interaction.isChatInputCommand()) return;
// 
//   const command = client.commands.get(interaction.commandName);
// 
//   if (!command) {
//     Logger.warn(`Command ${interaction.commandName} not found`);
//     if (discordLogger)
//       await discordLogger.warn(`Command ${interaction.commandName} not found`);
//     return;
//   }
// 
//   try {
//     await command.execute(interaction);
//     Logger.log(
//       `Executed command: ${interaction.commandName} by ${interaction.user.tag}`
//     );
//   } catch (error) {
//     Logger.error(
//       `Error executing command ${interaction.commandName}: ${error.message}`
//     );
//     if (discordLogger)
//       await discordLogger.error(
//         `Error executing command ${interaction.commandName}: ${error.message}`
//       );
// 
//     if (interaction.replied || interaction.deferred) {
//       await interaction.followUp({
//         content: "There was an error while executing this command!",
//         ephemeral: true,
//       });
//     } else {
//       await interaction.reply({
//         content: "There was an error while executing this command!",
//         ephemeral: true,
//       });
//     }
//   }
// });

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  const isReplyToBot =
    message.reference &&
    message.reference.messageId &&
    (await message.channel.messages.fetch(message.reference.messageId)).author
      .id === client.user.id;

  const containsNeko = message.content.toLowerCase().includes("neko");

  if (
    message.content.includes(`<@${client.user.id}>`) ||
    message.content.includes(`<@!${client.user.id}>`) ||
    isReplyToBot ||
    containsNeko
  ) {
    try {
      // Periksa apakah pesan mengandung kata kunci neko add role sebelum melanjutkan
      const content = message.content.toLowerCase();
      if (content.includes('neko add role')) {
        const configManager = new ConfigManager();
        const config = await configManager.readConfig();
        await handleKeywordCommands(message, config);
        return; // Hentikan eksekusi di sini, jangan lanjut ke AI
      }

      let prompt = "";

      if (
        message.content.includes(`<@${client.user.id}>`) ||
        message.content.includes(`<@!${client.user.id}>`)
      ) {
        prompt = message.content
          .replace(`<@${client.user.id}>`, "")
          .replace(`<@!${client.user.id}>`, "")
          .trim();
      } else if (isReplyToBot) {
        const repliedMessage = await message.channel.messages.fetch(
          message.reference.messageId
        );
        prompt = message.content || "Balas pesan sebelumnya";
      } else if (containsNeko) {
        prompt = message.content;
      }

      const userId = message.author.id;
      const displayName = message.member
        ? message.member.displayName || message.author.username
        : message.author.username;
      const isRyy =
        displayName.toLowerCase().includes("ryy") ||
        message.author.username.toLowerCase().includes("ryy") ||
        message.author.id === process.env.RYY_USER_ID;
      const username = isRyy ? "Ryy" : displayName;

      await message.channel.sendTyping();
      console.log("Typing indicator ditampilkan untuk pesan:", message.content);

      if (prompt) {
        try {
          let conversation = await Conversation.findOne({
            userId: userId,
            isActive: true,
          });

          if (!conversation) {
            const sessionId = `session-${uuidv4().slice(0, 8)}`;
            conversation = new Conversation({
              userId: userId,
              sessionId: sessionId,
              messages: [],
            });
            await conversation.save();
          }

          const configManager = new ConfigManager();
          const config = await configManager.readConfig();

          console.log("Global Config diambil:", {
            name: config.name,
            role: config.role,
            personality: config.personality,
            language: config.language,
          });

          conversation.messages.push({
            role: "user",
            content: prompt,
          });

          const context = 
            `Nama: ${config.name}\n` +
            `Role: ${config.role}\n` +
            `Kepribadian: ${config.personality}\n` +
            `Pengetahuan: ${config.knowledge}\n` +
            `Bahasa: ${config.language}\n` +
            `Nada bicara: ${config.tone}\n` +
            `Format jawaban: ${config.format_response}\n` +
            `Panggilan: ${config.user_name.replace(/{user}/g, username)}\n` +
            `Batasan: ${config.limitations}\n` +
            (username.toLowerCase() === "ryy" || message.author.id === process.env.RYY_USER_ID
              ? `${config.ryy_special_behavior}\n`
              : `${config.other_users_behavior}\n`);

          let fullPrompt = context + "\n\nRiwayat percakapan:\n";
          for (const msg of conversation.messages) {
            const role = msg.role === "user" ? "Pengguna" : "Assistant";
            fullPrompt += `${role}: ${msg.content}\n`;
          }

          fullPrompt +=
            "\nAssistant: (Balaslah sesuai kepribadian dan aturan di atas, dengan mempertimbangkan riwayat percakapan)";

          const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            requestOptions: {
              timeout: 30000,
            },
          });

          const result = await model.generateContent(fullPrompt);
          const response = await result.response;
          const text = response.text();

          if (text) {
            // Fungsi untuk memformat teks agar lebih menarik di Discord
            const cleanAndFormatText = (inputText) => {
              if (!inputText) return '';
              
              // Hapus instruksi konteks yang tidak perlu
              let cleaned = inputText.replace(/\(Balaslah sesuai kepribadian dan aturan di atas.*?\)/g, '');
              cleaned = cleaned.replace(/\(dengan mempertimbangkan riwayat percakapan\)/g, '');
              
              // Hapus baris kosong berlebihan
              cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n');
              
              // Format kata-kata penting dengan bold di Discord (menggunakan **)
              // Tambahkan ** di sekitar kata-kata penting
              const importantWords = ['Neko', 'AI', 'Discord', 'server', 'asisten', 'tsundere', 'Blade Ball', 'Ryy', 'anime', 'Roblox', 'minna-san', 'baka', 'nani', 'urusai', 'tugas'];
              
              importantWords.forEach(word => {
                // Gunakan regex untuk mengganti kata penting dengan format bold
                const regex = new RegExp(`\\b(${word})\\b`, 'gi');
                cleaned = cleaned.replace(regex, '**$1**');
              });
              
              // Trim whitespace di awal dan akhir
              cleaned = cleaned.trim();
              
              return cleaned;
            };

            let formattedText = cleanAndFormatText(text);
            
            // Pastikan teks tidak melebihi batas maksimum Discord (2000 karakter)
            if (formattedText.length > 1950) {
              formattedText = formattedText.substring(0, 1950) + '... [pesan dipotong karena terlalu panjang]';
            }
            
            conversation.messages.push({
              role: "model",
              content: text, // Simpan teks asli ke database
            });

            if (conversation.messages.length > 20) {
              conversation.messages = conversation.messages.slice(-20);
            }

            await conversation.save();

            await message.reply(formattedText);
          } else {
            await message.reply("I couldn't generate a response.");
          }
        } catch (error) {
          Logger.error(
            `Error responding to mention/reply/keyword: ${error.message}`
          );
          if (discordLogger)
            await discordLogger.error(
              `Error responding to mention/reply/keyword from ${message.author.tag}: ${error.message}`
            );

          if (
            error.message.includes("timeout") ||
            error.message.includes("Connect Timeout")
          ) {
            await message.reply(
              `Maaf ${username}, aku sedang sibuk sekarang. Coba tanya lagi nanti yaa~ (¬_¬)`
            );
          } else {
            await message.reply(
              `I'm sorry, I'm having trouble connecting to the AI right now. Your message: "${prompt}"\n\nError: ${error.message}`
            );
          }
        }
      } else {
        // Panggil fungsi untuk menangani kata kunci dari file terpisah
        await handleKeywordCommands(message, config);
      }
    } catch (error) {
      Logger.error(
        `Error responding to mention/reply/keyword: ${error.message}`
      );
      if (discordLogger)
        await discordLogger.error(
          `Error responding to mention/reply/keyword from ${message.author.tag}: ${error.message}`
        );
      await message.reply("Sorry, I'm having trouble responding right now.");
    }
  }
});

client
  .login(process.env.DISCORD_TOKEN)
  .then(async () => {
    Logger.success("Successfully logged in to Discord");
    if (discordLogger)
      await discordLogger.success("Successfully logged in to Discord");
  })
  .catch(async (error) => {
    Logger.error(`Error logging in to Discord: ${error.message}`);
    if (discordLogger)
      await discordLogger.error(
        `Error logging in to Discord: ${error.message}`
      );
  });

process.on("unhandledRejection", async (reason, promise) => {
  Logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
  if (discordLogger)
    await discordLogger.error(
      `Unhandled Rejection at: ${promise}, reason: ${reason}`
    );
});

process.on("uncaughtException", async (error) => {
  Logger.error(`Uncaught Exception: ${error.message}`);
  if (discordLogger)
    await discordLogger.error(`Uncaught Exception: ${error.message}`);
  process.exit(1);
});
