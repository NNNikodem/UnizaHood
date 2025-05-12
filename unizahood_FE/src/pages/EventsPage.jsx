import { useApi } from "../Hooks/useApi";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import HttpError from "../utils/HttpError";
import EventCard from "../components/EventCard";
import EventsSidebar from "../components/EventsSidebar";
import "../CSS/EventsPage.css";
import { FaSearch, FaCalendarAlt, FaExclamationTriangle } from "react-icons/fa";
import Pagination from "../components/common/Pagination";

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { categoryName } = useParams();
  const [categoryId, setCategoryId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { get, error, loading } = useApi();
  //pagination
  const [currentPage, setCurrentPage] = useState(1);
  const EVENTS_PER_PAGE = 6;

  const fetchCategories = async () => {
    const response = await get("/categories");

    // Ak nie je kategória špecifikovaná v URL, vynulujeme stavy
    if (!categoryName) {
      setCategoryId(null);
      setSelectedCategory(null);
    } else {
      // Inak nájdeme a nastavíme vybranú kategóriu
      const category = response.data.find(
        (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
      );
      if (category) {
        setCategoryId(category._id);
        setSelectedCategory(category.name);
      } else {
        throw new HttpError(404, `Kategória ${categoryName} neexistuje`);
      }
    }
    setCategories(response.data);
  };

  const fetchEvents = async () => {
    const { success, data, error } = await get("/events");
    if (success) {
      setEvents(data);
      setCurrentPage(1); // strankovanie na 1
    } else {
      console.error("Chyba pri načítaní eventov:", error);
    }
  };

  const fetchEventsByCategory = async () => {
    const response = await get(`/events/category/${categoryId}`);
    if (response.success) {
      const data = response.data;
      setEvents(data);
      setCurrentPage(1); // strankovanie na 1
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // strankovanie na 1
  };

  const filteredEvents = events.filter(
    (event) =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.description &&
        event.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (event.location &&
        event.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Strankovanie
  const indexOfLastEvent = currentPage * EVENTS_PER_PAGE;
  const indexOfFirstEvent = indexOfLastEvent - EVENTS_PER_PAGE;

  const currentEvents = filteredEvents.slice(
    indexOfFirstEvent,
    indexOfLastEvent
  );
  const totalPages = Math.ceil(filteredEvents.length / EVENTS_PER_PAGE);

  // Handler pre zmenu stránky
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll na vrch stránky pre lepšiu UX
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  useEffect(() => {
    fetchCategories();
    // Ak nemáme kategóriu, načítame všetky eventy
    if (!categoryName) {
      fetchEvents();
    }
  }, [categoryName]);

  useEffect(() => {
    if (categoryId) {
      fetchEventsByCategory();
    }
  }, [categoryId]);

  return (
    <div className="events-page-container">
      <div className="events-sidebar-container">
        <EventsSidebar
          categories={categories}
          selectedCategory={selectedCategory}
        />
      </div>

      <div className="events-main-content">
        <div className="events-header">
          <h1 className="page-title">
            {selectedCategory
              ? `Eventy - ${selectedCategory}`
              : "Všetky Eventy"}
          </h1>

          <div className="events-search-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Vyhľadať udalosti..."
              value={searchTerm}
              onChange={handleSearch}
              className="events-search-input"
            />
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Načítavanie eventov...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <FaExclamationTriangle className="error-icon" />
            <p className="error-message">{error}</p>
          </div>
        ) : filteredEvents.length > 0 ? (
          <>
            <div className="events-grid">
              {currentEvents.map((event) => (
                <div className="event-card-wrapper" key={event._id}>
                  <EventCard event={event} />
                </div>
              ))}
            </div>

            {/* Zobrazenie paginácie len ak je viac ako 1 stránka */}
            {totalPages > 1 && (
              <div className="events-pagination">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        ) : (
          <div className="no-events-container">
            <FaCalendarAlt className="no-events-icon" />
            <p>Nenašli sa žiadne eventy</p>
            {searchTerm && (
              <p className="no-events-search-hint">
                Skúste upraviť vyhľadávanie alebo zvoliť inú kategóriu
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
