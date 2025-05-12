const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token chýba" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Neplatný token" });
  }
};

const isAdmin = async (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: "Chýbajúce ID používateľa" });
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ error: "Používateľ neexistuje" });
  }

  if (user.role !== "admin") {
    return res.status(403).json({ error: "Prístup zamietnutý – len admin" });
  }

  next();
};

module.exports = { verifyToken, isAdmin };
