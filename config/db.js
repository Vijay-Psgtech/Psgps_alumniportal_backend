const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error(
      "MONGODB_URI is not configured. Add it to server/.env (see .env.example).",
    );
  }

  try {
    console.log("🔄 Connecting to MongoDB...");
    const conn = await mongoose.connect(mongoUri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error(
      "Make sure MongoDB is running or check your connection string",
    );
    throw error;
  }
};

module.exports = connectDB;
