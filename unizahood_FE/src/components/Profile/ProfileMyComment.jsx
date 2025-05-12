import React from "react";
import { formatDistanceToNow } from "date-fns";
import { sk } from "date-fns/locale";
import { Link } from "react-router-dom";
import "../../CSS/Profile/ProfileMyComment.css";

/**
 * Komponent pre zobrazenie komentára v profile používateľa
 * @param {Object} comment - Objekt komentára
 * @param {Function} onDelete - Callback funkcia pre vymazanie komentára (voliteľná)
 */
const ProfileMyComment = ({ comment, onDelete }) => {
  // Formátovanie času
  const formattedTime = comment.createdAt
    ? formatDistanceToNow(new Date(comment.createdAt), {
        addSuffix: true,
        locale: sk,
      })
    : "";

  return (
    <div className="profile-comment-card">
      <div className="profile-comment-header">
        <h3 className="profile-comment-title">
          <Link
            to={`/event/${comment.event?.slug}`}
            className="profile-comment-link"
          >
            {comment.event?.title || "Neznámy event"}
          </Link>
        </h3>
        <span className="profile-comment-date">{formattedTime}</span>
      </div>
      <p className="profile-comment-text">{comment.text}</p>
      {comment.imageUrl && (
        <div className="profile-comment-image-container">
          <img
            src={`http://localhost:5000${comment.imageUrl}`}
            alt="Priložený obrázok"
            className="profile-comment-image"
          />
        </div>
      )}

      {onDelete && (
        <button
          className="profile-delete-comment-btn"
          onClick={() => onDelete(comment._id)}
          aria-label="Vymazať komentár"
        >
          Vymazať
        </button>
      )}
    </div>
  );
};

export default ProfileMyComment;
