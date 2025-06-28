import uploadONCloudinary from "../config/cloudinary.js";
import Post from "../models/post.model.js";

export const createPost = async (req, res) => {
  try {
    let { description } = req.body;
    let newPost;
    if (req.file) {
      let image = await uploadONCloudinary(req.file.path);
      newPost = await Post.create({
        author: req.userId,
        description,
        image,
      });
    } else {
      newPost = await Post.create({
        author: req.userId,
        description,
      });
    }

    const populatedPost = await Post.findById(newPost._id).populate(
      "author",
      "firstName lastName profileImage headline"
    );

    return res.status(200).json({ success: true, data: populatedPost });
  } catch (error) {
    console.log("errro creating post", error.message);
    return res.status(500).json({ message: "create post error" });
  }
};

export const getPost = async (req, res) => {
  try {
    const data = await Post.find()
      .populate("author", "firstName lastName profileImage headline")
      .populate("comments.user", "firstName lastName profileImage headline")
      .sort({ createdAt: -1 });
    if (data) {
      res.status(200).json({ data: data, success: true });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const like = async (req, res) => {
  try {
    let postId = req.params.postId;
    let userId = req.userId;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(400).json({ message: "The post not found !" });
    }
    if (post.likes.includes(userId)) {
      post.likes = post.likes.filter((id) => id != userId);
    } else {
      post.likes.push(userId);
    }
    await post.save();

    return res.status(200).json({ data: post, success: true });
  } catch (error) {
    console.error("LIKE ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const comment = async (req, res) => {
  try {
    let postId = req.params.postId;
    let userId = req.userId;
    let { content } = req.body;
    let post = await Post.findByIdAndUpdate(
      postId,
      { $push: { comments: { content, user: userId } } },
      { new: true }
    ).populate("comments.user", "firstName lastName profileImage headline");

    if (!post) {
      return res.status(400).json({ message: "The post not found !" });
    }

    return res.status(200).json({ data: post, success: true });
  } catch (error) {
    console.error("comment error:", error);
    return res.status(500).json({ message: error.message });
  }
};
