import React, { useState, useEffect } from "react";
import { FaImage } from "react-icons/fa";
import "../CSS/CreateCommentForm.css";
import { useApi } from "../Hooks/useApi";
import { useUpload } from "../Hooks/useUpload";

const CreateCommentForm = ({ eventId, fetchComments }) => {
  const MAX_FILE_SIZE_MB = 5;
  const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;
  const [comment, setComment] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [confirmationMessage, setConfirmationMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const { post } = useApi();
  const { postImages } = useUpload();

  // Efekt pre vyčistenie objektových URL pri odmontovaní komponentu
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      // Ak existuje predchádzajúci náhľad, uvoľníme jeho URL
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }

      // Nastavenie obrázka a vytvorenie náhľadu
      setImage(selectedFile);
      setImagePreview(URL.createObjectURL(selectedFile));
    }
  };

  const removeImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImage(null);
    setImagePreview(null);
  };

  const validateSubmit = () => {
    if (!comment.trim()) {
      setValidationError("Komentár nemôže byť prázdny");
      return false;
    }
    if (image && image.size > MAX_FILE_SIZE) {
      setValidationError(`Maximálna veľkosť súboru je ${MAX_FILE_SIZE_MB} MB`);
      return false;
    }
    if (
      image &&
      !["image/jpeg", "image/png", "image/gif", "image/jfif"].includes(
        image.type
      )
    ) {
      setValidationError("Nepodporovaný formát súboru");
      return false;
    }
    setValidationError(null);
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Clear previous messages
    setConfirmationMessage(null);
    setErrorMessage(null);
    // Validate the form
    if (!validateSubmit()) {
      return;
    }

    try {
      // 1: Odoslať komentár
      const commentData = await post(`/comments/${eventId}`, {
        text: comment,
      });
      const commentId = commentData.data._id;

      // 2: Uploadni obrázok (ak existuje)
      if (image && commentId) {
        await postImages(`/${eventId}/comment/${commentId}`, image);
      }

      // Resetni form po úspešnom odoslaní
      setComment("");
      setImage(null);
      e.target.reset();

      // Po úspešnom odoslaní vyčistíme aj náhľad
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
        setImagePreview(null);
      }
      // Zavolaj funkciu na načítanie komentárov
      fetchComments();

      // Potrvrdenie úspešného odoslania
      setConfirmationMessage("Komentár bol úspešne pridaný");
      // Potvrdenie správy zmizne po 3 sekundách
      setTimeout(() => {
        setConfirmationMessage(null);
      }, 3000);
    } catch (error) {
      console.error("Chyba pri vytváraní komentára:", error);
      setErrorMessage(
        "Nastala chyba pri pridávaní komentára: " + error.message
      );
    }
  };

  return (
    <>
      <div className="create-comment-form-container">
        <form className="create-comment-form" onSubmit={handleSubmit}>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onInput={(e) => {
              e.target.style.height = "auto";
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            placeholder="Napíš komentár..."
          />

          <div className="comment-form-actions">
            <div className="file-input-wrapper">
              {imagePreview && (
                <div className="image-preview-container">
                  <img
                    src={imagePreview}
                    alt="Náhľad obrázka"
                    className="comment-image-preview"
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
              <label className="file-input-label">
                <FaImage className="file-input-icon" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="file-input"
                />
              </label>
            </div>

            <button type="submit" className="submit-comment-btn">
              Pridať Komentár
            </button>
          </div>
        </form>

        {validationError && (
          <div className="error-container">
            <p className="error-message">{validationError}</p>
          </div>
        )}
        {errorMessage && (
          <div className="error-container">
            <p className="error-message">{errorMessage}</p>
          </div>
        )}
        {confirmationMessage && (
          <div className="confirm-container">
            <p className="confirm-message">{confirmationMessage}</p>
          </div>
        )}
      </div>
    </>
  );
};

export default CreateCommentForm;
