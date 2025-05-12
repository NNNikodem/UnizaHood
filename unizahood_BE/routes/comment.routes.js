const express = require("express");
const router = express.Router();
const {
  addComment,
  getAllComments,
  getCommentsForEvent,
  getMyComments,
  updateComment,
  deleteComment,
} = require("../controllers/comment.controller");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

router.post("/:eventId", verifyToken, addComment);
router.get("/get-all", verifyToken, isAdmin, getAllComments);
router.get("/my", verifyToken, getMyComments);
router.get("/:eventId", verifyToken, getCommentsForEvent);
router.put("/:commentId", verifyToken, updateComment);
router.delete("/:commentId", verifyToken, deleteComment);

module.exports = router;
