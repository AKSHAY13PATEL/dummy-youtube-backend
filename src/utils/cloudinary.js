import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const uploadFile = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      use_filename: true,
      resource_type: "auto",
    });
    console.log("File uploaded successfully:", response.url);
    return response;
  } catch (error) {
    console.log("File could not be uploaded:", error);
    return error;
  }
};

export { uploadFile };
