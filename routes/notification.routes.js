import express from "express";
import { clearAllNotification, deleteNotification, getNotification } from "../controllers/notification.controller.js";
import isAuth from "../middlewares/isAuth.js";

const notificationRouter = express.Router();

notificationRouter.get("/",isAuth,getNotification)
notificationRouter.delete("/delete/:id",isAuth,deleteNotification)
notificationRouter.delete("/clear",isAuth,clearAllNotification)


export default notificationRouter;
