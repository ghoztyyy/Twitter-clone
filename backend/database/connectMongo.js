import mongoose from "mongoose";

export const db_connection = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGODB_URI);
        console.log("connection succesfull");
    } catch {
        console.log("error");
    }
};
