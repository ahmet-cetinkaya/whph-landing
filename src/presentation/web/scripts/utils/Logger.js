// Logger utility class for consistent console output formatting
export default class Logger {
  static colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    warning: '\x1b[33m',
    error: '\x1b[31m',
    reset: '\x1b[0m',
  };

  static logInfo(message) {
    console.log(`${this.colors.info}[INFO]${this.colors.reset} ${message}`);
  }

  static logSuccess(message) {
    console.log(`${this.colors.success}[SUCCESS]${this.colors.reset} ${message}`);
  }

  static logWarning(message) {
    console.log(`${this.colors.warning}[WARNING]${this.colors.reset} ${message}`);
  }

  static logError(message) {
    console.error(`${this.colors.error}[ERROR]${this.colors.reset} ${message}`);
  }
}
