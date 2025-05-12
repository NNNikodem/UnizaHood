import React, { useState, useEffect } from "react";
import { FaUsers, FaCalendarAlt, FaComments, FaCog } from "react-icons/fa";
import ImageModal from "../components/common/ImageModal";
import { useNavigate } from "react-router-dom";

// Komponenty pre jednotlivé admin sekcie
import UsersAdmin from "../components/admin/UsersAdmin";
import EventsAdmin from "../components/admin/EventsAdmin";
import CommentsAdmin from "../components/admin/CommentsAdmin";
import SettingsAdmin from "../components/admin/SettingsAdmin";

// Importujeme štýly
import "../CSS/Admin/AdminStyles.css";

const AdminPage = ({ isAdmin }) => {
  const [activeSection, setActiveSection] = useState("users");
  const [selectedImage, setSelectedImage] = useState(null);
  const navigate = useNavigate();
  const handleRedirect = (path) => {
    navigate(path);
  };
  // Konfigurácia navigačných položiek
  const navItems = [
    {
      id: "users",
      label: "Používatelia",
      icon: <FaUsers />,
      component: <UsersAdmin showImage={setSelectedImage} />,
    },
    {
      id: "events",
      label: "Udalosti",
      icon: <FaCalendarAlt />,
      component: <EventsAdmin showImage={setSelectedImage} />,
    },
    {
      id: "comments",
      label: "Komentáre",
      icon: <FaComments />,
      component: <CommentsAdmin showImage={setSelectedImage} />,
    },
  ];

  // Získanie aktuálneho komponentu podľa aktívnej sekcie
  const getCurrentComponent = () => {
    const item = navItems.find((item) => item.id === activeSection);
    return item ? item.component : null;
  };

  useEffect(() => {
    if (!isAdmin) {
      handleRedirect("/not-found");
    }
  }, [isAdmin]);

  return (
    isAdmin && (
      <div className="admin-layout">
        <div className="admin-sidebar">
          <h2 className="admin-title">Admin Panel</h2>
          <div className="admin-divider"></div>
          <ul className="admin-nav">
            {navItems.map((item) => (
              <li
                key={item.id}
                className={`admin-nav-item ${
                  activeSection === item.id ? "active" : ""
                }`}
                onClick={() => setActiveSection(item.id)}
                data-label={item.label} // Pridaný atribút pre tooltip
              >
                <span className="admin-nav-icon">{item.icon}</span>
                <span className="admin-nav-label">{item.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="admin-content">
          <h2 className="admin-section-title">
            {navItems.find((item) => item.id === activeSection)?.label}
          </h2>
          <div className="admin-divider"></div>
          <div className="admin-section-content">{getCurrentComponent()}</div>
        </div>
        {selectedImage && (
          <ImageModal
            imageUrl={selectedImage}
            alt="Zväčšený obrázok"
            onClose={() => setSelectedImage(null)}
          />
        )}
      </div>
    )
  );
};

export default AdminPage;
