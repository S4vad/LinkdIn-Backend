import express from "express";
import {
  getCurrentUser,
  updateProfile,
} from "../controllers/user.controller.js";
import isAuth from "../middlewares/isAuth.js";
import upload from "../middlewares/multer.js";

const userRouter = express.Router();

//userRouter.use(isAuth)

userRouter.get("/currentuser", isAuth, getCurrentUser);
userRouter.put(
  "/updateProfile",
  isAuth,
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  updateProfile
);

export default userRouter;
