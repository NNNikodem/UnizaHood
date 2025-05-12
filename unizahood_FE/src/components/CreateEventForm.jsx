import React, { useState, useEffect } from "react";
import "../CSS/CreateEventForm.css";
import { Link } from "react-router-dom";
import { FaImage } from "react-icons/fa"; // Pridaný import pre ikonu

const CreateEventForm = ({
  event,
  setEvent,
  handleFileChange,
  handleSubmit,
  categories = [],
  validateError,
  eventCreated,
  creationError,
  isEdit = false,
}) => {
  const [imagePreview, setImagePreview] = useState(null);

  // Efekt pre vyčistenie objektových URL pri odmontovaní komponentu
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);
  // Pri editácii nastavíme náhľad existujúceho obrázka
  useEffect(() => {
    if (isEdit && event.imageUrl) {
      setImagePreview(`http://localhost:5000${event.imageUrl}`);
    } else if (isEdit && event.imagesUrl && event.imagesUrl.length > 0) {
      setImagePreview(`http://localhost:5000${event.imagesUrl[0]}`);
    }
  }, [isEdit, event.imageUrl, event.imagesUrl]);

  const handleFileChangeWithPreview = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Ak existuje predchádzajúci náhľad, uvoľníme jeho URL
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }

      if (isEdit) {
        const newEvent = { ...event };
        newEvent.removeImage = true;
        setEvent(newEvent);
      }
      // Vytvorenie URL náhľadu
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);

      // Volanie originálneho handleFileChange
      handleFileChange(e);
    }
  };

  const removeImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }

    // Odstrániť súbor zo stavu formulára
    const newEvent = { ...event };
    delete newEvent.image;

    // Pri editácii pridáme príznak, že chceme odstrániť existujúci obrázok
    if (isEdit) {
      newEvent.removeImage = true;
    }

    setEvent(newEvent);
  };

  const handleCategorySelect = (e) => {
    const selectedId = e.target.value;

    if (selectedId && !event.categories.includes(selectedId)) {
      setEvent({
        ...event,
        categories: [...event.categories, selectedId],
      });
    }

    e.target.value = "";
  };

  const createSlug = (name) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-]/g, "");
  };

  const handleRemoveCategory = (idToRemove) => {
    setEvent({
      ...event,
      categories: event.categories.filter((id) => id !== idToRemove),
    });
  };

  const categoryList = Array.isArray(categories) ? categories : [];

  //ak eventCreated je true, vymaž formulár okrem slug
  useEffect(() => {
    if (eventCreated) {
      setEvent({
        title: "",
        description: "",
        date: "",
        location: "",
        categories: [],
        slug: event.slug,
      });
      setImagePreview(null);
    }
  }, [eventCreated, setEvent, event.slug]);

  return (
    <form onSubmit={handleSubmit} className="create-event-form">
      <div className="form-group">
        <label htmlFor="title">Názov Eventu</label>
        <input
          id="title"
          type="text"
          value={event.title}
          onChange={(e) => {
            const title = e.target.value;
            setEvent({
              ...event,
              title,
              // Pri editácii ponechať existujúci slug, inak vytvoriť nový
              slug: isEdit ? event.slug : createSlug(title),
            });
          }}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Popis</label>
        <textarea
          id="description"
          value={event.description}
          onChange={(e) => setEvent({ ...event, description: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label htmlFor="location">Miesto</label>
        <input
          id="location"
          type="text"
          value={event.location}
          onChange={(e) => setEvent({ ...event, location: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label htmlFor="datetime">Dátum</label>
        <input
          id="datetime"
          type="datetime-local"
          value={event.date}
          onChange={(e) => setEvent({ ...event, date: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label>Vybrané kategórie:</label>
        <div className="selected-categories">
          {Array.isArray(event.categories) &&
            event.categories.map((id) => {
              const category = categoryList.find((cat) => cat._id === id);
              return (
                <div className="selected-category" key={id}>
                  {category?.name || "Neznáma kategória"}
                  <button
                    type="button"
                    onClick={() => handleRemoveCategory(id)}
                  >
                    ✕
                  </button>
                </div>
              );
            })}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="category-dropdown">Pridať kategóriu</label>
        <select
          id="category-dropdown"
          onChange={handleCategorySelect}
          className="select-category"
        >
          <option value="">-- Vyber kategórie --</option>
          {categoryList.length > 0 &&
            categoryList.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="images">Obrázok</label>

        <div className="file-upload-container">
          <div className="file-input-wrapper">
            <label htmlFor="images" className="file-input-label">
              <FaImage className="file-input-icon" />
              <input
                id="images"
                type="file"
                accept="image/*"
                onChange={handleFileChangeWithPreview}
                className="file-input"
              />
            </label>

            {imagePreview && (
              <div className="image-preview-container">
                <img
                  src={imagePreview}
                  alt="Náhľad obrázka"
                  className="image-preview"
                />
                <button
                  type="button"
                  className="remove-image-btn"
                  onClick={removeImage}
                  aria-label="Odstrániť obrázok"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit">
          {isEdit ? "Aktualizovať Event" : "Vytvoriť Event"}
        </button>
      </div>
      {validateError && (
        <div className="error-container">
          <p className="error-message">{validateError}</p>
        </div>
      )}
      {creationError && (
        <div className="error-container">
          <p className="error-message">{creationError}</p>
        </div>
      )}
      {eventCreated && (
        <div className="confirm-container">
          <p className="confirm-message">Event úspešne vytvorený!</p>
          <Link to={`/event/${event.slug}`}>Zobraziť event</Link>
        </div>
      )}
    </form>
  );
};

export default CreateEventForm;
