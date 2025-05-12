const express = require("express");
const router = express.Router();
const { upload } = require("../middleware/uploadMiddleware");
const {
  createEvent,
  getAllEvents,
  getEventById,
  getEventBySlug,
  getMyEvents,
  getGoingToEvents,
  updateEvent,
  deleteEvent,
  getEventsByCategory,
} = require("../controllers/event.controller");

const { verifyToken } = require("../middleware/authMiddleware");

router.post("/", verifyToken, upload.array("image"), createEvent);
router.get("/", getAllEvents);
router.get("/id/:eventId", getEventById);
router.get("/slug/:slug", getEventBySlug);
router.get("/category/:categoryId", getEventsByCategory);
router.get("/my", verifyToken, getMyEvents);
router.get("/goingTo", verifyToken, getGoingToEvents);

router.put("/:eventId", verifyToken, upload.array("image"), updateEvent);
router.delete("/:eventId", verifyToken, deleteEvent);

module.exports = router;
