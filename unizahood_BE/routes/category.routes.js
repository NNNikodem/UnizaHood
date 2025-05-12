const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const {
  createCategory,
  getAllCategories,
} = require("../controllers/category.controller");

router.post("/", verifyToken, createCategory);
router.get("/", getAllCategories);

module.exports = router;
