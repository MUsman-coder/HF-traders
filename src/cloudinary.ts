const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined;

export function isCloudinaryConfigured(): boolean {
  return Boolean(CLOUD_NAME && UPLOAD_PRESET);
}

/**
 * Uploads an image file directly from the browser to Cloudinary using an
 * unsigned upload preset — no API secret is ever exposed in frontend code,
 * and no backend involvement is needed for the upload itself.
 * Returns the resulting HTTPS URL (Cloudinary's `secure_url`).
 */
export async function uploadImageToCloudinary(file: File): Promise<string> {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      'Cloudinary is not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in frontend/.env.'
    );
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET as string);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error?.message || 'Image upload failed.');
  }

  return data.secure_url as string;
}
