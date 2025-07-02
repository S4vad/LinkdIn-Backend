import User from "../models/user.model.js";
import Connection from "../models/connection.model.js";
import { io } from "../server.js";

import { userSocketMap } from "../server.js";
import Notification from "../models/notification.model.js";

export const sendConnection = async (req, res) => {
  try {
    let sender = req.userId;
    let { id } = req.params;

    if (sender === id) {
      return res
        .status(400)
        .json({ message: "you can't  send request yourself" });
    }

    let user = await User.findById(sender);
    if (user && user.connections.includes(id)) {
      return res.status(400).json({ message: "user already connected" });
    }
    let existingConnection = await Connection.findOne({
      sender,
      receiver: id,
      status: "pending",
    });

    if (existingConnection) {
      return res.status(400).json({ message: "request already exist" });
    }

    let newRequest = await Connection.create({
      sender,
      receiver: id,
    });

    let receiverSocketId = userSocketMap.get(id);
    let senderSocketId = userSocketMap.get(sender);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("statusUpdate", {
        updatedUserId: sender,
        newStatus: "received",
      });
    }
    if (senderSocketId) {
      io.to(senderSocketId).emit("statusUpdate", {
        updatedUserId: id,
        newStatus: "pending",
      });
    }

    return res.status(200).json({ data: newRequest, success: true });
  } catch (error) {
    console.log("error sending request", error);
    return res.status(500).json({ message: "internal error" });
  }
};

export const acceptConnection = async (req, res) => {
  try {
    let senderId = req.userId;
    let { connectionId } = req.params;

    let connection = await Connection.findById(connectionId);

    if (!connection) {
      return res.status(400).json({ message: "connection doesn't exist" });
    }

    if (connection.status != "pending") {
      return res.status(400).json({ message: "request under process" });
    }

    connection.status = "accepted";
    let notification = await Notification.create({
      receiver: connection.sender,
      type: "connectionAccepted",
      relatedUser: senderId,
    });
    await connection.save();

    await User.findByIdAndUpdate(senderId, {
      $addToSet: { connections: connection.sender._id },
    });
    await User.findByIdAndUpdate(connection.sender._id, {
      $addToSet: { connections: senderId },
    });

    const receiverSocketId = userSocketMap.get(connection.receiver.toString());
    const senderSocketId = userSocketMap.get(connection.sender.toString());

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("statusUpdate", {
        updatedUserId: connection.sender.toString(),
        newStatus: "disconnect", // status seen from receiver's perspective
      });
    }
    if (senderSocketId) {
      io.to(senderSocketId).emit("statusUpdate", {
        updatedUserId: connection.receiver.toString(),
        newStatus: "disconnect", // status seen from sender's perspective
      });
    }

    return res.status(200).json({ message: "connection accepted " });
  } catch (error) {
    console.log("error accepting request", error);
    return res.status(500).json({ message: "internal error" });
  }
};

export const rejectConnection = async (req, res) => {
  try {
    let senderId = req.userId;
    let { connectionId } = req.params;

    let connection = await Connection.findById(connectionId);

    if (!connection) {
      return res.status(400).json({ message: "connection doesn't exist" });
    }

    if (connection.status != "pending") {
      return res.status(400).json({ message: "request under process" });
    }

    connection.status = "rejected";
    await connection.save();

    const senderSocketId = userSocketMap.get(connection.sender.toString());
    const receiverSocketId = userSocketMap.get(connection.receiver.toString());

    if (senderSocketId) {
      io.to(senderSocketId).emit("statusUpdate", {
        updatedUserId: connection.receiver.toString(),
        newStatus: "connect",
      });
    }

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("statusUpdate", {
        updatedUserId: connection.sender.toString(),
        newStatus: "connect",
      });
    }

    return res.status(200).json({ message: "connection rejected " });
  } catch (error) {
    console.log("error rejected request", error);
    return res.status(500).json({ message: "internal error" });
  }
};

export const getConnectionStatus = async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const currentUserId = req.userId;

    let currentUser = await User.findById(currentUserId);
    if (currentUser.connections.includes(targetUserId)) {
      return res.json({ status: "disconnect" });
    }

    const pendingRequest = await Connection.findOne({
      $or: [
        {
          sender: currentUserId,
          receiver: targetUserId,
        },
        { sender: targetUserId, receiver: currentUserId },
      ],
      status: "pending",
    });

    if (pendingRequest) {
      if (pendingRequest.sender.toString() === currentUserId.toString()) {
        return res.json({ status: "pending" });
      } else {
        return res.json({ status: "received", requestId: pendingRequest._id });
      }
    }

    return res.json({ status: "connect" });
  } catch (error) {
    return res.status(500).json({ message: "get connection error" });
  }
};

export const removeConnection = async (req, res) => {
  try {
    const myId = req.userId;
    const otherUserId = req.params.userId;

    await User.findByIdAndUpdate(myId, {
      $pull: {
        connections: otherUserId,
      },
    });
    await User.findByIdAndUpdate(otherUserId, {
      $pull: {
        connections: myId,
      },
    });

    let receiverSocketId = userSocketMap.get(otherUserId);
    let senderSocketId = userSocketMap.get(myId);

    //socket code
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("statusUpdate", {
        updatedUserId: myId,
        newStatus: "connect",
      });
    }
    if (senderSocketId) {
      io.to(senderSocketId).emit("statusUpdate", {
        updatedUserId: otherUserId,
        newStatus: "connect",
      });
    }

    return res.status(200).json({ message: "connection removed successfully" });
  } catch (error) {
    return res.status(500).json({ message: "removed connection error" });
  }
};

export const getConnectionRequests = async (req, res) => {
  try {
    const userId = req.userId;

    const requests = await Connection.find({
      receiver: userId,
      status: "pending",
    }).populate(
      "sender",
      "firstName lastName profileImage headline email userName"
    );

    return res.status(200).json({ data: requests });
  } catch (error) {
    return res.status(500).json({ message: "get connection requests error" });
  }
};

export const getUserConnections = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId).populate(
      "connections",
      "firstName lastName profileImage headline email userName"
    );
    return res.status(200).json({ data: user.connections });
  } catch (error) {
    return res.status(500).json({ message: "get user  connection  error" });
  }
};
