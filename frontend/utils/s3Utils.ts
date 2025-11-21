import toast from "react-hot-toast"

export const uploadToS3 = async (
  file: File,
  preSignedUrl: string,
  metadata?: Record<string, any>
) => {
  try {
    // Convert metadata to S3-compatible headers
    const metaHeaders: Record<string, string> = {};
    if (metadata) {
      Object.entries(metadata).forEach(([key, value]) => {
        if (
          value !== undefined &&
          value !== null &&
          typeof value !== 'function' &&
          key !== "media" && key !== "s3Url"
        ) {
          if (typeof value === "object") {
            // Only accept if it's a primitive stringifiable type and not an array/object
            if (Array.isArray(value) || value === null) {
              console.warn(`Skipping metadata key ${key}: arrays or null are not allowed as S3 metadata value.`);
              return;
            } else {
              // Stringify single level object if all props are strings or numbers
              const flat = Object.entries(value).every(([k, v]) => typeof v === 'string' || typeof v === 'number');
              if (flat) {
                metaHeaders[`x-amz-meta-${key.toLowerCase()}`] = JSON.stringify(value);
              } else {
                console.warn(`Skipping metadata key ${key}: nested objects are not allowed as S3 metadata value.`);
                return;
              }
            }
          } else if(typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
            metaHeaders[`x-amz-meta-${key.toLowerCase()}`] = String(value);
          } else {
            console.warn(`Skipping metadata key ${key}: type not supported for S3 meta.`);
          }
        }
      });
    }

    console.log(preSignedUrl);
    
    const response = await fetch(preSignedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
        ...metaHeaders,
      },
    });

    console.log(response);
    
    if (!response.ok) {
      throw new Error(`S3 upload failed: ${response.status} ${response.statusText}`);
    }
  } catch (err) {
    toast.error('Could not uplaod media')
  }
}