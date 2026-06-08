import { v2 as cloudinary } from "cloudinary";
import crypto from "crypto";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

const MAX_BYTES =
  (parseInt(process.env.UPLOAD_MAX_SIZE_MB || "10", 10)) * 1024 * 1024;

export function generateSignedUploadParams(taskId: string) {
  const timestamp = Math.floor(Date.now() / 1000);
  const publicId = `${taskId}/${crypto.randomUUID()}`;
  const folder = `tasks/${taskId}`;

  const params: Record<string, string | number> = {
    timestamp,
    folder,
    public_id: publicId,
    allowed_formats: "jpg,png,gif,webp,pdf,doc,docx,xls,xlsx,txt",
    max_file_size: MAX_BYTES,
  };

  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  const signature = crypto
    .createHash("sha1")
    .update(sortedParams + process.env.CLOUDINARY_API_SECRET)
    .digest("hex");

  return {
    signature,
    timestamp,
    folder,
    public_id: publicId,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    allowed_formats: "jpg,png,gif,webp,pdf,doc,docx,xls,xlsx,txt",
    max_file_size: MAX_BYTES,
  };
}

export async function verifyUploadedAsset(publicId: string) {
  try {
    const result = await cloudinary.api.resource(publicId);
    return result;
  } catch {
    return null;
  }
}
