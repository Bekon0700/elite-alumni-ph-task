import { v2 as cloudinary } from "cloudinary";
import crypto from "crypto";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

export function generateSignedUploadParams(taskId: string) {
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!apiSecret) {
    throw new Error("CLOUDINARY_API_SECRET is not configured");
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder = `tasks/${taskId}`;
  const publicId = crypto.randomUUID();

  // Only sign params that are sent in the upload FormData.
  const paramsToSign = {
    timestamp,
    folder,
    public_id: publicId,
  };

  const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

  return {
    signature,
    timestamp,
    folder,
    public_id: publicId,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    apiKey: process.env.CLOUDINARY_API_KEY!,
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

export async function deleteUploadedAsset(publicId: string, mimeType?: string) {
  const resourceType = mimeType?.startsWith("image/") ? "image" : "raw";

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result.result === "ok" || result.result === "not found";
  } catch {
    return false;
  }
}
