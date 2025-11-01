const { PermissionFlagsBits } = require("discord.js");

// Fungsi untuk menangani perintah berbasis kata kunci
async function handleKeywordCommands(message, config) {
  const content = message.content.toLowerCase();

  // Cek apakah pesan mengandung kata kunci neko add role
  if (content.includes("neko add role")) {
    // Periksa apakah pengguna memiliki izin untuk memberikan role (admin atau permission tertentu)
    if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
      await message.reply(
        "- Mau ngasih role? Bukan sembarang orang bisa lho! Kamu harus punya izin **Manage Roles** dulu! Ugh, dasar baka!"
      );
      return;
    }

    try {
      // Ekstrak role dari mention
      const roleMention = message.mentions.roles.first();

      if (!roleMention) {
        await message.reply(
          "- Mana role yang mau ditambahin? Mention dulu role-nya! Contoh: `neko add role @namarole @member` 😒\nAtau: `neko add role @namarole 123456789012345678`"
        );
        return;
      }

      // Ekstrak member menggunakan mention atau ID user
      let targetMember = message.mentions.members.first();

      // Jika tidak ada mention, coba cari dengan ID user
      if (!targetMember) {
        // Ekstrak ID user dari pesan (angka setelah role dan sebelum spasi atau akhir pesan)
        const userIdMatch = message.content.match(
          /<@!?(\d{17,19})>|\b(\d{17,19})\b/
        );
        if (userIdMatch) {
          const userId = userIdMatch[1] || userIdMatch[2]; // Ambil dari group 1 atau 2
          targetMember = await message.guild.members
            .fetch(userId)
            .catch(() => null);
        }
      }

      if (!targetMember) {
        await message.reply(
          "- Member mana yang mau dikasih role? Mention atau masukkan ID-nya! Contoh: `neko add role @namarole @member` 🙄\nAtau: `neko add role @namarole 123456789012345678`"
        );
        return;
      }

      // Tambahkan role ke member
      await targetMember.roles.add(roleMention);

      await message.reply(
        `- Role **${roleMention.name}** berhasil ditambahkan ke **${targetMember.displayName}**! Tapi jangan seneng dulu, aku cuma bantu karena disuruh! 😤`
      );
    } catch (error) {
      console.error("Error adding role:", error);
      await message.reply(
        "- Gagal nambahin role! Mungkin role-nya di atas bot, user tidak ditemukan, atau ada masalah teknis. Aku juga nggak tahu deh! 😡"
      );
    }
  } else {
    // Balasan untuk perintah yang tidak dimengerti
    await message.reply(
      "Hmm? Perintah yang kamu masukkan nggak aku mengerti! Aku cuma bisa: `neko add role @namarole @member` atau `neko add role @namarole UID` 😒"
    );
  }
}

module.exports = { handleKeywordCommands };
