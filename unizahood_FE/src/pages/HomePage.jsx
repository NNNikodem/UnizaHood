import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import EventCard from "../components/EventCard";
import { useApi } from "../Hooks/useApi";
import { useAuthContext } from "../Hooks/useAuthContext";
import CategoryBadge from "../components/CategoryBadge";
import { formatTimeAgo } from "../utils/dateUtils";

const HomePage = () => {
  const { get } = useApi();
  const { user } = useAuthContext();
  const [events, setEvents] = useState([]);
  const [featuredEvent, setFeaturedEvent] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Načítanie udalostí
        const eventsRes = await get("/events");
        if (eventsRes.success) {
          setEvents(eventsRes.data);

          // Nastavenie featured eventu (najbližší s najviac účastníkmi)
          if (eventsRes.data.length > 0) {
            // Najprv odfiltrujeme len budúce eventy
            const todayDate = new Date();
            todayDate.setHours(0, 0, 0, 0);

            const upcomingEvents = eventsRes.data.filter((event) => {
              const eventDate = new Date(event.date);
              return eventDate >= todayDate;
            });

            if (upcomingEvents.length > 0) {
              // Z budúcich eventov nájdeme ten s najvyšším goingToCount
              const featured = [...upcomingEvents].sort(
                (a, b) => (b.goingToCount || 0) - (a.goingToCount || 0)
              )[0];

              setFeaturedEvent(featured);
            } else {
              // Ak nie sú žiadne budúce eventy, nenastavíme featured event
              setFeaturedEvent(null);
            }
          }
        }

        // Načítanie kategórií
        const categoriesRes = await get("/categories");
        if (categoriesRes.success) {
          setCategories(categoriesRes.data);
        }
      } catch (error) {
        console.error("Chyba pri načítaní údajov:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrovanie nadchádzajúcich udalostí (dátum > dnes)
  const upcomingEvents = events
    .filter((event) => {
      const eventDate = new Date(event.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return eventDate >= today;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (loading) {
    return <div className="loading">Načítavam...</div>;
  }

  return (
    <div className="home-page">
      {/* Hero sekcia */}
      <section className="title-section">
        <h1 className="page-title">Vitaj na UnizaHood</h1>
      </section>
      {/* HLavna Udalost */}
      <section className="main-event">
        <div className="section-header">
          <h2>Hlavná udalosť</h2>
        </div>
        <div className="featured-event">
          {featuredEvent && <EventCard event={featuredEvent} featured={true} />}
        </div>
      </section>

      {/* Nadchádzajúce udalosti */}
      <section className="upcoming-events">
        <div className="section-header">
          <h2>Nadchádzajúce udalosti</h2>
        </div>

        <div className="events-grid">
          {upcomingEvents.length > 0 ? (
            upcomingEvents
              .slice(0, 4)
              .map((event) => <EventCard key={event._id} event={event} />)
          ) : (
            <p className="empty-message">
              Momentálne nie sú žiadne nadchádzajúce udalosti
            </p>
          )}
        </div>
      </section>

      {/* Kategórie */}
      <section className="-categories">
        <div className="section-header">
          <h2>Kategórie</h2>
        </div>
        <div className="categories-grid">
          {categories.map((category) => (
            <CategoryBadge category={category.name} clickable />
          ))}
        </div>
      </section>

      {/* Výzva na registráciu pre neregistrovaných */}
      {!user && (
        <section className="signup-cta">
          <div className="cta-content">
            <h2>Pripojte sa k našej komunite</h2>
            <p>
              Vytvárajte vlastné udalosti, pridávajte komentáre a zúčastňujte sa
              akcií
            </p>
            <div className="cta-buttons">
              <Link to="/register" className="btn primary">
                Registrovať sa
              </Link>
              <Link to="/login" className="btn secondary">
                Prihlásiť sa
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
