import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from 'dotenv';

// Config
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    // Upload the file on cloudinary
    const res = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // file has been uploaded successfully
    // console.log("File is uploaded on cloudinary ", res.url);
    fs.unlinkSync(localFilePath);
    return res;
  } catch (error) {
    console.log("File upload failed on cloudinary", error);
    fs.unlinkSync(localFilePath); // Remove the locally saved temporary file as the upload operation got failed
  }
};

export { uploadOnCloudinary };
