class Logger {
  static log(message) {
    console.log(`[INFO] ${message}`);
  }

  static warn(message) {
    console.log(`[WARN] ${message}`);
  }

  static error(message) {
    console.log(`[ERROR] ${message}`);
  }

  static success(message) {
    console.log(`[SUCCESS] ${message}`);
  }

  static debug(message) {
    console.log(`[DEBUG] ${message}`);
  }
}

module.exports = Logger;