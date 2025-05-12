import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CreateEventForm from "../components/CreateEventForm";
import { useApi } from "../Hooks/useApi";
import HttpError from "../utils/HttpError";
import { useNavigate } from "react-router-dom";

const CreateEventPage = ({ isLoggedIn }) => {
  const MAX_FILE_SIZE_MB = 10; // Maximálna veľkosť súboru v MB
  const [event, setEvent] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    categories: [],
    slug: "",
  });
  const [validateError, setValidateError] = useState(null);
  const [creationError, setCreationError] = useState(null);
  const [eventCreated, setEventCreated] = useState(false);
  const { get, error, loading } = useApi();
  const navigate = useNavigate();

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [eventId, setEventId] = useState(null);
  const [categories, setCategories] = useState([]);
  // Načítanie kategórií pri načítaní komponentov
  const fetchCategories = async () => {
    try {
      const result = await get("/categories");
      if (result) {
        setCategories(result.data);
      } else {
        console.error("Chyba pri načítaní kategórií.");
      }
    } catch (error) {
      console.error("Chyba pri načítaní kategórií:", error);
    }
  };
  useEffect(() => {
    fetchCategories();
  }, []);

  const handleFileChange = (e) => {
    setSelectedFiles(e.target.files);
  };
  const validateSubmit = () => {
    if (!event.title || !event.description || !event.date || !event.location) {
      setValidateError("Všetky polia sú povinné.");
      return false;
    }
    if (event.categories.length === 0) {
      setValidateError("Vyberte aspoň jednu kategóriu.");
      return false;
    }
    if (selectedFiles.length === 0) {
      setValidateError("Vyber plagát.");
      return false;
    }
    if (selectedFiles.length > 0) {
      for (const file of selectedFiles) {
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
          setValidateError(
            `Maximálna veľkosť súboru je ${MAX_FILE_SIZE_MB} MB.`
          );
          return false;
        }
        if (!["image/jpeg", "image/png", "image/gif"].includes(file.type)) {
          setValidateError("Podporované formáty sú: JPEG, PNG, GIF.");
          return false;
        }
      }
    }
    setValidateError(null);
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Event data:", event);
    if (!validateSubmit()) {
      return;
    }
    const token = JSON.parse(localStorage.getItem("user"))?.token;
    try {
      // 1. Vytvor event
      const response = await fetch("http://localhost:5000/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(event),
      });

      const data = await response.json();
      if (!response.ok)
        throw new HttpError(data.error || "Tvorba eventu zlyhala");

      const newEventId = data._id;
      setEventCreated(true);
      setEventId(newEventId);

      // 2. Uploadni obrázky (ak existujú)
      if (selectedFiles.length > 0) {
        const formData = new FormData();
        for (const file of selectedFiles) {
          formData.append("image", file);
        }
        const uploadRes = await fetch(
          `http://localhost:5000/api/upload/${newEventId}/main`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        const uploadData = await uploadRes.json();
        console.log(uploadData);
        if (!uploadRes.ok)
          throw new Error(uploadData.message || "Image upload failed");
      }
    } catch (err) {
      setCreationError(err.error);
      console.error("Chyba pri vytváraní eventu:", err.message);
    }
  };

  if (loading && isLoggedIn === null) {
    return <div className="loading">Načítavam údaje...</div>;
  }
  {
    isLoggedIn === false && navigate("/not-found");
  }
  return (
    <main>
      <h2>Create Event</h2>
      <CreateEventForm
        event={event}
        setEvent={setEvent}
        handleFileChange={handleFileChange}
        handleSubmit={handleSubmit}
        categories={categories}
        validateError={validateError}
        eventCreated={eventCreated}
        creationError={creationError}
      />
    </main>
  );
};

export default CreateEventPage;
