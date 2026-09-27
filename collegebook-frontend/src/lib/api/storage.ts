import { ApiError } from './client';
import type { FeedPost, ExplorePost, PostComment, TeamDiscussion, TeamChatMessage, ChatUser, TypingEvent, PresenceEventDto, AdData } from '@/types';
import type { Post, PageResponse } from './client';
import { request, clearAuthSession } from './client';

// Media Storage (AWS S3 / Cloudflare R2 for images/files, Stream for videos)
// ---------------------------------------------------------------------------

export interface PresignedUploadResponse {
  uploadUrl: string;
  objectKey: string;
  publicUrl: string;
  storageProvider?: string;
}

export interface VideoUploadResponse {
  uploadUrl: string;
  videoId: string;
}

/**
 * Request presigned upload URL for Object Storage (AWS S3 / Cloudflare R2).
 */
export const requestPresignedUpload = async (
  fileName: string,
  contentType: string,
  fileSizeBytes: number,
  mediaContext: "POST_IMAGE" | "AVATAR" | "DOCUMENT" = "POST_IMAGE"
): Promise<PresignedUploadResponse> => {
  return await request<PresignedUploadResponse>("/storage/presign-upload", {
    method: "POST",
    body: JSON.stringify({
      fileName,
      contentType,
      fileSizeBytes,
      mediaContext,
    }),
  });
};

/**
 * Request direct creator upload URL for Cloudflare Stream (videos).
 */
export const requestVideoStreamUpload = async (
  fileName: string,
  contentType: string,
  fileSizeBytes: number
): Promise<VideoUploadResponse> => {
  return await request<VideoUploadResponse>("/storage/video-upload", {
    method: "POST",
    body: JSON.stringify({
      fileName,
      contentType,
      fileSizeBytes,
      mediaContext: "POST_VIDEO",
    }),
  });
};

/**
 * Direct upload to Object Storage (AWS S3 / Cloudflare R2) using presigned PUT URL.
 * Bypasses backend server and avoids sending large files through Spring Boot.
 */
export const uploadFileToStorage = async (
  presignedUrl: string,
  file: File | Blob,
  contentType: string
): Promise<void> => {
  const res = await fetch(presignedUrl, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
    },
    body: file,
  });

  if (!res.ok) {
    throw new Error(`Direct storage upload failed: ${res.status} ${res.statusText}`);
  }
};

/**
 * @deprecated Use uploadFileToStorage instead.
 */
export const uploadFileToR2 = uploadFileToStorage;

/**
 * Direct upload to Cloudflare Stream using creator upload URL.
 * Uploads directly from browser to Cloudflare Stream.
 */
export const uploadVideoToStream = async (
  uploadUrl: string,
  file: File | Blob
): Promise<void> => {
  // Try FormData upload first
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(uploadUrl, {
    method: "POST",
    body: formData,
  });

  if (!res.ok && res.status !== 200 && res.status !== 204) {
    // If POST FormData failed, try TUS PATCH protocol / direct binary body
    const binRes = await fetch(uploadUrl, {
      method: "PATCH",
      headers: {
        "Tus-Resumable": "1.0.0",
        "Upload-Offset": "0",
        "Content-Type": "application/offset+octet-stream",
      },
      body: file,
    });
    if (!binRes.ok && binRes.status !== 200 && binRes.status !== 204) {
      throw new Error(`Stream upload failed: ${res.status} ${res.statusText}`);
    }
  }
};

// ---------------------------------------------------------------------------
// Media & Storage Uploads
// ---------------------------------------------------------------------------

export const uploadImageFile = async (
  file: File,
  mediaContext = "POST_IMAGE"
): Promise<{ objectKey: string; publicUrl?: string; url?: string; storageProvider?: string }> => {
  try {
    const presigned = await request<{
      uploadUrl: string;
      objectKey: string;
      publicUrl: string;
      storageProvider?: string;
    }>("/storage/presign-upload", {
      method: "POST",
      body: JSON.stringify({
        fileName: file.name,
        contentType: file.type || "image/jpeg",
        fileSizeBytes: file.size,
        mediaContext,
      }),
    });

    if (!presigned.uploadUrl) {
      throw new Error("Failed to upload media. Please try again after some time.");
    }

    const putRes = await fetch(presigned.uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type || "image/jpeg",
      },
      body: file,
    });

    if (!putRes.ok) {
      throw new Error("Failed to upload media. Please try again after some time.");
    }

    return {
      objectKey: presigned.objectKey,
      publicUrl: presigned.publicUrl,
      url: presigned.publicUrl,
      storageProvider: presigned.storageProvider || "S3",
    };
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw new Error(err.message || "Failed to upload media. Please try again after some time.");
    }
    throw new Error(err?.message || "Failed to upload media. Please try again after some time.");
  }
};

export const uploadVideoFile = async (
  file: File
): Promise<{ videoId: string; objectKey: string; url: string; publicUrl: string; storageProvider: string }> => {
  try {
    const presigned = await request<{
      uploadUrl: string;
      objectKey?: string;
      videoId?: string;
      publicUrl?: string;
      storageProvider?: string;
    }>("/storage/presign-upload", {
      method: "POST",
      body: JSON.stringify({
        fileName: file.name,
        contentType: file.type || "video/mp4",
        fileSizeBytes: file.size,
        mediaContext: "POST_VIDEO",
      }),
    });

    if (!presigned.uploadUrl) {
      throw new Error("Failed to upload media. Please try again after some time.");
    }

    const putRes = await fetch(presigned.uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type || "video/mp4",
      },
      body: file,
    });

    if (!putRes.ok) {
      throw new Error("Failed to upload media. Please try again after some time.");
    }

    const key = presigned.objectKey || presigned.videoId || "";
    const resolvedUrl = presigned.publicUrl || "";

    return {
      videoId: key,
      objectKey: key,
      url: resolvedUrl,
      publicUrl: resolvedUrl,
      storageProvider: presigned.storageProvider || "S3",
    };
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw new Error(err.message || "Failed to upload media. Please try again after some time.");
    }
    throw new Error(err?.message || "Failed to upload media. Please try again after some time.");
  }
};

// =========================================================================