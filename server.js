import express from "express";
import { connectdb } from "./config/db.js";
import dotenv from "dotenv";
import authRouter from "./routes/auth.routes.js";
dotenv.config();

const app = express();
app.use(express.json());

app.use("/api/auth", authRouter);

const port = process.env.PORT ||3000;
app.listen(port, () => {
  connectdb();
  console.log("server running on port 3000");
});
