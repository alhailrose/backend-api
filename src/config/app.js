import express from "express";
import dotenv from "dotenv";
import createError from "http-errors";
import logs from "../middleware/logs.js";
import authenticationRoute from "../routes/authenticationRoute.js";
import promMiddleware from "express-prometheus-middleware";

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

  // Error Handling for Undefined Routes
  app.use((req, res, next) => {
    next(createError.NotFound("Tidak Ditemukan"));
  });

  // Error Handling Middleware
  app.use((err, req, res) => {
    const { status = 500, message } = err;
    res.status(status).json({ error: { status, message } });
  });
  app.get("/error", () => {
    throw new Error("Simulated error"); // Contoh endpoint error
  });

  return app; // Return the app instance
}
