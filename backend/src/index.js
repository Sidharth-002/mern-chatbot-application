const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const cookieParser = require("cookie-parser");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const allowedOrigins = [
  FRONTEND_URL,
  "http://localhost:3000",
  "https://*.vercel.app",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.some((allowed) => {
          if (allowed.includes("*")) {
            return origin.endsWith(allowed.replace("*", ""));
          }
          return origin === allowed;
        })
      ) {
        callback(null, true);
        return;
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connection Successfull");
  })
  .catch((err) => {
    console.log(err.message);
  });

app.get("/ping", (_req, res) => {
  return res.json({ msg: "Ping Successful" });
});

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

app.use((req, res) => {
  return res.status(404).json({
    status: false,
    msg: "Route not found",
    code: 404,
  });
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || "Internal server error";

  return res.status(statusCode).json({
    status: false,
    msg: message,
    code: statusCode,
  });
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.some((allowed) => {
          if (allowed.includes("*")) {
            return origin.endsWith(allowed.replace("*", ""));
          }
          return origin === allowed;
        })
      ) {
        callback(null, true);
        return;
      }
      callback(new Error("Not allowed by Socket.IO CORS"));
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("a user connected:", socket.id);

  socket.on("join", (userId) => {
    if (!userId) return;
    socket.data.userId = userId;
    socket.join(userId);
    console.log(`user ${userId} joined room with socket ${socket.id}`);
  });

  socket.on("leave", (userId) => {
    if (!userId) return;
    socket.leave(userId);
    console.log(`user ${userId} left room for socket ${socket.id}`);
  });

  socket.on("send-message", (data) => {
    try {
      const { to } = data || {};
      if (!to) return;
      // emit to the room for the recipient
      io.to(to).emit("receive-message", data);
    } catch (err) {
      console.error("Error handling send-message", err);
    }
  });

  socket.on("disconnect", () => {
    const userId = socket.data?.userId;
    console.log(
      "user disconnected:",
      socket.id,
      userId ? `user:${userId}` : "",
    );
  });
});

server.listen(PORT, () => console.log(`Server started on ${PORT}`));
