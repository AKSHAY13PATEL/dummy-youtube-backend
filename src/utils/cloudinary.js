import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const uploadToCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      use_filename: true,
      resource_type: "auto",
    });
    console.log("File uploaded successfully:", response.url);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    console.log("File could not be uploaded:", error);
    fs.unlinkSync(localFilePath);
    return null;
  }
};

export { uploadToCloudinary };
