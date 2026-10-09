import mongoose from "mongoose";
import dns from "node:dns";

dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4", "1.0.0.1"]);

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error("MONGODB_URI is not defined in the environment variables.");
    }

    const conn = await mongoose.connect(mongoUri);
    console.log("Database connected successfully..")
  
  } catch (error) {
    console.error("[MongoDB] Connection Error:", error);
    process.exit(1);
  }
};
