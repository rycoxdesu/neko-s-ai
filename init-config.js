const { syncConfigToDatabase, syncConfigFromFile } = require('./utils/configSync');

async function initializeConfig() {
  console.log('Memulai inisialisasi konfigurasi...');
  
  // Sinkronkan dari file ke database jika file ada
  await syncConfigFromFile();
  await syncConfigToDatabase();
  
  console.log('Inisialisasi konfigurasi selesai.');
  process.exit(0);
}

initializeConfig().catch(error => {
  console.error('Error saat inisialisasi konfigurasi:', error);
  process.exit(1);
});