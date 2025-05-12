const express = require("express");
const { userPhotoUpload } = require("../middleware/uploadMiddleware");
const router = express.Router();
const {
  getAllUsers,
  getCurrentUser,
  getUserById,
  addGoingToEvent,
  removeGoingToEvent,
  updateUser,
  updatePassword,
  deleteUser,
} = require("../controllers/user.controller");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.get("/allUsers", verifyToken, isAdmin, getAllUsers);
router.get("/me", verifyToken, getCurrentUser);
router.get("/:userId", verifyToken, getUserById);
router.put(
  "/:userId/update",
  verifyToken,
  userPhotoUpload.single("photo"),
  updateUser
);
router.put("/password-change", verifyToken, updatePassword);
router.put("/goingTo/:eventId", verifyToken, addGoingToEvent);
router.put("/goingTo/:eventId/remove", verifyToken, removeGoingToEvent);
router.delete("/:userId", verifyToken, deleteUser);

module.exports = router;
