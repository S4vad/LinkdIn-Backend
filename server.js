import express from "express";
import { connectdb } from "./config/db.js";
import dotenv from "dotenv";
import authRouter from "./routes/auth.routes.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js";
import postRouter from "./routes/post.routes.js";
import connectionRouter from "./routes/connection.routes.js";
import { createServer } from "http";
import { Server } from "socket.io";
dotenv.config();

const app = express();
const server = createServer(app);
export const io = new Server(server, {
  cors: { origin: "http://localhost:5173", credentials: true },
});
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/post", postRouter);
app.use("/api/connection", connectionRouter);

export const userSocketMap = new Map();
io.on("connection", (socket) => {
  console.log("socket io server connected on", socket.id);
  socket.on("register",(userId)=>{
    userSocketMap.set(userId,socket.id)
    console.log(userSocketMap)
  })
  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  connectdb();
  console.log("server running on port 3000");
});
