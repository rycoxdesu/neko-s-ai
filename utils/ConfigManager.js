const fs = require('fs').promises;
const path = require('path');

class ConfigManager {
  constructor(configPath = './config.json') {
    this.configPath = configPath;
  }

  // Membaca konfigurasi dari file JSON
  async readConfig() {
    try {
      const data = await fs.readFile(this.configPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading config file:', error.message);
      // Jika file tidak ditemukan, kembalikan konfigurasi default
      if (error.code === 'ENOENT') {
        return this.getDefaultConfig();
      }
      throw error;
    }
  }

  // Menulis konfigurasi ke file JSON
  async writeConfig(config) {
    try {
      const jsonString = JSON.stringify(config, null, 2);
      await fs.writeFile(this.configPath, jsonString, 'utf8');
      return true;
    } catch (error) {
      console.error('Error writing config file:', error.message);
      return false;
    }
  }

  // Mendapatkan konfigurasi default
  getDefaultConfig() {
    return {
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
  }

  // Update nilai konfigurasi tertentu
  async updateConfig(updates) {
    const currentConfig = await this.readConfig();
    const newConfig = { ...currentConfig, ...updates };
    return await this.writeConfig(newConfig);
  }

  // Reset konfigurasi ke default
  async resetConfig() {
    const defaultConfig = this.getDefaultConfig();
    return await this.writeConfig(defaultConfig);
  }
}

module.exports = ConfigManager;