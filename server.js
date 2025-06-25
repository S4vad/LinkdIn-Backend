import express from "express";
import { connectdb } from "./config/db.js";
import dotenv from "dotenv";
import authRouter from "./routes/auth.routes.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js";
dotenv.config();

const app = express();
app.use(cookieParser())
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/user",userRouter)

const port = process.env.PORT || 3000;
app.listen(port, () => {
  connectdb();
  console.log("server running on port 3000");
});
