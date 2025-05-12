const multer = require("multer");
const path = require("path");
const fs = require("fs");
const HttpError = require("../utils/HttpError");

const MAX_FILE_SIZE = 10;
const MAX_FILE_SIZE_MB = MAX_FILE_SIZE * 1024 * 1024; // 10MB

const allowedExtensions = [".jpeg", ".png", ".jpg", ".jfif", ".gif"];
const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/jfif",
  "image/gif",
];

// Konfigurácia pre uloženie súboru
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const eventId = req.params.eventId;
    const commentId = req.params.commentId;

    let folder = "";

    if (eventId && !commentId) {
      folder = `event_${eventId}/main`;
    } else if (eventId && commentId) {
      folder = `event_${eventId}/comment_${commentId}`;
    }

    const uploadPath = path.join(__dirname, "..", "uploads", folder);
    fs.mkdirSync(uploadPath, { recursive: true }); // Vytvorenie adresára, ak neexistuje

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + fileExtension);
  },
});

// Validácia typu súboru (obrázky)
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const isMimeAllowed = allowedMimeTypes.includes(file.mimetype);
  const isExtAllowed = allowedExtensions.includes(ext);

  if (isMimeAllowed || isExtAllowed) {
    cb(null, true); // Povoliť nahrávanie
  } else {
    const error = new HttpError("Nepodporovaný formát súboru.", 400);
    cb(error, false); // Zamietnuť nahrávanie
  }
};

// User photo upload configuration
const userPhotoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = req.params.userId;
    const uploadPath = path.join(
      __dirname,
      "..",
      "uploads",
      "profile_photos",
      `user_${userId}`
    );
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname);
    cb(null, "profile-" + uniqueSuffix + fileExtension);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_MB },
});
const userPhotoUpload = multer({
  storage: userPhotoStorage,
  fileFilter: fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_MB },
});

module.exports = {
  upload,
  userPhotoUpload,
};
