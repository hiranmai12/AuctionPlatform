const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("MongoDB Connected ✅");
    } catch (error) {
        console.error("Database connection failed :", error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
