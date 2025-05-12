import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaTags, FaTag } from "react-icons/fa";

const EventsSidebar = ({ categories, selectedCategory }) => {
  // Získame aktuálnu cestu, aby sme vedeli presne určiť, kedy sme na /events
  const location = useLocation();
  const isAllEventsPage = location.pathname === "/events";

  return (
    <div className="events-sidebar">
      <h3 className="sidebar-title">Kategórie eventov</h3>
      <ul className="category-list">
        <li className={`category-item ${isAllEventsPage ? "active" : ""}`}>
          <Link to="/events" className={isAllEventsPage ? "text-white" : ""}>
            <FaTags className="category-icon" /> Všetky eventy
          </Link>
        </li>
        {categories &&
          categories.map((category) => (
            <li
              key={category._id}
              className={`category-item ${
                selectedCategory === category.name ? "active" : ""
              }`}
            >
              <Link
                to={`/events/category/${category.name}`}
                className={
                  selectedCategory === category.name ? "text-white" : ""
                }
              >
                <FaTag className="category-icon" /> {category.name}
              </Link>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default EventsSidebar;
