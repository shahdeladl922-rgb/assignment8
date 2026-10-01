import mongoose from "mongoose";



export default async function connectionDB() {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/saraha", { serverSelectionTimeoutMS: 5000 });
        console.log("connect DB successfully.......😍");

    } catch (error) {
        console.log("DB CONNECTED failed.......😒");

    }
}