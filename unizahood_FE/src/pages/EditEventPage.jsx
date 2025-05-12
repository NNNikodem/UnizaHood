import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApi } from "../Hooks/useApi";
import CreateEventForm from "../components/CreateEventForm";

const EditEventPage = ({ isLoggedIn }) => {
  const MAX_FILE_SIZE_MB = 10;
  const { slug } = useParams();
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const [originalEvent, setOriginalEvent] = useState(null);
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    categories: [],
    slug: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { get, error: apiError, loading: apiLoading } = useApi();
  const [categories, setCategories] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [validateError, setValidateError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await get(`/events/slug/${slug}`);
        if (response.success) {
          const event = response.data;

          // Formátovanie dátumu pre input type datetime-local
          let formattedDate = "";
          if (event.date) {
            const date = new Date(event.date);
            formattedDate = date.toISOString().slice(0, 16); // Format: YYYY-MM-DDThh:mm
          }

          // Pripravíme kategórie - potrebujeme ich ID
          const categoryIds = Array.isArray(event.categories)
            ? event.categories.map((cat) =>
                typeof cat === "object" ? cat._id : cat
              )
            : [];

          setEventData({
            _id: event._id,
            title: event.title || "",
            description: event.description || "",
            date: formattedDate,
            location: event.location || "",
            categories: categoryIds,
            slug: event.slug || "",
            imagesUrl: event.imagesUrl,
          });
          setOriginalEvent(event);
        } else {
          setError("Nepodarilo sa načítať údaje o udalosti");
        }
      } catch (err) {
        setError("Nastala chyba pri komunikácii so serverom");
      } finally {
        setLoading(false);
      }
    };
    const fetchCategories = async () => {
      try {
        const result = await get("/categories");
        if (result && result.success) {
          setCategories(result.data);
        } else {
          console.error("Chyba pri načítaní kategórií.");
        }
      } catch (error) {
        console.error("Chyba pri načítaní kategórií:", error);
      }
    };
    fetchCategories();
    if (slug) fetchEvent();
  }, [slug]);

  const handleFileChange = (e) => {
    setSelectedFiles(e.target.files);
  };

  // Validácia formulára pred odoslaním
  const validateSubmit = () => {
    if (
      !eventData.title ||
      !eventData.description ||
      !eventData.date ||
      !eventData.location
    ) {
      setValidateError("Všetky polia sú povinné.");
      return false;
    }
    if (eventData.categories.length === 0) {
      setValidateError("Vyberte aspoň jednu kategóriu.");
      return false;
    }

    // Kontrola existencie pôvodných obrázkov (z originalEvent)
    const hadOriginalImages =
      originalEvent &&
      originalEvent.imagesUrl &&
      originalEvent.imagesUrl.length > 0;

    // Kontrola aktuálnych obrázkov (po prípadných úpravách)
    const hasExistingImages =
      eventData.imagesUrl && eventData.imagesUrl.length > 0;

    // Príznak pre odstránenie obrázkov
    const hasRemovedImage = eventData.removeImage;

    // Kontrola nových obrázkov
    const hasNewImages = selectedFiles && selectedFiles.length > 0;

    // Validácia: Aspoň jeden obrázok musí byť prítomný
    if (!hasExistingImages && !hasNewImages) {
      // Ak nemáme žiadne existujúce obrázky ani nové, ale pôvodne tam boli (boli odstránené)
      if (hadOriginalImages && hasRemovedImage) {
        setValidateError("Po odstránení pôvodného obrázku musíte nahrať nový.");
        return false;
      }

      // Ak nikdy neboli obrázky a ani teraz nie sú vybrané
      if (!hadOriginalImages) {
        setValidateError("Plagát je povinný. Prosím nahrajte obrázok eventu.");
        return false;
      }
    }

    // Kontrola veľkosti a typu nových obrázkov
    if (hasNewImages) {
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

    if (!validateSubmit()) {
      return;
    }
    try {
      setLoading(true);
      const token = JSON.parse(localStorage.getItem("user"))?.token;

      // Vytvorenie FormData pre odoslanie údajov aj súborov v jednom requeste
      const formData = new FormData();

      // Pridanie základných údajov
      formData.append("title", eventData.title);
      formData.append("description", eventData.description);
      formData.append("date", eventData.date);
      formData.append("location", eventData.location);
      formData.append("slug", eventData.slug);

      // Pridanie príznaku na odstránenie obrázka
      if (eventData.removeImage) {
        formData.append("removeImage", "true");
      }

      // Pridanie kategórií
      eventData.categories.forEach((catId) => {
        formData.append("categories[]", catId);
      });

      // Pridanie obrázkov
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          formData.append("image", file);
        }
      }

      // Odoslanie na server
      const response = await fetch(
        `http://localhost:5000/api/events/${eventData._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Aktualizácia eventu zlyhala");
      }

      setSuccess(true);

      // Presmerovanie po úspešnej aktualizácii
      setTimeout(() => {
        navigate("/event/" + data.slug);
      }, 1000);
    } catch (err) {
      setError(err.message || "Nastala neočakávaná chyba");
    } finally {
      setLoading(false);
    }
  };
  if (loading && !eventData.title) {
    return <div className="loading">Načítavam údaje o udalosti...</div>;
  }
  {
    isLoggedIn === false && navigate("/not-found");
  }
  if (originalEvent && user) {
    if (user.role !== "admin" && user.id !== originalEvent.createdBy._id) {
      navigate("/not-found");
    }
  }
  return (
    <>
      {}
      <div className="edit-event-page">
        <h1 className="page-title">Upraviť udalosť</h1>

        <CreateEventForm
          event={eventData}
          setEvent={setEventData}
          handleFileChange={handleFileChange}
          handleSubmit={handleSubmit}
          categories={categories}
          validateError={validateError}
          eventCreated={success}
          creationError={error}
          isEdit={true}
        />
      </div>
    </>
  );
};

export default EditEventPage;
