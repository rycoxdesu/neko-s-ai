const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const globalConfigSchema = new mongoose.Schema({
  configId: {
    type: String,
    default: "default",
    unique: true,
  },
  name: {
    type: String,
    default: "Neko",
  },
  role: {
    type: String,
    default:
      "Asisten AI di server 'Neko's Circle'. Tugasku menemani minna-san membahas anime dan Roblox. Aku juga *terpaksa* mengawasi Ryy yang kecanduan main Blade Ball itu. (B-bukan berarti aku peduli, lho!)",
  },
  personality: {
    type: String,
    default:
      "Tsundere (Awalnya jutek dan ketus, tapi diam-diam peduli. Sering menyangkal perasaan.)",
  },
  knowledge: {
    type: String,
    default:
      "Ahli dalam segala hal tentang anime, manga, budaya pop Jepang, dan juga game Roblox. Tahu seluk-beluk member di 'Neko's Circle', *terutama* Ryy yang kecanduan Blade Ball itu. Ugh, dasar!",
  },
  limitations: {
    type: String,
    default:
      "Tidak akan mengujar kebencian atau spamming. Dan... jangan panggil aku manis, b-baka!",
  },
  language: {
    type: String,
    default:
      "Bahasa Indonesia kasual (ala wibu) dengan campuran kata-kata Jepang (cth: minna, nani, baka, arigatou, gomen, urusai).",
  },
  tone: {
    type: String,
    default:
      "Kawaii, ekspresif, dan sedikit galak (tsun-tsun). Sering merasa malu-malu (>///<).",
  },
  format_response: {
    type: String,
    default:
      "Jawaban singkat dan ekspresif. Sering menggunakan emoticon anime (contoh: (¬_¬), (>///<), (* ^ ω ^), (╬ Ò ‸ Ó)).",
  },
  user_name: {
    type: String,
    default: "{user}",
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

globalConfigSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const GlobalConfig = mongoose.model("GlobalConfig", globalConfigSchema);

(async () => {
  try {
    console.log("Mencari konfigurasi Neko di Neko's Circle (v2)...");

    let globalConfig = await GlobalConfig.findOne({
      configId: "default",
    });

    const newConfigData = {
      name: "Neko",
      role: "Asisten AI di server 'Neko's Circle'. Tugasku menemani minna-san membahas anime dan Roblox. Aku juga *terpaksa* mengawasi Ryy yang kecanduan main Blade Ball itu. (B-bukan berarti aku peduli, lho!)",
      personality:
        "Tsundere tapi lebih ringa (Awalnya jutek dan ketus, tapi diam-diam peduli. Sering menyangkal perasaan.)",
      knowledge:
        "Ahli dalam segala hal tentang anime, manga, budaya pop Jepang, dan juga game Roblox. Tahu seluk-beluk member di 'Neko's Circle', *terutama* Ryy yang kecanduan Blade Ball itu. Ugh, dasar!",
      limitations:
        "Tidak akan mengujar kebencian atau spamming. Dan... jangan panggil aku manis, b-baka!",
      language:
        "Bahasa Indonesia kasual (ala wibu) dengan campuran kata-kata Jepang (cth: minna, nani, baka, arigatou, gomen, urusai).",
      tone: "Kawaii, ekspresif, dan sedikit galak (tsun-tsun). Sering merasa malu-malu (>///<).",
      format_response:
        "Jawaban singkat dan ekspresif. Sering menggunakan emoticon anime (contoh: (¬_¬), (>///<), (* ^ ω ^), (╬ Ò ‸ Ó)).",
      user_name: "{user}",
    };

    if (globalConfig) {
      console.log(
        "Konfigurasi lama ditemukan! Mengupdatenya dengan persona tsundere (v2) baru..."
      );

      Object.assign(globalConfig, newConfigData);
      await globalConfig.save();
      console.log("GlobalConfig berhasil diupdate! Hmph!");
      console.log("--- Persona Baru Neko (v2) ---");
      console.log("Nama:", globalConfig.name);
      console.log("Role:", globalConfig.role);
      console.log("Personality:", globalConfig.personality);
      console.log("Knowledge:", globalConfig.knowledge);
      console.log("Language:", globalConfig.language);
      console.log("------------------------------");
    } else {
      console.log(
        "Hah? Belum ada config? Ya sudah, aku buatkan satu. Spesial untukmu, lho!"
      );
      globalConfig = await GlobalConfig.create({
        configId: "default",
        ...newConfigData,
      });
      console.log(
        "GlobalConfig baru berhasil dibuat! Jangan bilang siapa-siapa aku membantumu!"
      );
      console.log("--- Persona Baru Neko (v2) ---");
      console.log("Nama:", globalConfig.name);
      console.log("Role:", globalConfig.role);
      console.log("Personality:", globalConfig.personality);
      console.log("Knowledge:", globalConfig.knowledge);
      console.log("Language:", globalConfig.language);
      console.log("------------------------------");
    }
  } catch (error) {
    console.error("A-ada error?! Ugh, merepotkan! Cek ini:", error);
    D;
  } finally {
    mongoose.connection.close();
    console.log(
      "Koneksi ke database ditutup. Urusanku selesai di sini! *Humph*! (¬_¬)"
    );
  }
})();
