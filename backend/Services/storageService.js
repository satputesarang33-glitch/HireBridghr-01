import path from "path";
import fs from "fs";
import crypto from "crypto";
import multer from "multer";
import { storage } from "../Config/connetdb.js";

// Ensure uploads directory exists for reliable fallback
const UPLOAD_DIR = path.resolve(process.cwd(), "public/uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Allowed MIME types and extensions map
const ALLOWED_MIME_EXT_MAP = {
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "text/plain": [".txt"],
};

const DANGEROUS_EXTENSIONS = [
  ".exe", ".bat", ".cmd", ".sh", ".bash", ".ps1", ".vbs",
  ".html", ".htm", ".xhtml", ".svg", ".php", ".phtml",
  ".js", ".mjs", ".cjs", ".jar", ".war", ".jsp", ".asp", ".aspx",
];

/**
 * Validates magic bytes / file signatures to prevent disguised file execution
 */
export const validateMagicBytes = (buffer, ext) => {
  if (!buffer || buffer.length < 4) return false;

  const headerHex = buffer.slice(0, 8).toString("hex").toLowerCase();

  switch (ext.toLowerCase()) {
    case ".pdf":
      // %PDF (25 50 44 46)
      return headerHex.startsWith("25504446");

    case ".png":
      // \x89PNG (89 50 4e 47 0d 0a 1a 0a)
      return headerHex.startsWith("89504e47");

    case ".jpg":
    case ".jpeg":
      // FF D8 FF
      return headerHex.startsWith("ffd8ff");

    case ".webp":
      // RIFF....WEBP (52 49 46 46)
      return headerHex.startsWith("52494646") && buffer.slice(8, 12).toString("ascii") === "WEBP";

    case ".docx":
      // PK.. (50 4b 03 04) - Zip container format
      return headerHex.startsWith("504b0304");

    case ".doc":
      // OLE container (d0 cf 11 e0)
      return headerHex.startsWith("d0cf11e0");

    case ".txt":
      // Ensure no binary executable header
      return !headerHex.startsWith("4d5a") && !headerHex.startsWith("7f454c46");

    default:
      return true;
  }
};

/**
 * Validates buffer, filename, and mimeType against security policy
 */
export const validateFilePayload = (buffer, originalName, mimeType) => {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error("Invalid file content.");
  }

  // 15MB absolute maximum limit
  if (buffer.length > 15 * 1024 * 1024) {
    throw new Error("File exceeds maximum allowed size (15MB).");
  }

  const safeBaseName = path.basename(originalName || "file.pdf");
  const ext = path.extname(safeBaseName).toLowerCase();

  // Reject dangerous extensions outright
  if (DANGEROUS_EXTENSIONS.includes(ext)) {
    throw new Error(`File extension '${ext}' is strictly prohibited for security reasons.`);
  }

  // Verify extension is in allowed list
  const allowedExts = Object.values(ALLOWED_MIME_EXT_MAP).flat();
  if (!allowedExts.includes(ext)) {
    throw new Error(`Unsupported file type '${ext}'. Permitted types: PDF, DOC, DOCX, PNG, JPG, WEBP, TXT.`);
  }

  // Verify magic bytes
  if (!validateMagicBytes(buffer, ext)) {
    throw new Error("File signature does not match the claimed file extension.");
  }

  return { safeBaseName, ext };
};

// Multer memory storage with defensive filter
const memoryStorage = multer.memoryStorage();
export const uploadMiddleware = multer({
  storage: memoryStorage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
  fileFilter: (req, file, cb) => {
    const safeBaseName = path.basename(file.originalname || "");
    const ext = path.extname(safeBaseName).toLowerCase();

    if (DANGEROUS_EXTENSIONS.includes(ext)) {
      return cb(new Error(`File extension '${ext}' is prohibited.`));
    }

    const allowedExts = Object.values(ALLOWED_MIME_EXT_MAP).flat();
    if (!allowedExts.includes(ext)) {
      return cb(
        new Error("File type not allowed. Supported types: PDF, DOC, DOCX, PNG, JPG, WEBP, TXT.")
      );
    }

    cb(null, true);
  },
});

export const storageService = {
  /**
   * Uploads file buffer to Firebase Storage or local disk fallback
   */
  async uploadFile({ buffer, originalName, mimeType, folder = "resumes" }) {
    // Validate buffer and signature
    const { safeBaseName, ext } = validateFilePayload(buffer, originalName, mimeType);

    // Sanitize folder path (prevent path traversal)
    const sanitizedFolder = String(folder).replace(/[^a-zA-Z0-9_-]/g, "") || "resumes";

    // Cryptographically unique safe filename
    const uniqueToken = crypto.randomBytes(6).toString("hex");
    const sanitizedName = safeBaseName
      .replace(ext, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 40);
    const uniqueFileName = `${sanitizedFolder}/${Date.now()}-${uniqueToken}-${sanitizedName}${ext}`;

    try {
      if (storage && process.env.FIREBASE_STORAGE_BUCKET) {
        const bucket = storage.bucket(process.env.FIREBASE_STORAGE_BUCKET);
        const fileRef = bucket.file(uniqueFileName);

        await fileRef.save(buffer, {
          metadata: {
            contentType: mimeType || "application/octet-stream",
            metadata: {
              originalName: safeBaseName,
              uploadedAt: new Date().toISOString(),
            },
          },
          resumable: false,
        });

        // Try getting a signed URL or public download URL
        try {
          const [signedUrl] = await fileRef.getSignedUrl({
            action: "read",
            expires: Date.now() + 1000 * 60 * 60 * 24 * 365, // 1 year
          });
          return {
            url: signedUrl,
            fileName: safeBaseName,
            storagePath: uniqueFileName,
            fileSize: `${(buffer.length / (1024 * 1024)).toFixed(2)} MB`,
            provider: "firebase",
          };
        } catch (signErr) {
          const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(uniqueFileName)}?alt=media`;
          return {
            url: publicUrl,
            fileName: safeBaseName,
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
    const localTargetDir = path.join(UPLOAD_DIR, sanitizedFolder);
    if (!fs.existsSync(localTargetDir)) {
      fs.mkdirSync(localTargetDir, { recursive: true });
    }

    const localFileName = `${Date.now()}-${uniqueToken}-${sanitizedName}${ext}`;
    const localFilePath = path.join(localTargetDir, localFileName);
    fs.writeFileSync(localFilePath, buffer);

    const publicUrl = `/uploads/${sanitizedFolder}/${localFileName}`;
    return {
      url: publicUrl,
      fileName: safeBaseName,
      storagePath: localFilePath,
      fileSize: `${(buffer.length / (1024 * 1024)).toFixed(2)} MB`,
      provider: "local",
    };
  },
};
