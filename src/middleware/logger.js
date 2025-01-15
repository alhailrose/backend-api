import winston from "winston";

// Custom filter untuk membatasi level log
const filterByLevel = (level) => {
  return winston.format((info) => (info.level === level ? info : false))();
};

// Konfigurasi Winston Logger
const logger = winston.createLogger({
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
    }),
    new winston.transports.File({
      filename: "logs/info.log",
      level: "info",
      format: filterByLevel("info"), // Hanya log level "info"
    }),
    new winston.transports.File({
      filename: "logs/warn.log",
      level: "warn",
      format: filterByLevel("warn"), // Hanya log level "warn"
    }),
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      format: filterByLevel("error"), // Hanya log level "error"
    }),
  ],
});

export default logger;
