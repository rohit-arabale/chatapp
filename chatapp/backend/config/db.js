const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error("MongoDB connection error: MONGO_URI is not set");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
