import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
  sendConnection,
  acceptConnection,
  rejectConnection,
  getConnectionStatus,
  removeConnection,
  getConnectionRequests,
  getUserConnections,
} from "../controllers/connection.controller.js";

let connectionRouter = express.Router();

connectionRouter.post("/:id", isAuth, sendConnection);
connectionRouter.patch("/:connectionId/accept", isAuth, acceptConnection);
connectionRouter.patch("/:connectionId/reject", isAuth, rejectConnection);
connectionRouter.get("/status/:userId", isAuth, getConnectionStatus);
connectionRouter.delete("/:userId", isAuth, removeConnection);
connectionRouter.get("/requests", isAuth, getConnectionRequests);
connectionRouter.get("/connectios",isAuth,getUserConnections)

export default connectionRouter;
