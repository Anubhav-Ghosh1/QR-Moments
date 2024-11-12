import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import userRoute from "./src/routes/user.route.js";
import rateLimit from 'express-rate-limit';
import cron from "node-cron";

import cookieParser from "cookie-parser";

// Rate limiting middleware (100 requests per 15 minutes per IP)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    message: {
        status: 429,
        error: 'Too many requests, please try again later.'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const app = express();
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));
app.use(limiter);

app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended: true, limit: "16kb"}));
app.use(express.static("public"));
app.use(cookieParser());
app.use("/api/v1/users",userRoute);

import { sendPhoto } from "./src/controllers/photo.controller.js";
// Schedule the job to run daily at midnight
cron.schedule("0 0 * * *", async () => {
    try {
        console.log("Running sendPhotosAfterExpiry job at midnight...");
        await sendPhoto();
    } catch (error) {
        console.error("Error running sendPhotosAfterExpiry job:", error);
    }
});

export { app };