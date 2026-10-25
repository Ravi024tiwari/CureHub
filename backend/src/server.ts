import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import authRouter from "./routes/auth.routes.js";
import adminRouter from "./routes/admin.routes.js";
import hospitalRouter from "./routes/hospital.routes.js";
import profileRouter from "./routes/profile.routes.js";
import userRouter from "./routes/user.routes.js";
import appointmentRouter from "./routes/appointment.routes.js";
import patientRouter from "./routes/patient.routes.js";
import reviewRouter from "./routes/review.routes.js";
import doctorRouter from "./routes/doctor.routes.js";
import hospitalAdminRouter from "./routes/hospitalAdmin.routes.js";
import uploadRouter from "./routes/upload.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { globalRateLimiter } from "./middleware/rateLimiter.middleware.js";
import { initCronJobs } from "./services/cron.service.js";

const app = express();
const PORT = process.env.PORT || 5000;

// 1. CORS FIRST: Guarantees every response (including 429 errors & preflight OPTIONS) has proper CORS headers
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
const allowedOrigins = [
  clientUrl,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === "development") {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  })
);

// 2. Helmet with crossOriginResourcePolicy allowing frontend asset access
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// 3. Global rate limiter (after CORS so any 429 response still has Access-Control-Allow-Origin)
app.use(globalRateLimiter);
app.use(morgan("dev"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

//health check 
app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    message: "CureHealth API is active and running",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/hospitals", hospitalRouter);
app.use("/api/profile", profileRouter);
app.use("/api/users", userRouter);
app.use("/api/appointments", appointmentRouter);
app.use("/api/patients", patientRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/doctors", doctorRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/hospital-admin", hospitalAdminRouter);
app.use("/api/upload", uploadRouter);

app.use(errorHandler);

// Start Server and connect to MongoDB
const startServer = async () => {
  try {
    await connectDB();

    // Start background cron workers
    initCronJobs();

    app.listen(PORT, () => {
      console.log(`Server is listening on PORT :${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
