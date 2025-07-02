import Notification from "../models/notification.model.js";

export const getNotification = async (req, res) => {
  try {
    const notification = await Notification.find({ receiver: req.userId })
      .populate("relatedUser", "firstName lastName profileImage") // ✅ No space in key
      .populate("relatedPost", "image description");

    return res.status(200).json(notification);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "notication get internal server error" });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    let { id } = req.params;

    await Notification.findOneAndDelete({ _id: id, receiver: req.userId });
    return res
      .status(200)
      .json({ message: "notification deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "notification delete internal server error" });
  }
};

export const clearAllNotification = async (req, res) => {
  try {
    await Notification.deleteMany({ receiver: req.userId });
    return res
      .status(200)
      .json({ message: "notification cleared successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "notification clear ,internal server error" });
  }
};
