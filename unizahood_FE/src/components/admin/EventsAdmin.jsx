import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaTrash,
  FaEdit,
  FaSearch,
  FaExclamationTriangle,
  FaCalendarPlus,
} from "react-icons/fa";
import { useApi } from "../../Hooks/useApi";
import Pagination from "../common/Pagination";

const EventsAdmin = ({ showImage }) => {
  const navigate = useNavigate(); // Hook pre navigáciu
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  // Používame existujúci API hook
  const { get, del, loading: apiLoading, error: apiError } = useApi();

  useEffect(() => {
    const fetchEvents = async () => {
      setLocalLoading(true);
      try {
        const response = await get("/events");

        if (response.success) {
          if (Array.isArray(response.data)) {
            setEvents(response.data);
            setLocalError(null);
          } else {
            console.error("API vrátilo nesprávny formát dát:", response.data);
            setLocalError("Zo servera bol prijatý neplatný formát údajov");
            setEvents([]);
          }
        } else {
          console.error("Chyba pri načítaní udalostí:", response.error);
          setLocalError("Načítanie udalostí zlyhalo. Skúste to prosím neskôr.");
          setMockData();
        }
      } catch (error) {
        console.error("Výnimka pri načítaní udalostí:", error);
        setLocalError("Vyskytla sa neočakávaná chyba");
        return <p className="empty-text">Žiadne udalosti</p>;
      } finally {
        setLocalLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Reset stránky pri zmene searchTerm
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredEvents = Array.isArray(events)
    ? events.filter(
        (event) =>
          (event.title || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (event.createdBy?.username || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (event.location || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      )
    : [];

  // Výpočet celkového počtu stránok
  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);

  // Získanie udalostí pre aktuálnu stránku
  const currentEvents = filteredEvents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm("Naozaj chcete odstrániť túto udalosť?")) {
      const response = await del(`/events/${eventId}`);
      if (response.success) {
        setEvents(events.filter((event) => event._id !== eventId));
      }
    }
  };

  // Formátovanie dátumu
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("sk-SK");
    } catch (e) {
      return dateString;
    }
  };

  // Určenie stavu udalosti na základe dátumu
  const getEventStatus = (dateString) => {
    try {
      const eventDate = new Date(dateString);
      const today = new Date();

      // Resetujeme čas na začiatok dňa pre spravodlivé porovnanie
      today.setHours(0, 0, 0, 0);

      if (eventDate < today) {
        return "completed";
      } else {
        return "upcoming";
      }
    } catch (e) {
      return "unknown";
    }
  };

  // Používame lokálny alebo API stav načítavania
  const isLoading = localLoading || apiLoading;
  // Používame lokálnu alebo API chybu
  const errorMessage = localError || apiError;

  // Zobrazenie obrázka
  const handleShowImage = (imagePath) => {
    if (imagePath) {
      showImage(`http://localhost:5000${imagePath}`);
    }
  };

  // Nová funkcia pre presmerovanie na úpravu eventu
  const handleEditEvent = (slug) => {
    navigate(`/event/edit/${slug}`);
  };

  // Prípadne môžete pridať aj funkciu pre pridanie nového eventu
  const handleAddEvent = () => {
    navigate("/create-event");
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Vyhľadať udalosti..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <button className="admin-button primary" onClick={handleAddEvent}>
          <FaCalendarPlus className="button-icon" /> Pridať udalosť
        </button>
      </div>

      {errorMessage && (
        <div className="admin-alert error">
          <FaExclamationTriangle /> {errorMessage}
        </div>
      )}

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Autor</th>
              <th>Názov</th>
              <th>Náhľad</th>
              <th>Dátum</th>
              <th>Miesto</th>
              <th>Stav</th>
              <th>Akcie</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="center-text">
                  Načítavam...
                </td>
              </tr>
            ) : currentEvents.length === 0 ? (
              <tr>
                <td colSpan={7} className="center-text">
                  Žiadne udalosti neboli nájdené
                </td>
              </tr>
            ) : (
              currentEvents.map((event) => {
                const eventStatus = getEventStatus(event.date);

                return (
                  <tr key={event._id}>
                    <td>
                      <div className="author-cell">
                        {event.createdBy?.photo && (
                          <img
                            src={`http://localhost:5000${event.createdBy.photo}`}
                            alt={event.creator?.username}
                            className="author-avatar"
                            onClick={() => handleShowImage(event.creator.photo)}
                          />
                        )}
                        <span>
                          {event.createdBy?.username || "Neznámy autor"}
                        </span>
                      </div>
                    </td>
                    <td>
                      <Link to={`/event/${event.slug}`}>{event.title}</Link>
                    </td>
                    <td>
                      {event.imagesUrl.length > 0 ? (
                        <div className="event-image-container">
                          <img
                            src={`http://localhost:5000${event.imagesUrl[0]}`}
                            alt={event.title}
                            className="event-image-thumbnail"
                            onClick={() => handleShowImage(event.imagesUrl[0])}
                          />
                        </div>
                      ) : (
                        <span className="no-image">Bez obrázka</span>
                      )}
                    </td>
                    <td>{formatDate(event.date)}</td>
                    <td>{event.location}</td>
                    <td>
                      <span className={`event-status ${eventStatus}`}>
                        {eventStatus === "completed"
                          ? "Ukončená"
                          : "Pripravovaná"}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="icon-button primary"
                          onClick={() => handleEditEvent(event.slug)}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="icon-button danger"
                          onClick={() => handleDeleteEvent(event._id)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {!isLoading && filteredEvents.length > ITEMS_PER_PAGE && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default EventsAdmin;
