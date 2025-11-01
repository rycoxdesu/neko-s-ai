// Fungsi untuk menangani perintah neko help
async function handleHelpCommand(message, config) {
  const content = message.content.toLowerCase();

  // Cek apakah pesan mengandung perintah help
  if (
    content === "neko help" ||
    content === "neko bantuan" ||
    content === "neko commands"
  ) {
    try {
      // Dapatkan nama bot dari konfigurasi
      const botName = config.name || "Neko";

      // Buat pesan bantuan dengan semua command
      const helpMessage =
        `**Daftar Command ${botName}:**\n\n` +
        "**Text Commands:**\n" +
        "```\n" +
        "• neko clear <jumlah> - Menghapus sejumlah pesan (maksimal 99)\n" +
        "• neko delete <jumlah> - Alternatif dari clear\n" +
        "• neko add role <@role> <@user> - Memberikan role ke pengguna\n" +
        "• neko gambar <deskripsi> - Membuat gambar dari deskripsi\n" +
        "• neko image <deskripsi> - Alternatif dari gambar\n" +
        "• neko create <deskripsi> - Alternatif dari gambar\n" +
        "• neko help - Menampilkan pesan bantuan ini\n" +
        "```\n\n" +
        "**AI Chat:**\n" +
        "```\n" +
        `• Menyebut @${botName} - Memulai percakapan dengan bot\n` +
        "• Balas pesan bot - Melanjutkan percakapan\n" +
        "• Gunakan kata 'neko' dalam pesan - Memicu percakapan AI\n" +
        "```\n\n" +
        "Contoh: `neko clear 10`, `neko add role @VIP @John`, `neko buatkan gambar kucing lucu`";

      // Kirim pesan bantuan
      await message.reply(helpMessage);
    } catch (error) {
      console.error("Error in help command:", error);
      await message.reply(
        "- Maaf, terjadi kesalahan saat menampilkan bantuan. Coba lagi nanti!"
      );
    }
  }
}

module.exports = { handleHelpCommand };
