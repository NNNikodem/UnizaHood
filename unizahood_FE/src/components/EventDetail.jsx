import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { sk } from "date-fns/locale";
import Carousel from "./Carousel";
import { useApi } from "../Hooks/useApi";
import "../CSS/EventDetail.css";
import {
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaUsers,
} from "react-icons/fa";

const EventDetail = ({ event }) => {
  const [mainImages, setMainImages] = useState([]);
  const { get } = useApi();

  const fetchMainImages = async () => {
    try {
      const { success, data, error } = await get(`/upload/${event._id}/main`);
      if (success) {
        setMainImages(data.images);
      } else {
        console.error("Nastala chyba pri získavaní obrázkov.", error);
      }
    } catch (error) {
      console.error("Chyba pri načítaní obrázkov:", error);
    }
  };

  useEffect(() => {
    if (!event) {
      console.error("Žiadne údaje o evente neboli poskytnuté.");
      return;
    }
    fetchMainImages();
  }, [event]);

  // Format date and time
  const eventDate = new Date(event.date);
  const formattedDate = format(eventDate, "d. MMMM yyyy", { locale: sk });
  const formattedTime = format(eventDate, "HH:mm", { locale: sk });

  return (
    <div className="event-detail-container">
      <div className="event-detail-card">
        <div className="event-detail-header">
          <h1 className="event-title">{event.title}</h1>

          <div className="event-meta">
            <div className="event-meta-item">
              <FaCalendarAlt className="event-meta-icon" />
              <span>{formattedDate}</span>
            </div>

            <div className="event-meta-item">
              <FaClock className="event-meta-icon" />
              <span>{formattedTime}</span>
            </div>

            <div className="event-meta-item">
              <FaMapMarkerAlt className="event-meta-icon" />
              <span>{event.location}</span>
            </div>

            {event.attendees && (
              <div className="event-meta-item">
                <FaUsers className="event-meta-icon" />
                <span>{event.attendees.length} účastníkov</span>
              </div>
            )}
          </div>
        </div>

        <div className="event-carousel-container">
          {mainImages && mainImages.length > 0 ? (
            <Carousel images={mainImages} />
          ) : (
            <div className="event-no-images">
              <p>Pre tento event nie sú dostupné žiadne obrázky.</p>
            </div>
          )}
        </div>

        <div className="event-description">
          <h2>O evente</h2>
          <p>{event.description}</p>
        </div>

        {event.categories && event.categories.length > 0 && (
          <div className="event-categories">
            {event.categories.map((category) => (
              <span key={category._id} className="event-category-tag">
                {category.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetail;
