import cookieParser from "cookie-parser";
import cors from "cors";
import dns from "dns";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

import mongoose from "mongoose";
import router from "./app/router/api";

const app = express();

// security middleware
app.use(cors());
app.use(helmet());
app.use(cookieParser());

app.use(express.urlencoded({ extended: process.env.NEXT_API_URL_ENCODE }));
app.set("etag", process.env.NEXT_API_WEB_CACHE);

const limit = rateLimit({
  windowMs: process.env.NEXT_API_MAX_WINDOWMS,
  max: process.env.NEXT_API_MAX_RATE_LIMIT,
});
app.use(limit);

dns.setServers = ["1.1.1.1", "8.8.8.8"];

mongoose
  .connect(process.env.NEXT_API_DATABASE_URL, { autoIndex: true })
  .then(() => {
    console.log("DB connected to the server...");
  })
  .catch((err) => {
    console.log(err.message);
  });

app.use("/", router);

app.listen(process.env.PORT || 5000, () => {
  console.log("server is running...");
});
