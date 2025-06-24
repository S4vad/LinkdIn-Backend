import express from "express";
import { connectdb } from "./config/db.js";
import dotenv from "dotenv";
dotenv.config();

const app=express();

app.get('/',(req,res)=>{
  res.send("hello")
})

const port=process.env.PORT;
app.listen(port,()=>{
  connectdb();
  console.log('server running on port 3000')
})