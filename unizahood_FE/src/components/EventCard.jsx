import React from "react";
import { Link } from "react-router-dom";
import { FaCalendarAlt, FaMapMarkerAlt, FaClock } from "react-icons/fa";
import "../CSS/EventCard.css";

const EventCard = ({ event }) => {
  // Formátovanie dátumu
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("sk-SK", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch (e) {
      return dateString || "Neznámy dátum";
    }
  };

  return (
    <div className="event-card">
      <div className="event-card-image">
        {event.imagesUrl.length > 0 ? (
          <img
            src={`http://localhost:5000${event.imagesUrl}`}
            alt={event.title}
          />
        ) : (
          <div className="event-card-no-image">
            <FaCalendarAlt />
          </div>
        )}
        <div className="event-card-date">
          <FaCalendarAlt /> {formatDate(event.date)}
        </div>
      </div>

      <div className="event-card-content">
        <h2 className="event-card-title">{event.title}</h2>

        <div className="event-card-categories">
          {event.categories &&
            event.categories.map((category, index) => (
              <span key={index} className="event-category">
                {category.name}
              </span>
            ))}
        </div>

        {event.location && (
          <div className="event-card-location">
            <FaMapMarkerAlt /> {event.location}
          </div>
        )}

        <div className="event-card-footer">
          <Link to={`/event/${event.slug}`} className="event-details-button">
            Zobraziť detail
          </Link>
          {event.creator && (
            <div className="event-creator">
              {event.creator.photo ? (
                <img
                  src={`http://localhost:5000${event.creator.photo}`}
                  alt={event.creator.username}
                  className="creator-avatar"
                />
              ) : null}
              <span>{event.creator.username || "Neznámy organizátor"}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
