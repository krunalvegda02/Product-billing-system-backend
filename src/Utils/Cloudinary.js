import { v2 as cloudinary } from "cloudinary";
import fs from "fs"; //Node File System

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        const Cloudinary_folder = "PRODUCT-BILLING-SYSTEM";

        //upload file on cloudinary
        const uploadResult = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "image",
            folder: Cloudinary_folder
        });

        console.log("File is Uploaded on Cloudinary:", uploadResult.url);
        // console.log("UPLOAD CLOUDINARY RESULT", uploadResult);

        fs.unlinkSync(localFilePath);

        return uploadResult;

    } catch (error) {
        //removes the local saved temporary as the upload operation got failed
        fs.unlinkSync(localFilePath);
        return null;
    }
};

const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(`PRODUCT-BILLING-SYSTEM/${publicId}`);
        console.log("Deleted from Cloudinary:", result);
        return result;
    } catch (error) {
        console.error("Error deleting from Cloudinary:", error);
        return null;
    }
};

//For deleting old file ---> this is long method..we have to call destroy method for deletingfile
const extractPublicIdFromUrl = (url) => {
    const parts = url.split("/");
    const publicIdWithExtension = parts[parts.length - 1];
    const publicId = publicIdWithExtension.split(".")[0];
    console.log("publicId", publicId);

    return publicId;
};

export { uploadOnCloudinary, extractPublicIdFromUrl, deleteFromCloudinary };
