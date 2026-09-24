const mongoose = require("mongoose");
const dotenv = require("dotenv");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI,)
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1); // Exit the process with failure
    }
};

module.exports = connectDB;