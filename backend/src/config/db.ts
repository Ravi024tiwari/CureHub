import mongoose from "mongoose";
import dns from "node:dns";


const configureDNS = () => {
  if (process.env.CUSTOM_DNS_SERVERS) {
    const servers = process.env.CUSTOM_DNS_SERVERS.split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (servers.length > 0) {
      dns.setServers(servers);
      console.log(`[DNS] Using custom DNS servers: ${servers.join(", ")}`);
    }
  } else if (process.env.NODE_ENV === "development") {
    dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4", "1.0.0.1"]);
  }
};

configureDNS();

export const connectDB = async (): Promise<void> => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error("[MongoDB] MONGODB_URI is not defined in environment variables.");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log("Database connected successfully..");
  } catch (error: any) {
    // If standard system DNS failed on MongoDB Atlas SRV lookup and custom DNS was not yet set,
    // gracefully attempt a fallback to public Google/Cloudflare DNS
    const isDnsError =
      error?.code === "ENOTFOUND" ||
      error?.code === "ESERVFAIL" ||
      error?.message?.includes("querySrv") ||
      error?.message?.includes("ENOTFOUND");

    if (isDnsError && !process.env.CUSTOM_DNS_SERVERS && process.env.NODE_ENV !== "development") {
      console.warn(
        "[MongoDB] Default DNS could not resolve MongoDB Atlas SRV record. Retrying with fallback DNS (8.8.8.8, 1.1.1.1)..."
      );
      try {
        dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4", "1.0.0.1"]);
        await mongoose.connect(mongoUri);
        console.log("Database connected successfully using fallback DNS..");
        return;
      } catch (retryError) {
        console.error("[MongoDB] Connection Error after fallback DNS retry:", retryError);
        process.exit(1);
      }
    }

    console.error("[MongoDB] Connection Error:", error);
    process.exit(1);
  }
};
