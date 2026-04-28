const fs = require("fs");
const path = require("path");
const multer = require("multer");

const uploadsDir = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const safeOriginalName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${safeOriginalName}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.has(file.mimetype)) {
    cb(null, true);
    return;
  }

  cb(new Error("Only images, PDF, DOC, and DOCX files are allowed"));
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

const uploadAttachment = (req, res, next) => {
  upload.single("attachment")(req, res, (err) => {
    if (!err) {
      next();
      return;
    }

    if (err.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({ message: "File must be 10 MB or smaller" });
      return;
    }

    res.status(400).json({ message: err.message });
  });
};

module.exports = uploadAttachment;
