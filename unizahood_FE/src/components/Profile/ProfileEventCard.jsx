import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../CSS/Profile/ProfileEventCard.css";

const ProfileEventCard = ({ event, onDelete }) => {
  const navigate = useNavigate();

  const handleEditClick = () => {
    navigate(`/event/edit/${event.slug}`);
  };

  return (
    <div className="profile-event-card">
      {event.imagesUrl ? (
        <div className="profile-event-image-container">
          <img
            src={`http://localhost:5000${event.imagesUrl}`}
            alt={event.title}
            className="profile-event-image"
          />
        </div>
      ) : (
        <div className="profile-event-image-placeholder">
          <span>Bez obrázku</span>
        </div>
      )}

      <div className="profile-event-content">
        <Link to={`/event/${event.slug}`} className="profile-event-title">
          {event.title}
        </Link>

        <div className="profile-event-details">
          <div className="profile-event-date">
            <span className="icon">📅</span>
            {new Date(event.date).toLocaleDateString()}
          </div>

          <div className="profile-event-location">
            <span className="icon">📍</span>
            {event.location}
          </div>
        </div>

        {onDelete && (
          <div className="profile-event-actions">
            <button
              className="edit-button"
              onClick={handleEditClick}
              aria-label="Upraviť event"
            >
              Upraviť
            </button>
            <button
              className="delete-button"
              onClick={() => onDelete(event._id)}
              aria-label="Vymazať event"
            >
              Vymazať
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileEventCard;
