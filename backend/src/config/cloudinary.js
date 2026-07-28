const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const path = require("path");

const LIMITS = {
  avatar: 2 * 1024 * 1024, // 2MB
  document: 15 * 1024 * 1024, // 15MB
  attachment: 10 * 1024 * 1024, // 10MB
};

const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];
const DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/png",
  "image/jpeg",
  "image/webp",
  "text/plain",
  "text/csv",
];

const ALLOWED_EXTENSIONS = [
  ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".png", ".jpg", ".jpeg", ".webp", ".txt", ".csv"
];

function fileFilterFactory(allowedTypes) {
  return (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(file.mimetype) || ALLOWED_EXTENSIONS.includes(ext)) {
      return cb(null, true);
    }
    cb(new Error(`Unsupported file type: ${file.mimetype}`));
  };
}

function makeUploader({ folder, limitBytes, allowedTypes }) {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
      const extWithDot = path.extname(file.originalname).toLowerCase();
      const ext = extWithDot.replace(".", "");
      const rawBaseName = path.basename(file.originalname, extWithDot);
      const cleanBaseName = rawBaseName.replace(/[^a-zA-Z0-9_-]/g, "_") || "document";
      const filename = `${cleanBaseName}_${Date.now()}`;

      // PDF and Images can be served via auto/image resource_type so browsers can render/preview them inline
      const isVisualOrPdf = ["jpg", "jpeg", "png", "webp", "gif", "pdf", "svg"].includes(ext);

      return {
        folder: `teamflow/${folder}`,
        resource_type: isVisualOrPdf ? "auto" : "raw",
        public_id: ext ? `${filename}.${ext}` : filename,
        format: ext || undefined,
        use_filename: true,
        unique_filename: true,
      };
    },
  });

  return multer({
    storage,
    limits: { fileSize: limitBytes },
    fileFilter: fileFilterFactory(allowedTypes),
  });
}

const uploadAvatar = makeUploader({
  folder: "avatars",
  limitBytes: LIMITS.avatar,
  allowedTypes: AVATAR_TYPES,
});

const uploadProjectDocument = makeUploader({
  folder: "project-documents",
  limitBytes: LIMITS.document,
  allowedTypes: DOCUMENT_TYPES,
});

const uploadTaskAttachment = makeUploader({
  folder: "task-attachments",
  limitBytes: LIMITS.attachment,
  allowedTypes: DOCUMENT_TYPES,
});

const uploadChatAttachment = makeUploader({
  folder: "chat-attachments",
  limitBytes: LIMITS.attachment,
  allowedTypes: DOCUMENT_TYPES,
});

module.exports = {
  cloudinary,
  uploadAvatar,
  uploadProjectDocument,
  uploadTaskAttachment,
  uploadChatAttachment,
};
