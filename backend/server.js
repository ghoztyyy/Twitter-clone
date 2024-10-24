import express, { urlencoded } from "express";
import dotenv from "dotenv";
import { db_connection } from "./database/connectMongo.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import postRoutes from "./routes/post.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});

const app = express();

app.use(express.json({ limit: "5mb" })); // to parse req.body
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);

app.listen(5000, () => {
    db_connection();
});
