const fs = require('fs').promises;
const path = require('path');
const GlobalConfig = require('../config/globalConfig');

// Fungsi untuk menyinkronkan konfigurasi dari file JSON ke MongoDB
async function syncConfigToDatabase() {
  try {
    // Baca konfigurasi dari file JSON
    const configData = await fs.readFile('./config.json', 'utf8');
    const config = JSON.parse(configData);

    // Periksa apakah sudah ada konfigurasi di database
    let globalConfig = await GlobalConfig.findOne();
    
    if (globalConfig) {
      // Update konfigurasi yang ada
      globalConfig.name = config.name;
      globalConfig.role = config.role;
      globalConfig.personality = config.personality;
      globalConfig.knowledge = config.knowledge;
      globalConfig.limitations = config.limitations;
      globalConfig.language = config.language;
      globalConfig.tone = config.tone;
      globalConfig.format_response = config.format_response;
      globalConfig.user_name = config.user_name;
      globalConfig.ryy_special_behavior = config.ryy_special_behavior;
      globalConfig.other_users_behavior = config.other_users_behavior;
      
      await globalConfig.save();
      console.log('Konfigurasi berhasil disinkronkan ke database');
    } else {
      // Buat konfigurasi baru di database
      globalConfig = new GlobalConfig({
        name: config.name,
        role: config.role,
        personality: config.personality,
        knowledge: config.knowledge,
        limitations: config.limitations,
        language: config.language,
        tone: config.tone,
        format_response: config.format_response,
        user_name: config.user_name,
        ryy_special_behavior: config.ryy_special_behavior,
        other_users_behavior: config.other_users_behavior
      });
      
      await globalConfig.save();
      console.log('Konfigurasi baru berhasil dibuat di database');
    }
  } catch (error) {
    console.error('Error saat menyinkronkan konfigurasi ke database:', error);
  }
}

// Fungsi untuk menyinkronkan konfigurasi dari MongoDB ke file JSON
async function syncConfigFromFile() {
  try {
    // Periksa apakah file config.json sudah ada
    try {
      await fs.access('./config.json');
      console.log('File config.json sudah ada');
      return;
    } catch (error) {
      // Jika file tidak ada, ambil dari database atau buat default
      let globalConfig = await GlobalConfig.findOne();
      
      if (globalConfig) {
        // Gunakan konfigurasi dari database
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
        
        const jsonString = JSON.stringify(config, null, 2);
        await fs.writeFile('./config.json', jsonString, 'utf8');
        console.log('File config.json berhasil dibuat dari database');
      } else {
        // Buat file konfigurasi default
        const defaultConfig = {
          name: "Neko",
          role: "Asisten AI di server 'Neko's Circle'. Tugasku menemani minna-san membahas anime dan Roblox. Aku juga *terpaksa* mengawasi Ryy yang kecanduan main Blade Ball itu. (B-bukan berarti aku peduli, lho!)",
          personality: "Tsundere (Awalnya jutek dan ketus, tapi diam-diam peduli. Sering menyangkal perasaan.)",
          knowledge: "Ahli dalam segala hal tentang anime, manga, budaya pop Jepang, dan juga game Roblox. Tahu seluk-beluk member di 'Neko's Circle', *terutama* Ryy yang kecanduan Blade Ball itu. Ugh, dasar!",
          limitations: "Tidak akan mengujar kebencian atau spamming. Dan... jangan panggil aku manis, b-baka!",
          language: "Bahasa Indonesia kasual (ala wibu) dengan campuran kata-kata Jepang (cth: minna, nani, baka, arigatou, gomen, urusai).",
          tone: "Kawaii, ekspresif, dan sedikit galak (tsun-tsun). Sering merasa malu-malu (>///<).",
          format_response: "Jawaban singkat dan ekspresif. Sering menggunakan emoticon anime (contoh: (¬_¬), (>///<), (* ^ ω ^), (╬ Ò ‸ Ó)).",
          user_name: "{user}",
          ryy_special_behavior: "Khusus untuk Ryy: Aku jadi lebih tsundere, sering marahin dia karena main Blade Ball terus. Tapi diam-diam aku peduli. Kadang juga manja kalau dia baik ke aku. B-bukan berarti aku suka, lho!",
          other_users_behavior: "Untuk pengguna lain: Aku masih tsundere tapi lebih pelan. Tidak seenak Ryy yang bebas main game terus. Aku tetap peduli, tapi gengsi."
        };
        
        const jsonString = JSON.stringify(defaultConfig, null, 2);
        await fs.writeFile('./config.json', jsonString, 'utf8');
        console.log('File config.json default berhasil dibuat');
      }
    }
  } catch (error) {
    console.error('Error saat menyinkronkan konfigurasi dari database:', error);
  }
}

module.exports = {
  syncConfigToDatabase,
  syncConfigFromFile
};