import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import compression from "compression";
import path from "path";
import { fileURLToPath } from "url";
import { CLIENT_URL } from "./config/env.config.js";

import authRouter from "./routes/auth.route.js";
import jobRouter from "./routes/job.route.js";

import responseMiddleware from "./middlewares/response.middleware.js";
import errorMiddleware from "./middlewares/error.middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(morgan("dev"))

// Security
app.disable("x-powered-by");
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Compression
app.use(compression());

// CORS
app.use(
  cors({
    origin: CLIENT_URL, // Allow client connection
    credentials: true,
  })
);


// Body Parsers
app.use(express.json({ limit: "10mb" })); // Support larger base64 images
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Serve Static Uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Custom Response Middleware
app.use(responseMiddleware);

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
  });
});

// Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1", jobRouter);


/**
 * 404 Route Not Found Middleware
 */
app.use("*notfound", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/**
 * Global Error Handler (Always Last)
 */
app.use(errorMiddleware);

export default app;