import express, { urlencoded } from "express";
import dotenv from "dotenv";
import { db_connection } from "./database/connectMongo.js";
import authRoutes from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/auth", authRoutes);

app.listen(5000, () => {
    db_connection();
});
