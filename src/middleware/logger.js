import winston from "winston";

// Konfigurasi Winston Logger
const logger = winston.createLogger({
  level: "info", // Level log: error, warn, info, http, verbose, debug, silly
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.json() // Format log dalam bentuk JSON untuk file
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf((info) => {
          // Format log untuk console agar lebih mudah dibaca
          const additionalInfo =
            info.responseTime && info.status && info.path
              ? ` [${info.method}] ${info.path} (${info.status}) in ${info.responseTime}`
              : "";
          return `${info.timestamp} [${info.level}]: ${info.message}${additionalInfo}`;
        })
      ),
    }), // Log ke console
    new winston.transports.File({ filename: "logs/success.log" }), // Log ke file
    new winston.transports.File({
      filename: "logs/errors.log",
      level: "error",
    }), // Log khusus error
  ],
});

export default logger;
