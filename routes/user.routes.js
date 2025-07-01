import express from "express";
import {
  getCurrentUser,
  updateProfile,
  search,
  getProfile,
  getSuggestedUser
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

userRouter.get("/profile/:userName", isAuth, getProfile);
userRouter.get("/search", isAuth, search);
userRouter.get("/suggested-user", isAuth, getSuggestedUser);



export default userRouter;
