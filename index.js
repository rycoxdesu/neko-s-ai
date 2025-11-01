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
const GlobalConfig = require("./config/globalConfig");
const Conversation = require("./config/conversation");

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

client.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  client.commands.set(command.data.name, command);
  Logger.log(`Loaded command: ${command.data.name}`);
}

connectDB();

client.once(Events.ClientReady, async () => {
  Logger.success(`${client.user.tag} is online!`);

  discordLogger = new DiscordLogger(client);
  await discordLogger.success(`🤖 ${client.user.tag} is online!`);

  try {
    const allConfigs = await GlobalConfig.find({});
    console.log(`Jumlah GlobalConfig di database: ${allConfigs.length}`);
    if (allConfigs.length > 0) {
      allConfigs.forEach((config, index) => {
        console.log(`GlobalConfig ${index + 1}:`, {
          id: config._id,
          name: config.name,
          role: config.role,
          personality: config.personality,
          language: config.language,
          updatedAt: config.updatedAt,
        });
      });
    } else {
      console.log(
        "Belum ada GlobalConfig di database, akan dibuat saat pertama kali dipanggil"
      );
    }
  } catch (error) {
    console.error("Error saat mengambil GlobalConfig:", error);
  }

  try {
    const commands = [];
    const commandsPath = path.join(__dirname, "commands");
    const commandFiles = fs
      .readdirSync(commandsPath)
      .filter((file) => file.endsWith(".js"));

    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);
      commands.push(command.data.toJSON());
    }

    const rest = new REST({ version: "10" }).setToken(
      process.env.DISCORD_TOKEN
    );

    Logger.log(
      `Started refreshing ${commands.length} application (/) commands.`
    );

    const data = await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: commands }
    );

    Logger.log(
      `Successfully reloaded ${data.length} application (/) commands.`
    );
  } catch (error) {
    Logger.error("Error registering commands:", error);
    if (discordLogger)
      await discordLogger.error(`Error registering commands: ${error.message}`);
  }

  client.user.setActivity({
    name: "AI with | Neko's Circle",
    type: ActivityType.Listening,
  });

  Logger.log("Bot is ready and listening for commands!");
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    Logger.warn(`Command ${interaction.commandName} not found`);
    if (discordLogger)
      await discordLogger.warn(`Command ${interaction.commandName} not found`);
    return;
  }

  try {
    await command.execute(interaction);
    Logger.log(
      `Executed command: ${interaction.commandName} by ${interaction.user.tag}`
    );
  } catch (error) {
    Logger.error(
      `Error executing command ${interaction.commandName}: ${error.message}`
    );
    if (discordLogger)
      await discordLogger.error(
        `Error executing command ${interaction.commandName}: ${error.message}`
      );

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  }
});

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

          let globalConfig = await GlobalConfig.findOne();
          if (!globalConfig) {
            globalConfig = await GlobalConfig.create({
              name: "Neko",
              role: "asisten anime dan main Ryy",
              personality: "tsundere",
              knowledge: "anime",
              limitations: "tidak mengujar kebencian",
              language: "Bahasa Indonesia dengan kata-kata Jepang",
              tone: "kawaii dan ekpresif",
              format_response: "jawaban dengan gaya anime yang ekspresif",
              user_name: "{user}",
            });
          }

          console.log("Global Config diambil:", {
            name: globalConfig.name,
            role: globalConfig.role,
            personality: globalConfig.personality,
            language: globalConfig.language,
          });

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
            other_users_behavior: globalConfig.other_users_behavior,
          };

          conversation.messages.push({
            role: "user",
            content: prompt,
          });

          const context =
            `Kamu adalah ${config.name}, seorang ${
              config.role.split(".")[0]
            }. ` +
            `Kepribadianmu ${config.personality.split("(")[0]}. ` +
            `Gunakan bahasa ${config.language}. ` +
            `Panggil pengguna dengan sebutan '${config.user_name.replace(
              /{user}/g,
              username
            )}'. ` +
            `Responsmu ${config.format_response.split(".")[0]}. ` +
            `Selalu sertakan emoji anime dan ekspresi tsundere.` +
            (username.toLowerCase() === "ryy" ||
            message.author.id === process.env.RYY_USER_ID
              ? ` Saat bicara dengan Ryy: lebih tsundere, marahin dia main Blade Ball, tapi peduli diam-diam.`
              : ` Saat bicara dengan lainnya: tsundere tapi lebih pelan.`);

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
            conversation.messages.push({
              role: "model",
              content: text,
            });

            if (conversation.messages.length > 20) {
              conversation.messages = conversation.messages.slice(-20);
            }

            await conversation.save();

            await message.reply(text);
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
        await message.reply(
          "Hai! Aku Neko, asisten anime yang tsundere! Tanya aku apa saja ya~ ٩(◕‿◕｡)۶"
        );
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
