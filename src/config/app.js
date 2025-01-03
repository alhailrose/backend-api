import express from "express";
import dotenv from "dotenv";
import createError from "http-errors";
import logs from "../middleware/logs.js";
import authenticationRoute from "../routes/authenticationRoute.js";

export function createApp() {
  dotenv.config(); // Load environment variables

  const app = express();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(logs);

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

  return app; // Return the app instance
}
