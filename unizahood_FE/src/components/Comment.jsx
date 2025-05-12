import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { sk } from "date-fns/locale";
import { useAuthContext } from "../Hooks/useAuthContext";
import ImageModal from "../components/common/ImageModal";
import "../CSS/Comment.css";

const Comment = ({ comment, onDelete, isAdmin }) => {
  const { user } = useAuthContext();
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // Kontrola či aktuálny používateľ môže vymazať komentár
  const canDelete = user && (user.id === comment.author?._id || isAdmin);

  // Formátovanie času
  const formattedTime = comment.createdAt
    ? formatDistanceToNow(new Date(comment.createdAt), {
        addSuffix: true,
        locale: sk,
      })
    : "";

  const openImageModal = () => {
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
  };

  return (
    <div className="comment">
      <div className="comment-user">
        <img
          src={`http://localhost:5000${comment.author?.photo}`}
          alt={comment.author?.username || "Používateľ"}
          className="comment-avatar"
        />
        <span className="comment-username">
          {comment.author?.username || "Používateľ"}
        </span>
      </div>

      <div className="comment-content">
        <div className="comment-meta">
          <span className="comment-time">{formattedTime}</span>
        </div>
        <p className="comment-text">{comment.text}</p>
      </div>

      {comment.imageUrl && (
        <div className="comment-image-wrapper">
          <img
            src={`http://localhost:5000${comment.imageUrl}`}
            alt="Priložený obrázok"
            className="comment-image"
            onClick={openImageModal}
            style={{ cursor: "pointer" }}
            title="Kliknutím zobrazíte v plnej veľkosti"
          />
        </div>
      )}

      {canDelete && (
        <button
          className="comment-delete-btn"
          onClick={() => onDelete(comment._id)}
          aria-label="Vymazať komentár"
        >
          <span className="delete-icon">×</span>
          <span className="delete-text">Vymazať</span>
        </button>
      )}

      {isImageModalOpen && comment.imageUrl && (
        <ImageModal
          imageUrl={`http://localhost:5000${comment.imageUrl}`}
          alt="Obrázok v plnej veľkosti"
          onClose={closeImageModal}
        />
      )}
    </div>
  );
};

export default Comment;
