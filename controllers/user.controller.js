import { response } from "express";
import uploadONCloudinary from "../config/cloudinary.js";
import User from "../models/user.model.js";

export const getCurrentUser = async (req, res) => {
  try {
    let id = req.userId;
    console.log(id);
    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(400).json({ message: "user does not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "get current user error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, location, headline, userName, gender } =
      req.body;
    let skills = req.body.skills ? JSON.parse(req.body.skills) : [];
    let education = req.body.education ? JSON.parse(req.body.education) : [];
    let experience = req.body.experience ? JSON.parse(req.body.experience) : [];

    let profileImage;
    let coverImage;
    if (req.files && req.files.profileImage) {
      profileImage = await uploadONCloudinary(req.files.profileImage[0].path);
    }
    if (req.files && req.files.coverImage) {
      coverImage = await uploadONCloudinary(req.files.coverImage[0].path);
    }

    let user = await User.findByIdAndUpdate(
      req.userId,
      {
        firstName,
        lastName,
        location,
        headline,
        userName,
        gender,
        skills,
        education,
        experience,
        profileImage,
        coverImage,
      },
      { new: true }
    ).select("-password");

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "internal server error update profile" });
  }
};

export const getProfile = async (req, res) => {
  try {
    let { userName } = req.params;
    let user = await User.findOne({ userName })
      .select("-password")
      .populate("connections", "_id");

    if (!user) {
      return res.status(400).json({ message: "user name does not exist" });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "internal server error update profile" });
  }
};

export const search = async (req, res) => {
  try {
    let { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: "search query is required!" });
    }

    {
      /*i for insensitive small or capital match and im for array inside look*/
    }
    let users = await User.find({
      $or: [
        { firstName: { $regex: query, $options: "i" } },
        { lastName: { $regex: query, $options: "i" } },
        { userName: { $regex: query, $options: "i" } },
        { skills: { $in: [query] } },
      ],
    });

    return res.status(200).json({ data: users, success: true });
  } catch (error) {
    return res.status(500).json({ message: "internal server error!" });
  }
};

export const getSuggestedUser = async (req, res) => {
  try {
    let currentUser = await User.findById(req.userId).select("connections");

    let suggestedUser = await User.find({
      _id: {
        $ne: currentUser,
        $nin: currentUser.connections,
      },
    }).select("-password");

    
    return res.status(200).json(suggestedUser);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "suggested user internal server error!" });
  }
};
