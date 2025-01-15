import logger from "./logger.js";

const logMiddleware = (req, res, next) => {
  if (req.path === "/favicon.ico") {
    res.status(204).send();
    return;
  }

  const startTime = Date.now();

  const originalSend = res.send;
  res.send = function (body) {
    res.body = body;
    return originalSend.call(this, body);
  };

  res.on("finish", () => {
    const responseTime = Date.now() - startTime;
    const logMessage = {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      responseTime: `${responseTime}ms`,
    };

    let responseBody;
    try {
      if (typeof res.body === "string" && res.body.trim()) {
        if (
          res.body.trim().startsWith("{") ||
          res.body.trim().startsWith("[")
        ) {
          responseBody = JSON.parse(res.body);
        } else {
          responseBody = res.body;
        }
      } else {
        responseBody = res.body;
      }
    } catch (error) {
      responseBody = res.body;
      console.error("Error parsing response body:", error);
    }

    if (res.statusCode >= 500) {
      logger.error({
        ...logMessage,
        message: responseBody?.error?.message || responseBody?.message,
      });
    } else if (res.statusCode >= 400 || responseBody?.status === "failed") {
      logger.warn({
        ...logMessage,
        message: responseBody?.message || "Warning",
      });
    } else if (res.statusCode >= 200 || responseBody?.status === "success") {
      logger.info({
        ...logMessage,
        message: responseBody?.message || "Success",
      });
    }
  });

  next();
};

export default logMiddleware;
