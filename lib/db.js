import mongoose from "mongoose";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  if (!process.env.MONGO_URL) {
    throw new Error("Missing MONGO_URL environment variable");
  }

  await mongoose.connect(process.env.MONGO_URL);
  console.log("MongoDB Connected");
};

export default connectDB;