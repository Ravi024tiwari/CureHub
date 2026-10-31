import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { verifyToken, JwtPayload } from "../utils/jwt.js";
import { UserRole } from "../constants/index.js";
import { Hospital } from "../models/Hospital.model.js";
import { DoctorProfile } from "../models/DoctorProfile.model.js";

let io: Server | null = null;

export interface AuthenticatedSocket extends Socket {
  data: {
    user?: JwtPayload;
  };
}



export const initSocket = (httpServer: HttpServer): Server => {
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const allowedOrigins = [
    clientUrl,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ];

  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === "development") {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
      methods: ["GET", "POST"],
    },
    pingTimeout: 30000,
    pingInterval: 10000,
  });

  // 1. Handshake Authentication Middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      let token: string | undefined = socket.handshake.auth?.token;

      // Also check Authorization header fallback
      if (!token && socket.handshake.headers?.authorization) {
        const parts = socket.handshake.headers.authorization.split(" ");
        if (parts.length === 2 && parts[0] === "Bearer") {
          token = parts[1];
        }
      }

      // Check cookie fallback
      if (!token && socket.handshake.headers?.cookie) {
        const cookies = socket.handshake.headers.cookie
          .split(";")
          .map((c) => c.trim().split("="));
        const tokenCookie = cookies.find(([k]) => k === "token");
        if (tokenCookie && tokenCookie[1]) {
          token = decodeURIComponent(tokenCookie[1]);
        }
      }

      if (!token) {
        return next(new Error("Authentication required: Token missing"));
      }

      const decoded = verifyToken(token);
      if (!decoded || !decoded.userId) {
        return next(new Error("Authentication failed: Invalid token"));
      }

      socket.data.user = decoded;
      next();
    } catch (err: any) {
      return next(new Error("Authentication failed: " + (err.message || "Invalid token")));
    }
  });

  // 2. Connection Handler & Room Join Subscriptions
  io.on("connection", async (socket: AuthenticatedSocket) => {
    const user = socket.data.user;
    if (!user) {
      socket.disconnect(true);
      return;
    }

    const { userId, role } = user;//get that logged in user

    // Join personal private user room
    socket.join(`user:${userId}`);

    // Role-specific room assignment
    if (role === UserRole.SUPER_ADMIN) {
      socket.join("role:super_admin");
    } else if (role === UserRole.HOSPITAL_ADMIN) {
      socket.join("role:hospital_admin");
      // Find hospitals managed by this hospital admin to join hospital rooms
      try {
        const hospitals = await Hospital.find({ hospitalAdminId: userId }).select("_id").lean();
        hospitals.forEach((h) => {
          socket.join(`hospital:${h._id.toString()}`);
        });
      } catch (err) {
        console.error("Error joining hospital rooms for hospital admin:", err);
      }
    } else if (role === UserRole.DOCTOR) {
      socket.join("role:doctor");
      // Find doctor profile to check if already affiliated with a hospital
      try {
        const docProfile = await DoctorProfile.findOne({ userId }).select("hospitalId").lean();
        if (docProfile && docProfile.hospitalId) {
          socket.join(`hospital:${docProfile.hospitalId.toString()}`);
        }
      } catch (err) {
        console.error("Error joining doctor hospital room:", err);
      }
    }

    socket.on("disconnect", () => {
      // Automatic room cleanup handled by Socket.io
    });
  });

  return io;
};

/**
 * Access the initialized Socket.IO server singleton
 */
export const getIO = (): Server => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized. Call initSocket first.");
  }
  return io;
};

/**
 * Targeted Emitters for Controllers & Services
 */

// Emit to a specific individual user (e.g. Doctor, Patient, Hospital Admin)
export const emitToUser = (userId: string, event: string, payload: any): void => {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, payload);
};

// Emit to a specific hospital room (e.g. all admins & staff of a hospital)
export const emitToHospital = (hospitalId: string, event: string, payload: any): void => {
  if (!io) return;
  io.to(`hospital:${hospitalId}`).emit(event, payload);
};

// Emit to all Super Admins (e.g. new doctor verification request, new hospital admin request)
export const emitToSuperAdmins = (event: string, payload: any): void => {
  if (!io) return;
  io.to("role:super_admin").emit(event, payload);
};

// Emit to a specific role broadcast room
export const emitToRole = (role: string, event: string, payload: any): void => {
  if (!io) return;
  io.to(`role:${role}`).emit(event, payload);
};

