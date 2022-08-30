const pino = require("pino");

const { ENV } = require("../../constants");

let defaultLogger = null;

class Logger {
  static getInstance() {
    if (!defaultLogger) {
      const logLevel = process.env.LOG_LEVEL || "info";
      const currentEnv = process.env.NODE_ENV;
      const transport = pino.transport({
        target: "pino-pretty",
        options: { colorize: true, translateTime: true },
      });

      const settings = {
        level: logLevel,
      };
      defaultLogger = pino(settings, transport);
      defaultLogger.info(`log level: ${logLevel}`);
    }
    return defaultLogger;
  }
}

module.exports = Logger;
