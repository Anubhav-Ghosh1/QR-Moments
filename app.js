import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import userRoute from "./src/routes/user.route.js";
import restaurantRoute from "./src/routes/restaurant.route.js";
import orderRoute from "./src/routes/order.route.js";
import reviewRoute from "./src/routes/review.route.js";
import couponRoute from "./src/routes/coupon.route.js";
import dashboardRoute from "./src/routes/dashboard.route.js";
import rateLimit from 'express-rate-limit';

import cookieParser from "cookie-parser";

// Rate limiting middleware (100 requests per 15 minutes per IP)
// const limiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
//     message: {
//         status: 429,
//         error: 'Too many requests, please try again later.'
//     },
//     standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
//     legacyHeaders: false, // Disable the `X-RateLimit-*` headers
// });

const app = express();
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));
// app.use(limiter);

app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended: true, limit: "16kb"}));
app.use(express.static("public"));
app.use(cookieParser());
app.use("/api/v1/users",userRoute);
app.use("/api/v1/restaurant",restaurantRoute);
app.use("/api/v1/orders",orderRoute);
app.use("/api/v1/review",reviewRoute);
app.use("/api/v1/coupon",couponRoute);
app.use("/api/v1/dashboard",dashboardRoute);
export { app };