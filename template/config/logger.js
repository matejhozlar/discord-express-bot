import winston from "winston";
import path from "path";
import fs from "fs";

const formatError = (error) => error?.stack || error?.message || String(error);

const logDir = "logs";

class DailyFolderLogger {
  constructor() {
    this.currentDate = this.getDateString();
    this.logger = this.createLoggerForDate(this.currentDate);
    this.monitorDateChange();
  }

  getDateString() {
    const now = new Date();
    return now.toLocaleDateString("sv-SE");
  }

  getLogPathForDate(date, filename) {
    const datedDir = path.join(logDir, date);
    if (!fs.existsSync(datedDir)) {
      fs.mkdirSync(datedDir, { recursive: true });
    }
    return path.join(datedDir, filename);
  }

  createLoggerForDate(date) {
    return winston.createLogger({
      level: "info",
      format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.printf(({ timestamp, level, message }) => {
          return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
        })
      ),
      transports: [
        new winston.transports.File({
          filename: this.getLogPathForDate(date, "server.log"),
          level: "info",
        }),
        new winston.transports.File({
          filename: this.getLogPathForDate(date, "errors.log"),
          level: "error",
        }),
        new winston.transports.Console(),
      ],
      exceptionHandlers: [
        new winston.transports.File({
          filename: this.getLogPathForDate(date, "exceptions.log"),
        }),
      ],
    });
  }

  cleanOldLogFolders(daysToKeep = 7) {
    const cutoff = Date.now() - daysToKeep * 24 * 60 * 60 * 1000;

    fs.readdir(logDir, (error, folders) => {
      if (error) return console.error("Failed to read logDir:", error);

      folders.forEach((folder) => {
        const folderPath = path.join(logDir, folder);

        if (!/^\d{4}-\d{2}-\d{2}$/.test(folder)) return;

        const folderTime = new Date(folder).getTime();
        if (!isNaN(folderTime) && folderTime < cutoff) {
          fs.rm(folderPath, { recursive: true }, (rmErr) => {
            if (rmErr) {
              console.log(`Failed to delete old log folder ${folder}:`, rmErr);
            } else {
              console.log(`Deleted old log folder: ${folder}`);
            }
          });
        }
      });
    });
  }

  monitorDateChange() {
    setInterval(() => {
      const newDate = this.getDateString();
      if (newDate !== this.currentDate) {
        this.logger.close();
        this.currentDate = newDate;
        this.logger = this.createLoggerForDate(this.currentDate);
        this.cleanOldLogFolders(7);
      }
    }, 60 * 1000);
  }

  log(level, message) {
    this.logger.log({ level, message });
  }

  info(message) {
    this.logger.info(message);
  }

  warn(message) {
    this.logger.warn(message);
  }

  error(err) {
    const formattedError = formatError(err);
    this.logger.error(formattedError);
  }
}

const logger = new DailyFolderLogger();
export default logger;
