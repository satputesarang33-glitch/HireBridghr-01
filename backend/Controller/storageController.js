import { storageService } from "../Services/storageService.js";
import { resumeParserService } from "../Services/resumeParserService.js";

export const storageController = {
  /**
   * Upload file (multipart form data)
   */
  async uploadFile(req, res) {
    try {
      if (!req.file && !req.body.fileBase64) {
        return res.status(400).json({
          success: false,
          error: { message: "No file uploaded. Please provide a file field or fileBase64." },
        });
      }

      let buffer;
      let originalName;
      let mimeType;

      if (req.file) {
        buffer = req.file.buffer;
        originalName = req.file.originalname;
        mimeType = req.file.mimetype;
      } else {
        // Base64 upload support
        const base64Data = req.body.fileBase64.replace(/^data:([A-Za-z-+/]+);base64,/, "");
        buffer = Buffer.from(base64Data, "base64");
        originalName = req.body.fileName || "uploaded-file.pdf";
        mimeType = req.body.mimeType || "application/pdf";
      }

      const folder = req.body.folder || "resumes";
      const uploadResult = await storageService.uploadFile({
        buffer,
        originalName,
        mimeType,
        folder,
      });

      return res.status(200).json({
        success: true,
        data: uploadResult,
        message: "File uploaded successfully.",
      });
    } catch (err) {
      console.error("Storage upload error:", err);
      return res.status(500).json({
        success: false,
        error: { message: err.message || "Failed to upload file." },
      });
    }
  },

  /**
   * Upload and immediately parse resume
   */
  async uploadAndParseResume(req, res) {
    try {
      let buffer;
      let originalName = "resume.pdf";
      let mimeType = "application/pdf";

      if (req.file) {
        buffer = req.file.buffer;
        originalName = req.file.originalname;
        mimeType = req.file.mimetype;
      } else if (req.body.fileBase64) {
        const base64Data = req.body.fileBase64.replace(/^data:([A-Za-z-+/]+);base64,/, "");
        buffer = Buffer.from(base64Data, "base64");
        originalName = req.body.fileName || "resume.pdf";
      } else if (req.body.resumeText) {
        // Direct text parsing
        const parsed = resumeParserService.parseText(req.body.resumeText);
        return res.status(200).json({
          success: true,
          data: {
            parsed,
            fileUrl: null,
          },
          message: "Resume parsed successfully.",
        });
      } else {
        return res.status(400).json({
          success: false,
          error: { message: "Provide a resume file, base64 payload, or resumeText." },
        });
      }

      // Upload file to cloud/local storage
      const uploadResult = await storageService.uploadFile({
        buffer,
        originalName,
        mimeType,
        folder: "resumes",
      });

      // Extract text content from buffer if possible or use filename/metadata
      const bufferText = buffer.toString("utf8");
      const parsed = resumeParserService.parseText(bufferText.length > 50 ? bufferText : originalName);

      return res.status(200).json({
        success: true,
        data: {
          file: uploadResult,
          parsed,
        },
        message: "Resume uploaded and parsed successfully.",
      });
    } catch (err) {
      console.error("Upload & Parse error:", err);
      return res.status(500).json({
        success: false,
        error: { message: err.message || "Failed to process resume." },
      });
    }
  },
};
