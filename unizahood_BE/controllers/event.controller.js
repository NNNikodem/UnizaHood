const Event = require("../models/event.model");
const User = require("../models/user.model");
const Comment = require("../models/comment.model");
const Category = require("../models/category.model");
const deleteFolderRecursive = require("../utils/deleteFolder");
const { deleteFile } = require("../utils/deleteFile");
const mongoose = require("mongoose");
const path = require("path");

const createEvent = async (req, res) => {
  try {
    const { title, description, date, location, categories, slug } = req.body;
    // validácia kategórií
    const validCategories = await Category.find({ _id: { $in: categories } });
    if (validCategories.length !== categories.length) {
      return res
        .status(400)
        .json({ error: "Jedna alebo viac kategórií sú nesprávne." });
    }

    const newEvent = new Event({
      title,
      description,
      date,
      location,
      createdBy: req.user.id,
      categories,
      slug,
    });
    // Uloženie eventu
    await newEvent.save();

    await User.findByIdAndUpdate(req.user.id, {
      $push: { myEvents: newEvent._id },
    });
    res.status(201).json(newEvent);
  } catch (err) {
    res.status(500).json({ error: "Nepodarilo sa vytvoriť event" });
  }
};
const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate({
        path: "createdBy",
        select: "username photo _id",
        model: "User",
      })
      .populate({
        path: "categories",
        select: "name _id",
        model: "Category",
      });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: "Chyba pri načítaní eventov" });
  }
};
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId)
      .populate("createdBy", "username")
      .populate("categories", "name");
    if (!event) return res.status(404).json({ error: "Event neexistuje" });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: "Chyba pri načítaní eventu" });
  }
};
const getEventBySlug = async (req, res) => {
  const { slug } = req.params;
  try {
    const event = await Event.findOne({ slug })
      .populate("createdBy", "username")
      .populate("categories", "name");
    if (!event) return res.status(404).json({ error: "Event neexistuje" });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: "Chyba pri načítaní eventu" });
  }
};
const getEventsByCategory = async (req, res) => {
  const { categoryId } = req.params;
  try {
    const events = await Event.find({ categories: categoryId })
      .populate("createdBy", "username")
      .populate("categories", "name");

    if (!events || events.length === 0) {
      return res
        .status(404)
        .json({ error: "Žiadne eventy pre túto kategóriu" });
    }

    res.status(200).json(events);
  } catch (err) {
    console.error("Error fetching events by category:", err);
    res.status(500).json({ error: "Chyba pri načítaní eventov" });
  }
};

const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ createdBy: req.user.id });
    res.status(200).json({ success: true, data: events });
  } catch (err) {
    res.status(500).json({ error: "Chyba pri načítaní tvojich eventov" });
  }
};
const getGoingToEvents = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("goingTo");
    if (!user) return res.status(404).json({ error: "Používateľ neexistuje" });
    const events = await Event.find({ _id: { $in: user.goingTo } })
      .populate("createdBy", "username")
      .populate("categories", "name");
    if (!events || events.length === 0) {
      return res.status(404).json({ error: "Žiadne eventy, na ktoré ideš" });
    }
    res.status(200).json({ success: true, data: events });
  } catch (err) {
    console.error("Error fetching events by category:", err);
    res.status(500).json({ error: "Chyba pri načítaní eventov" });
  }
};

const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ error: "Event neexistuje" });

    // Kontrola oprávnení
    if (
      event.createdBy.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ error: "Nemáš oprávnenie meniť tento event" });
    }

    // Základné údaje o evente z req.body
    const updatedData = { ...req.body };
    // Ak chceme odstrániť existujúci obrázok (a nenahradiť ho)
    if (req.body.removeImage === "true" ) {
      updatedData.imagesUrl = [];
      // Delete each existing image file
      if (event.imagesUrl && event.imagesUrl.length > 0) {
        for (const imageUrl of event.imagesUrl) {
          try {
            // Convert URL path to file system path
            const filePath = path.join(__dirname, "..", imageUrl);
            await deleteFile(filePath);
            console.log(`Deleted file: ${filePath}`);
          } catch (error) {
            console.error(`Error deleting file: ${imageUrl}`, error);
          }
        }
      }
    }

    // Ak máme nové obrázky, spracujeme ich
    if (req.files && req.files.length > 0) {
      // Aktualizujeme cesty k obrázkom podľa toho, ako ich uložilo multer
      updatedData.imagesUrl = req.files.map((file) => {
        // Konverzia absolútnej cesty na relatívnu
        const relativePath = file.path.split("uploads")[1];
        return "/uploads" + relativePath.replace(/\\/g, "/");
      });
    }

    // Odstránime pomocné polia, ktoré nechceme uložiť do DB
    delete updatedData.removeImage;

    // Konverzia kategórií z formulára (ak existujú ako pole)
    if (updatedData.categories && Array.isArray(updatedData.categories)) {
      // Necháme kategórie ako pole (predpokladáme, že sú ako pole ID)
    } else if (updatedData["categories[]"]) {
      // Konverzia z FormData formátu (buď jedno ID alebo pole)
      updatedData.categories = Array.isArray(updatedData["categories[]"])
        ? updatedData["categories[]"]
        : [updatedData["categories[]"]];
      delete updatedData["categories[]"];
    }

    const updated = await Event.findByIdAndUpdate(
      req.params.eventId,
      updatedData,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error("Chyba pri aktualizácii eventu:", err);
    res.status(500).json({ error: "Chyba pri aktualizácii eventu" });
  }
};
const deleteEvent = async (req, res) => {
  try {
    const eventId = req.params.eventId;

    // Find the event
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: "Event neexistuje" });

    // Check permissions
    if (
      event.createdBy.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ error: "Nemáš oprávnenie zmazať tento event" });
    }

    // Find and delete all comments associated with this event
    const deletedComments = await Comment.deleteMany({ event: eventId });
    console.log(`Deleted ${deletedComments.deletedCount} comments`);

    // Delete the event itself
    await Event.findByIdAndDelete(eventId);

    // Delete all files related to the event
    const uploadPath = path.join(__dirname, "../uploads", `event_${eventId}`);
    console.log(`Deleting folder: ${uploadPath}`);
    await deleteFolderRecursive(uploadPath);

    res.json({
      message: `Event, ${deletedComments.deletedCount} komentárov a súbory úspešne zmazané`,
    });
  } catch (err) {
    console.error("Error deleting event:", err);
    res
      .status(500)
      .json({ message: "Chyba pri mazaní eventu", error: err.message });
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  getEventBySlug,
  getEventsByCategory,
  getMyEvents,
  getGoingToEvents,
  updateEvent,
  deleteEvent,
};
