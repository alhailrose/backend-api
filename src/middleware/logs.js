import logger from './logger.js';

const logMiddleware = (req, res, next) => {
  const startTime = Date.now(); // Waktu mulai request

  res.on('finish', () => {
    const responseTime = Date.now() - startTime; // Hitung response time
    logger.info({
      message: 'Request handled',
      method: req.method,
      path: req.path,
      status: res.statusCode,
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString()
    });
  });

  res.on('error', (error) => {
    logger.error({
      message: 'Error during request',
      error: error.message,
      method: req.method,
      path: req.path,
      timestamp: new Date().toISOString()
    });
  });

  next();
};

export default logMiddleware;
