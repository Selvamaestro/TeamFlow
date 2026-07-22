const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
];

function fileFilterFactory(allowedTypes) {
  return (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) return cb(null, true);
    cb(new Error(`Unsupported file type: ${file.mimetype}`));
  };
}

function makeUploader({ folder, limitBytes, allowedTypes }) {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
      folder: `teamflow/${folder}`,
      resource_type: "auto",
    }),
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

module.exports = {
  cloudinary,
  uploadAvatar,
  uploadProjectDocument,
  uploadTaskAttachment,
};
