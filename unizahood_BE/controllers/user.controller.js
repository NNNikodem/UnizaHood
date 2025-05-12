const User = require("../models/user.model");
const { deleteFile } = require("../utils/deleteFile");
const deleteFolderRecursive = require("../utils/deleteFolder");
const Comment = require("../models/comment.model");
const Event = require("../models/event.model");
const path = require("path");
const bcrypt = require("bcryptjs");
// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate("myEvents", "title _id");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Používateľ nenájdený" });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Používateľ nenájdený" });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllActivities = async (req, res) => {};

// Update user data
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { username, bio } = req.body;

    // Get current user to save old photo path
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "Používateľ nenájdený",
      });
    }

    // Store old photo path if it's not the default
    const oldPhotoPath =
      currentUser.photo && !currentUser.photo.includes("default.png")
        ? currentUser.photo
        : null;

    // Build update object
    const updateData = {};
    let usernameError = null;

    // Handle username update if provided
    if (username) {
      const existingUser = await User.findOne({
        username,
        _id: { $ne: userId },
      });

      if (existingUser) {
        usernameError = "Používateľské meno už existuje";
      } else {
        updateData.username = username;
      }
    }

    // Handle bio update if provided
    if (bio) updateData.bio = bio;

    // Handle photo update if file is uploaded
    if (req.file) {
      const fullPath = req.file.path;
      const uploadsIndex = fullPath.indexOf("uploads");
      if (uploadsIndex === -1) {
        return res
          .status(500)
          .json({ success: false, message: "Zlá cesta k obrázku" });
      }
      updateData.photo = "/" + fullPath.slice(uploadsIndex);
    }

    // Only proceed with update if we have something to update
    if (Object.keys(updateData).length === 0 && !usernameError) {
      return res.status(400).json({
        success: false,
        message: "Neboli poskytnuté žiadne údaje na aktualizáciu.",
      });
    }

    // If we have data to update, proceed
    let updatedUser = null;
    if (Object.keys(updateData).length > 0) {
      updatedUser = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
      });

      // If photo was updated, delete the old photo
      if (req.file && oldPhotoPath) {
        await deleteFile(oldPhotoPath);
      }

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: "Používateľ nenájdený",
        });
      }
    } else {
      updatedUser = await User.findById(userId);
    }

    const response = {
      success: true,
      data: updatedUser,
    };
    if (usernameError) {
      response.warning = usernameError;
      response.message =
        "Profil bol aktualizovaný, ale užívateľské meno už existuje";
    } else {
      response.message = "Profil bol úspešne aktualizovaný";
    }
    res.status(200).json(response);
  } catch (error) {
    console.error("Chyba pri aktualizácii používateľa:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

//goingTO
exports.addGoingToEvent = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Používateľ nenájdený" });
    }

    if (user.goingTo.includes(eventId)) {
      return res.status(400).json({
        success: false,
        message: "Užívateľ sa už prihlásil na tento event",
      });
    }

    user.goingTo.push(eventId);

    await user.save();

    const event = await Event.findById(eventId);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event neexistuje" });
    }
    event.goingToCount = event.goingToCount + 1;
    await event.save();

    res.status(200).json({
      success: true,
      message: `Používateľ ${user.username} sa prihlásil na event: ${event.title}`,
      data: { user, event },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.removeGoingToEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Používateľ nenájdený" });
    }

    if (!user.goingTo.includes(eventId)) {
      return res.status(400).json({
        success: false,
        message: "Užívateľ sa na tento event neprihlásil",
      });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event neexistuje" });
    }
    event.goingToCount--;
    await event.save();
    user.goingTo = user.goingTo.filter((id) => id.toString() !== eventId);
    await user.save();

    res.status(200).json({
      success: true,
      message: `Používateľ ${user.username} sa odhlásil z eventu: ${event.title}`,
      data: { user, event },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
//password
exports.updatePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Všetky polia sú povinné (aktuálne heslo, nové heslo, potvrdenie hesla)",
      });
    }

    // Check if new password and confirm password match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Nové heslo a potvrdenie hesla sa nezhodujú",
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Používateľ nenájdený",
      });
    }

    // Check if current password is correct
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Zadajte platné aktuálne heslo",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Heslo bolo úspešne aktualizované",
    });
  } catch (error) {
    console.error("Chyba pri aktualizácii hesla:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find the user first
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Používateľ nenájdený" });
    }

    // Delete user's profile photo if exists and isn't default
    if (user.photo && !user.photo.includes("default.png")) {
      await deleteFile(user.photo);
    }

    // Find all comments by this user
    const userComments = await Comment.find({ author: userId });

    // Delete comment image folders
    for (const comment of userComments) {
      if (comment.imageUrl) {
        try {
          const eventId = comment.event.toString();
          const commentId = comment._id.toString();

          // Path to comment image folder
          const commentFolderPath = path.join(
            __dirname,
            "..",
            "uploads",
            `event_${eventId}`,
            `comment_${commentId}`
          );

          // Delete the folder with images
          await deleteFolderRecursive(commentFolderPath);
        } catch (err) {
          console.error(
            `Error deleting images for comment ${comment._id}:`,
            err
          );
          // Continue with other deletions even if this one fails
        }
      }
    }

    // Delete all comments by this user
    const deleteCommentsResult = await Comment.deleteMany({ author: userId });

    // Delete the user
    await User.findByIdAndDelete(userId);

    // Return success response with stats
    res.status(200).json({
      success: true,
      message: "Používateľ bol úspešne vymazaný",
      data: {
        username: user.username,
        commentsDeleted: deleteCommentsResult.deletedCount,
      },
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
