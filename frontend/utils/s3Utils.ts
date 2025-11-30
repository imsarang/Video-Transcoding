import toast from "react-hot-toast"
import webSocketUtils from "./websocketUtils";

export const uploadToS3 = async (
  file: File,
  preSignedUrl: string,
  channelKey: string,
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
          // S3 requires metadata key to be lowercased, no spaces
          // Values must be string
          metaHeaders[`x-amz-meta-${key.toLowerCase()}`] =
            typeof value === "object" ? JSON.stringify(value) : String(value);
        }
      });
    }
    console.log(metadata);
    
    console.log(metaHeaders);
    // start socket connection
    if(channelKey) {
      webSocketUtils.initializeSocket(channelKey)
    }

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