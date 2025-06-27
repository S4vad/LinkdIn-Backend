import uploadONCloudinary from "../config/cloudinary.js";
import Post from "../models/post.model.js"

export const createPost = async (req, res) => {
  try {
    let {description} = req.body;
    let newPost;
    if (req.file) {
      let image = await uploadONCloudinary(req.file.path);
      newPost = await Post.create({
        author:req.userId,
        description,
        image,
      });
    } else {
      newPost = await Post.create({
        author:req.userId,
        description,
      });
    }
    return res.status(200).json({success:true,data:newPost})
  } catch (error) {
    console.log("errro creating post",error.message)
    return res.status(500).json({message:"create post error"})
  }
};
