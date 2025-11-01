const { PermissionFlagsBits } = require("discord.js");

// Fungsi untuk menangani perintah neko clear
async function handleClearCommand(message, config) {
  const content = message.content.toLowerCase();
  const args = message.content.trim().split(/\s+/);
  
  // Cek apakah pesan adalah neko clear atau neko delete
  if (args[0].toLowerCase() === 'neko' && (args[1] === "clear" || args[1] === "delete")) {
    // Periksa apakah pengguna memiliki izin untuk menghapus pesan
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      await message.reply(
        "- Kamu harus punya izin **Manage Messages** untuk menghapus pesan! Tidak sembarangan orang bisa menghapus pesan!"
      );
      return;
    }

    // Ambil jumlah pesan yang ingin dihapus (default 10 jika tidak ditentukan)
    let amount = parseInt(args[2]);
    
    // Validasi jumlah pesan
    if (isNaN(amount)) {
      amount = 10; // Default jumlah pesan
    } else if (amount < 1) {
      await message.reply("- Jumlah pesan yang ingin dihapus harus minimal 1!");
      return;
    } else if (amount > 100) {
      await message.reply("- Kamu hanya bisa menghapus maksimal 100 pesan sekaligus!");
      return;
    }

    try {
      // Hapus pesan (tambahkan 1 untuk menyertakan perintah clear itu sendiri, tapi pastikan tidak melebihi batas 100)
      const fetchLimit = Math.min(amount + 1, 100);
      const messagesToDelete = await message.channel.messages.fetch({ limit: fetchLimit });
      
      await message.channel.bulkDelete(messagesToDelete, true);
      
      // Kirim pesan konfirmasi yang akan dihapus setelah 3 detik
      const confirmMessage = await message.channel.send(
        `- Berhasil menghapus ${amount} pesan!`
      );
      
      // Hapus pesan konfirmasi setelah 3 detik
      setTimeout(() => {
        confirmMessage.delete().catch(() => {});
      }, 3000);
      
    } catch (error) {
      console.error("Error clearing messages:", error);
      await message.reply(
        "- Gagal menghapus pesan! Mungkin pesan lebih dari 14 hari atau ada masalah teknis."
      );
    }
  }
}

module.exports = { handleClearCommand };