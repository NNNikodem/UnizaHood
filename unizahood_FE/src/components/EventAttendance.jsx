import React from "react";
import { FaUsers, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { Link } from "react-router-dom";

/**
 * Komponent pre zobrazenie sekcie účasti na udalosti
 * @param {Object} props
 * @param {number} props.goingCount - Počet ľudí, ktorí sa zúčastnia
 * @param {boolean} props.isGoing - Či sa aktuálny používateľ zúčastní
 * @param {Object} props.user - Aktuálny prihlásený používateľ
 * @param {boolean} props.updating - Stav načítavania počas API volaní
 * @param {Function} props.onAddGoingTo - Handler pre pridanie účasti
 * @param {Function} props.onRemoveGoingTo - Handler pre odstránenie účasti
 */
const EventAttendance = ({
  goingCount,
  isGoing,
  user,
  updating,
  onAddGoingTo,
  onRemoveGoingTo,
  error,
}) => {
  return (
    <div className="event-attendance-section">
      <div className="event-attendance-count">
        <FaUsers className="attendance-icon" />
        <span>{goingCount}</span>
      </div>

      {user ? (
        <div className="event-attendance-buttons">
          {isGoing ? (
            <button
              onClick={onRemoveGoingTo}
              className="attendance-button remove-attendance"
              disabled={updating}
            >
              <FaTimesCircle /> Nezúčastním sa
            </button>
          ) : (
            <button
              onClick={onAddGoingTo}
              className="attendance-button add-attendance"
              disabled={updating}
            >
              <FaCheckCircle /> Zúčastním sa
            </button>
          )}
        </div>
      ) : (
        <div className="event-attendance-login">
          <Link to="/login" className="attendance-login-link">
            Prihláste sa, ak sa chcete zúčastniť
          </Link>
        </div>
      )}
      {error && <div className="attendance-error">{error}</div>}
    </div>
  );
};

export default EventAttendance;
