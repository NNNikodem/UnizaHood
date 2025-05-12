const Comment = require("../models/comment.model");
const Event = require("../models/event.model");
const User = require("../models/user.model");
const deleteFolderRecursive = require("../utils/deleteFolder");
const fs = require("fs").promises; // Add this at the top with other imports

// Pridanie komentára
const addComment = async (req, res) => {
  try {
    const event = req.params.eventId;
    const { text } = req.body;
    const author = req.user.id;
    // KONTROLY
    const foundEvent = await Event.findById(event);
    if (!foundEvent) {
      return res.status(404).json({ message: "Event not found" });
    }
    const foundUser = await User.findById(author);
    if (!foundUser) {
      return res.status(404).json({ message: "User not found" });
    }
    //-----

    const newComment = new Comment({
      text,
      author,
      event,
    });

    await newComment.save();
    res.status(201).json(newComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create comment", error });
  }
};

//all
const getAllComments = async (req, res) => {
  try {
    const comments = await Comment.find()
      .populate({
        path: "author",
        select: "username photo _id",
      })
      .populate({
        path: "event",
        select: "title slug",
      });

    // This line to send the response (fixed)
    res.status(200).json({ success: true, data: comments });
  } catch (error) {
    console.error("Chyba pri získavaní komentárov:", error);
    res.status(500).json({
      success: false,
      message: "Nepodarilo sa načítať komentáre.",
      error: error.message,
    });
  }
};
// Získanie mojich komentárov
const getMyComments = async (req, res) => {
  try {
    const userId = req.user.id;
    const comments = await Comment.find({ author: userId })
      .populate({
        path: "author",
        select: "username photo _id",
      })
      .populate({
        path: "event",
        select: "title slug",
      });
    res.status(200).json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch comments", error });
  }
};
// Získanie komentárov pre event
const getCommentsForEvent = async (req, res) => {
  try {
    const eventId = req.params.eventId;

    const comments = await Comment.find({ event: eventId })
      .populate({
        path: "author",
        select: "username photo _id",
      })
      .populate({
        path: "event",
        select: "title slug",
      });

    res.status(200).json(comments);
  } catch (error) {
    console.error("Error in getCommentsForEvent:", error);
    res.status(500).json({ message: "Failed to fetch comments", error });
  }
};
// Úprava komentára
const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { text } = req.body;

    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { text },
      { new: true }
    );
    if (!updatedComment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    res.status(200).json(updatedComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update comment", error });
  }
};

// Vymazanie komentára
const path = require("path");

const deleteComment = async (req, res) => {
  try {
    const commentId = req.params.commentId;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Komentár nebol nájdený." });
    }

    // Overenie oprávnenia
    if (
      comment.author._id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "Nemáš oprávnenie na mazanie tohto komentára.",
      });
    }

    // Zmazanie komentára
    await Comment.findByIdAndDelete(commentId);

    // Zmazanie obrázkov ku komentáru - check if folder exists first
    const folderPath = path.join(
      __dirname,
      "..",
      "uploads",
      `event_${comment.event._id.toString()}`,
      `comment_${commentId}`
    );

    // Check if the folder exists before attempting to delete it
    try {
      await fs.access(folderPath);
      // If access didn't throw an error, the folder exists
      await deleteFolderRecursive(folderPath);
    } catch (err) {}

    res.status(200).json({ message: "Komentár a jeho obrázky boli zmazané." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Chyba pri mazaní komentára", error: error.message });
  }
};

module.exports = {
  addComment,
  getAllComments,
  getCommentsForEvent,
  getMyComments,
  updateComment,
  deleteComment,
};
