import path from "path";
import fs from "fs";
import multer from "multer";
import { storage } from "../Config/connetdb.js";

// Ensure uploads directory exists for reliable fallback
const UPLOAD_DIR = path.resolve(process.cwd(), "public/uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer memory storage for processing
const memoryStorage = multer.memoryStorage();
export const uploadMiddleware = multer({
  storage: memoryStorage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
      "image/webp",
      "text/plain",
    ];
    if (allowed.includes(file.mimetype) || file.originalname.match(/\.(pdf|docx?|jpe?g|png|webp|txt)$/i)) {
      cb(null, true);
    } else {
      cb(new Error("File type not allowed. Supported types: PDF, DOC, DOCX, PNG, JPG, WEBP."));
    }
  },
});

export const storageService = {
  /**
   * Uploads file buffer to Firebase Storage or local disk fallback
   */
  async uploadFile({ buffer, originalName, mimeType, folder = "resumes" }) {
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueFileName = `${folder}/${Date.now()}-${sanitizedName}`;

    try {
      if (storage && process.env.FIREBASE_STORAGE_BUCKET) {
        const bucket = storage.bucket(process.env.FIREBASE_STORAGE_BUCKET);
        const fileRef = bucket.file(uniqueFileName);

        await fileRef.save(buffer, {
          metadata: {
            contentType: mimeType,
            metadata: {
              originalName,
              uploadedAt: new Date().toISOString(),
            },
          },
          resumable: false,
        });

        // Try getting a public/signed URL or download URL
        try {
          const [signedUrl] = await fileRef.getSignedUrl({
            action: "read",
            expires: Date.now() + 1000 * 60 * 60 * 24 * 365, // 1 year
          });
          return {
            url: signedUrl,
            fileName: originalName,
            storagePath: uniqueFileName,
            fileSize: `${(buffer.length / (1024 * 1024)).toFixed(2)} MB`,
            provider: "firebase",
          };
        } catch (signErr) {
          // If signed URL requires service account signing permission, return bucket public URL
          const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(uniqueFileName)}?alt=media`;
          return {
            url: publicUrl,
            fileName: originalName,
            storagePath: uniqueFileName,
            fileSize: `${(buffer.length / (1024 * 1024)).toFixed(2)} MB`,
            provider: "firebase",
          };
        }
      }
    } catch (firebaseErr) {
      console.warn("⚠️ Firebase Storage unavailable, falling back to local storage:", firebaseErr.message);
    }

    // Local Disk Fallback
    const localTargetDir = path.join(UPLOAD_DIR, folder);
    if (!fs.existsSync(localTargetDir)) {
      fs.mkdirSync(localTargetDir, { recursive: true });
    }
    const localFileName = `${Date.now()}-${sanitizedName}`;
    const localFilePath = path.join(localTargetDir, localFileName);
    fs.writeFileSync(localFilePath, buffer);

    const publicUrl = `/uploads/${folder}/${localFileName}`;
    return {
      url: publicUrl,
      fileName: originalName,
      storagePath: localFilePath,
      fileSize: `${(buffer.length / (1024 * 1024)).toFixed(2)} MB`,
      provider: "local",
    };
  },
};
