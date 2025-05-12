import React, { useEffect } from "react";
import "../../CSS/ImageModal.css";

const ImageModal = ({ imageUrl, alt, onClose }) => {
  // Pridanie obsluhy klávesy Escape na zatvorenie modálneho okna
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    // Zablokovanie scrollovania na pozadí
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      // Obnovenie scrollovania
      document.body.style.overflow = "auto";
    };
  }, [onClose]);

  return (
    <div className="image-modal-overlay" onClick={onClose}>
      <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="image-modal-close" onClick={onClose}>
          ×
        </button>
        <img src={imageUrl} alt={alt} className="image-modal-image" />
      </div>
    </div>
  );
};

export default ImageModal;
