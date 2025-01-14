import express from "express";
import dotenv from "dotenv";
import createError from "http-errors";
import logs from "../middleware/logs.js";
import authenticationRoute from "../routes/authenticationRoute.js";
import usersRoute from "../routes/usersRoute.js";
import promMiddleware from "express-prometheus-middleware";
import logger from "../middleware/logger.js";

export function createApp() {
  dotenv.config(); // Load environment variables

  const app = express();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(logs);

  app.use(
    promMiddleware({
      metricsPath: "/metrics", // Path untuk memantau metrik Prometheus
      collectDefaultMetrics: true, // Mengumpulkan metrik bawaan
      requestDurationBuckets: [0.1, 0.5, 1, 1.5], // Bucket untuk durasi request
    })
  );

  // Root Route
  app.get("/", (req, res) => {
    res.send("Hello this is Agronect Web Services ASIK");
  });

  // Authentication Routes
  app.use(authenticationRoute);
  app.use(usersRoute);

  // Simulated Error Route
  app.get("/error", () => {
    throw Error(400, "Simulated error");
  });

  // Error Handling for Undefined Routes
  app.use((req, res, next) => {
    next(createError(404, "Not Found"));
  });

  // Error Handling Middleware
  app.use((err, req, res) => {
    const { status = 500, message } = err;
    logger.error({
      message: "Unhandled Error",
      error: message,
      method: req.method,
      path: req.path,
      timestamp: new Date().toISOString(),
    });
    res.status(status).json({ error: { status, message } });
  });

  return app; // Return the app instance
}
