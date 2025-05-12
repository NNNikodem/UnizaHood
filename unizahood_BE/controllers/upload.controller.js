const path = require("path");
const fs = require("fs");
const Comment = require("../models/comment.model");
const Event = require("../models/event.model");

//POST images
const uploadImage = async (req, res) => {
  try {
    const { eventId, commentId } = req.params;

    // CASE 1: Comment image upload (single file)
    if (commentId && req.file) {
      // Update the comment with the image path
      const imagePath = `/uploads/event_${eventId}/comment_${commentId}/${req.file.filename}`;

      // Find and update the Comment document
      const comment = await Comment.findById(commentId);
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }

      // Update the comment's image field
      comment.imageUrl = imagePath;
      await comment.save();

      return res.status(200).json({
        message: "Comment image uploaded",
        files: [req.file.filename],
        imagePath: imagePath,
      });
    }

    // CASE 2: Event image upload (multiple files)
    if (!commentId && req.files && req.files.length > 0) {
      const fileNames = req.files.map((file) => file.filename);

      // Create image paths for the event
      const imagePaths = fileNames.map(
        (filename) => `/uploads/event_${eventId}/main/${filename}`
      );
      // Find and update the Event document
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      // Update the event's images field (make sure to add this field to your Event model)
      if (!event.imagesUrl) {
        event.imagesUrl = [];
      }
      event.imagesUrl = [...event.imagesUrl, ...imagePaths];
      await event.save();

      return res.status(200).json({
        message: "Event images uploaded",
        files: fileNames,
        imagePaths: imagePaths,
      });
    }

    // CASE 3: Handle single file upload without commentId (fallback)
    if (!commentId && req.file) {
      return res.status(200).json({
        message: "Image uploaded",
        files: [req.file.filename],
      });
    }

    // No files found
    return res.status(400).json({ message: "No files uploaded" });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({
      message: "Error uploading images",
      error: error.message,
    });
  }
};

//GET images
const getMainImages = async (req, res) => {
  const { eventId } = req.params;
  const folderPath = path.join(
    __dirname,
    "..",
    "uploads",
    `event_${eventId}`,
    "main"
  );

  fs.readdir(folderPath, (err, files) => {
    if (err)
      return res.status(500).json({ message: "Nepodarilo sa načítať obrázky" });

    const urls = files.map((file) => `/uploads/event_${eventId}/main/${file}`);
    if (urls.length === 0) {
      return res
        .status(404)
        .json({ message: "Pre tento event neexistujú žiadne obrázky." });
    }
    res.status(200).json({ images: urls });
  });
};
const getCommentImages = (req, res) => {
  const { eventId, commentId } = req.params;
  const folderPath = path.join(
    __dirname,
    "..",
    "uploads",
    `event_${eventId}`,
    `comment_${commentId}`
  );

  fs.readdir(folderPath, (err, files) => {
    if (err)
      return res.status(500).json({ message: "Nepodarilo sa načítať obrázky" });

    const urls = files.map(
      (file) => `/uploads/event_${eventId}/comment_${commentId}/${file}`
    );
    res.status(200).json({ images: urls });
  });
};
//DELETE images
const deleteCommentImages = async (req, res) => {
  const { eventId, commentId } = req.params;

  let comment = null;
  try {
    comment = await Comment.findById(commentId);
  } catch (err) {
    return res.status(500).json({ message: "Chyba pri načítaní komentára" });
  }

  if (!comment) {
    return res.status(404).json({ message: "Komentár neexistuje" });
  }
  if (comment.event._id != eventId) {
    console.log(comment.eventId, eventId);
    return res
      .status(400)
      .json({ message: "Komentár nepatrí k tomuto eventu" });
  }
  if (
    comment.author._id.toString() !== req.user.id &&
    req.user.role !== "admin"
  ) {
    return res
      .status(403)
      .json({ message: "Nemáš oprávnenie manipulovať s týmto komentárom." });
  }

  const folderPath = path.join(
    __dirname,
    "..",
    "uploads",
    `event_${eventId}`,
    `comment_${commentId}`
  );

  fs.rm(folderPath, { recursive: true, force: true }, (err) => {
    if (err) {
      console.error("Chyba pri mazání obrázkov komentára:", err);
      return res
        .status(500)
        .json({ message: "Nepodarilo sa vymazať obrázky komentára." });
    }

    res
      .status(200)
      .json({ message: "Obrázky komentára boli úspešne vymazané." });
  });
};
const deleteEventImages = async (req, res) => {
  const { eventId } = req.params;

  try {
    // Získaj event podľa eventId
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event neexistuje" });
    }

    // Overenie prístupových práv (je to tvoj event alebo admin)
    if (
      event.createdBy.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Nemáš oprávnenie manipulovať s týmto eventom." });
    }

    // Cesta k priečinku obrázkov (Main)
    const folderPath = path.join(
      __dirname,
      "..",
      "uploads",
      `event_${eventId}`,
      "main"
    );

    // Skontroluj, či priečinok existuje, aby si ho mohol zmazať
    if (fs.existsSync(folderPath)) {
      fs.rm(folderPath, { recursive: true, force: true }, (err) => {
        if (err) {
          return res
            .status(500)
            .json({ message: "Nepodarilo sa vymazať obrázky.", error: err });
        }
        res
          .status(200)
          .json({ message: "Obrázky eventu boli úspešne vymazané." });
      });
    } else {
      return res
        .status(404)
        .json({ message: "Neexistujú žiadne obrázky pre tento event." });
    }
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Pri mazaní obrázkov nastala chyba." });
  }
};
module.exports = {
  uploadImage,
  getMainImages,
  getCommentImages,
  deleteEventImages,
  deleteCommentImages,
};
