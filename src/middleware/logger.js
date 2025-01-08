import winston from 'winston';

// Konfigurasi Winston Logger
const logger = winston.createLogger({
  level: 'info', // Level log: error, warn, info, http, verbose, debug, silly
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json() // Format log dalam bentuk JSON
  ),
  transports: [
    new winston.transports.Console(), // Log ke console
    new winston.transports.File({ filename: 'logs/combined.log' }), // Log ke file
    new winston.transports.File({ filename: 'logs/errors.log', level: 'error' }) // Log khusus error
  ]
});

export default logger;
