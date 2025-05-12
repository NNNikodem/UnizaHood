const express = require("express");
const router = express.Router();
const {
  uploadImage,
  getMainImages,
  getCommentImages,
  deleteCommentImages,
  deleteEventImages,
} = require("../controllers/upload.controller");
const { verifyToken } = require("../middleware/authMiddleware");
const { upload } = require("../middleware/uploadMiddleware");

// upload images
router.post("/:eventId/main", verifyToken, upload.array("image"), uploadImage);
router.post(
  "/:eventId/comment/:commentId",
  verifyToken,
  upload.single("image"),
  uploadImage
);
//get images
router.get("/:eventId/main", getMainImages);
router.get("/:eventId/comment/:commentId", getCommentImages);
//delete iamges
router.delete("/:eventId/main", verifyToken, deleteEventImages);
router.delete("/:eventId/comment/:commentId", verifyToken, deleteCommentImages);

module.exports = router;
