import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a base64/file buffer to Cloudinary
 * @param {string} file - data URI or URL
 * @param {string} folder
 */
export async function uploadImage(
  file: string,
  folder = "brooks-fabrics",
): Promise<string> {
  const result = await cloudinary.uploader.upload(file, {
    folder,
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  });
  return result.secure_url;
}

/**
 * Delete an image by public_id
 */
export async function deleteImage(publicId: string): Promise<unknown> {
  return cloudinary.uploader.destroy(publicId);
}

export default cloudinary;
