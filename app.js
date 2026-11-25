import cookieParser from "cookie-parser";
import cors from "cors";
import dns from "dns";
import "dotenv/config";

import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

import mongoose from "mongoose";
import router from "./app/router/api.js";

const app = express();

// Vercel terminates TLS and forwards requests through a proxy hop.
app.set("trust proxy", 1);

// security middleware
app.use(
  cors({
    origin: process.env.NEXT_API_CLIENT_URL,
    credentials: true,
  }),
);
app.use(helmet());
app.use(cookieParser());

app.use(
  express.urlencoded({
    extended: process.env.NEXT_API_URL_ENCODE === "true",
  }),
);
app.set("etag", process.env.NEXT_API_WEB_CACHE || "weak");
app.use(express.json({ limit: process.env.NEXT_API_MAX_JSON_FILE || "100kb" }));

const limit = rateLimit({
  windowMs: Number(process.env.NEXT_API_MAX_WINDOWMS) || 15 * 60 * 1000,
  max: Number(process.env.NEXT_API_MAX_RATE_LIMIT) || 100,
});
app.use(limit);

dns.setServers(["1.1.1.1", "8.8.8.8"]);

let databaseError = null;
const databaseReady = mongoose
  .connect(process.env.NEXT_API_DATABASE_URL, {
    autoIndex: true,
    serverSelectionTimeoutMS: 10000,
  })
  .then(() => {
    console.log("DB connected to the server...");
  })
  .catch((err) => {
    databaseError = err;
    console.error("Database connection failed:", err.message);
  });

// Cold starts on Vercel can invoke the Express app before Mongoose is ready.
// Waiting here prevents model queries from buffering and timing out.
app.use(async (req, res, next) => {
  try {
    await databaseReady;

    if (databaseError) {
      throw databaseError;
    }

    return next();
  } catch (error) {
    return res.status(503).json({
      success: false,
      message: "Database is not available.",
    });
  }
});

app.use("/", router);

databaseReady.then(() => {
  app.listen(process.env.PORT || 5000, () => {
    console.log("server is running...");
  });
});
