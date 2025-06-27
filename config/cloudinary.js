import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const uploadONCloudinary = async (filePath) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API,
    api_secret: process.env.CLOUDINARY_SECRET_KEY,
  });
  try {
    if (!filePath) {
      return null;
    }

    const uploadResult = await cloudinary.uploader.upload(filePath);
    fs.unlinkSync(filePath);
    return uploadResult.secure_url;
  } catch (error) {
    fs.unlinkSync(filePath) //if error also delete 
    console.log("error uploading cloudinary", error);
  }
};

export default uploadONCloudinary;
