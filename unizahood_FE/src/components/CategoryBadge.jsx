import React from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
  FaGraduationCap,
  FaMusic,
  FaHouseUser,
  FaFilm,
  FaGlassCheers,
  FaChalkboardTeacher,
  FaTrophy,
  FaUserGraduate,
  FaLaugh,
  FaExchangeAlt,
  FaRunning,
  FaInfoCircle,
  FaEllipsisH,
} from "react-icons/fa";
import "../CSS/CategoryBadge.css";

/**
 * Komponent pre zobrazenie vizuálneho odznaku kategórie
 * @param {Object} props
 * @param {string} props.category - Názov kategórie
 * @param {string} props.size - Veľkosť odznaku ('small', 'medium', 'large')
 * @param {boolean} props.clickable - Či je odznak klikateľný
 * @param {Function} props.onClick - Handler pre kliknutie (voliteľné)
 */
const CategoryBadge = ({
  category,
  size = "medium",
  clickable = false,
  onClick,
}) => {
  const navigate = useNavigate();
  // Funkcia pre výber ikony na základe kategórie
  const getCategoryIcon = (categoryName) => {
    const name = categoryName.toLowerCase();

    if (name.includes("internát")) {
      return <FaHouseUser />;
    } else if (name.includes("film")) {
      return <FaFilm />;
    } else if (name.includes("hudba") || name.includes("koncert")) {
      return <FaMusic />;
    } else if (name.includes("festival")) {
      return <FaGlassCheers />;
    } else if (name.includes("prednáška")) {
      return <FaGraduationCap />;
    } else if (name.includes("workshop")) {
      return <FaChalkboardTeacher />;
    } else if (name.includes("súťaž")) {
      return <FaTrophy />;
    } else if (name.includes("študent")) {
      return <FaUserGraduate />;
    } else if (name.includes("zábava")) {
      return <FaLaugh />;
    } else if (name.includes("burza")) {
      return <FaExchangeAlt />;
    } else if (name.includes("šport")) {
      return <FaRunning />;
    } else if (name.includes("informáci")) {
      return <FaInfoCircle />;
    } else {
      return <FaEllipsisH />;
    }
  };

  // Funkcia pre generovanie CSS triedy na základe kategórie
  const getCategoryClass = (categoryName) => {
    const name = categoryName.toLowerCase();

    if (name.includes("prednáška") || name.includes("informáci")) {
      return "education";
    } else if (name.includes("šport") || name.includes("súťaž")) {
      return "sports";
    } else if (
      name.includes("hudba") ||
      name.includes("koncert") ||
      name.includes("festival")
    ) {
      return "music";
    } else if (name.includes("film") || name.includes("umenie")) {
      return "arts";
    } else if (name.includes("workshop")) {
      return "workshop";
    } else if (name.includes("zábava") || name.includes("študent")) {
      return "social";
    } else if (name.includes("internát")) {
      return "dorms";
    } else if (name.includes("burza")) {
      return "market";
    } else {
      return "other";
    }
  };

  const handleClick = () => {
    if (clickable) {
      navigate(`/events/category/${category}`);
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }
  };

  return (
    <div
      className={`category-badge ${getCategoryClass(category)} ${size} ${
        clickable ? "clickable" : ""
      }`}
      onClick={handleClick}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      <span className="category-icon">{getCategoryIcon(category)}</span>
      <span className="category-name">{category}</span>
    </div>
  );
};

export default CategoryBadge;
