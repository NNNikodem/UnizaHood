import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import EventDetail from "../components/EventDetail";
import CreateCommentForm from "../components/CreateCommentForm";
import { useAuthContext } from "../Hooks/useAuthContext";
import { useApi } from "../Hooks/useApi";
import Pagination from "../components/common/Pagination";
import Comment from "../components/Comment";
import { Link } from "react-router-dom";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaUsers,
  FaLock,
  FaComments,
} from "react-icons/fa";

import "../CSS/EventDetailPage.css";
import EventAttendance from "../components/EventAttendance";

const EventDetailPage = ({ isAdmin }) => {
  const { slug } = useParams();
  const [event, setEvent] = useState(null);
  const { user } = useAuthContext();
  const { get, del, put } = useApi();
  const [comments, setComments] = useState([]);
  const [commentPage, setCommentPage] = useState(1);
  const [isGoing, setIsGoing] = useState(false);
  const [goingCount, setGoingCount] = useState(0);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const COMMENTS_PER_PAGE = 10;

  const fetchEvent = async () => {
    try {
      const { success, data, error } = await get(`/events/slug/${slug}`);
      if (success) {
        setEvent(data);
        // Inicializácia počtu užívateľov, ktorí sa zúčastnia (ak existuje)
        if (data.goingToCount) {
          setGoingCount(data.goingToCount);
        }
      } else {
        console.error("Nastala chyba pri načítaní eventu.", error);
      }
    } catch (error) {
      console.error("Chyba pri načítaní eventu:", error);
    }
  };

  // Kontrola, či je používateľ na zozname zúčastnených - vylepšená verzia
  const checkUserGoingStatus = async () => {
    if (!user || !event) return;

    try {
      // Použite endpoint /users/me namiesto /user/me (ak to zodpovedá vašej BE štruktúre)
      const { success, data } = await get(`/user/me`);
      if (success && data.data.goingTo) {
        // Kontrola, či ID eventu je v zozname goingTo používateľa
        const isUserGoing = data.data.goingTo.some((eventItem) =>
          typeof eventItem === "object"
            ? eventItem._id === event._id
            : eventItem === event._id
        );

        setIsGoing(isUserGoing);
      }
    } catch (error) {
      console.error("Chyba pri kontrole účasti:", error);
    }
  };

  // Pridanie používateľa na zoznam zúčastnených
  const handleAddGoingTo = async () => {
    if (!user || !event) return;

    try {
      setUpdating(true);
      // Získame token z localStorage
      const token = JSON.parse(localStorage.getItem("user"))?.token;

      const response = await fetch(
        `http://localhost:5000/api/user/goingTo/${event._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({}), // Prázdne telo požiadavky
        }
      );

      const data = await response.json();

      if (response.ok) {
        setError(null);
        setIsGoing(true);
        setGoingCount((prev) => prev + 1);
        setSuccessMessage("Boli ste úspešne prihlásený na event!");

        // Automaticky skryť správu po 3 sekundách
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        // Zobrazenie používateľsky zrozumiteľnej chybovej hlášky
        if (data.message === "Užívateľ sa už prihlásil na tento event") {
          setError("Už ste prihlásený na tento event");
        } else {
          setError("Nepodarilo sa prihlásiť na event. Skúste to znova.");
        }
        console.error(
          "Server vrátil chybu:",
          data.error || data.message || "Neznáma chyba"
        );
      }
    } catch (error) {
      console.error("Chyba pri pridaní na zoznam:", error);
    } finally {
      setUpdating(false);
    }
  };

  // Odstránenie používateľa zo zoznamu zúčastnených
  const handleRemoveGoingTo = async () => {
    if (!user || !event) return;

    try {
      setUpdating(true);
      // Získame token z localStorage
      const token = JSON.parse(localStorage.getItem("user"))?.token;

      const response = await fetch(
        `http://localhost:5000/api/user/goingTo/${event._id}/remove`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({}), // Prázdne telo požiadavky
        }
      );

      const data = await response.json();

      if (response.ok) {
        setError(null);
        setIsGoing(false);
        setGoingCount((prev) => prev - 1);
        setSuccessMessage("Boli ste úspešne odhlásený z eventu!");

        // Automaticky skryť správu po 3 sekundách
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        setError("Nepodarilo sa odhlásiť z eventu. Skúste to znova neskôr.");
        console.error(
          "Server vrátil chybu:",
          data.error || data.message || "Neznáma chyba"
        );
      }
    } catch (error) {
      console.error("Chyba pri odstránení zo zoznamu:", error);
    } finally {
      setUpdating(false);
    }
  };

  const fetchComments = async () => {
    try {
      const { success, data, error } = await get(`/comments/${event._id}`);
      if (success) {
        setComments(data);
      } else {
        console.error("Chyba pri načítaní komentárov:", error);
      }
    } catch (error) {
      console.error("Neočakávaná chyba pri načítaní komentárov:", error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    const confirmed = window.confirm("Naozaj chcete vymazať tento komentár?");
    if (!confirmed) return;

    // API volanie na vymazanie komentára
    const { success } = await del(`/comments/${commentId}`);

    if (success) {
      // Aktualizácia stavu po vymazaní
      setComments(comments.filter((comment) => comment._id !== commentId));
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [slug]);

  useEffect(() => {
    if (event) {
      fetchComments();
      if (user) {
        checkUserGoingStatus();
      }
    }
  }, [event, user]);

  if (!event) {
    return (
      <h1 style={{ color: "var(--text-error-dark)" }}>
        404 - Event neexistuje
      </h1>
    );
  }

  // Pagination logic
  const totalCommentPages = Math.ceil(
    (comments?.length || 0) / COMMENTS_PER_PAGE
  );

  // Get current page comments
  const currentComments =
    comments?.slice(
      (commentPage - 1) * COMMENTS_PER_PAGE,
      commentPage * COMMENTS_PER_PAGE
    ) || [];

  return (
    <>
      <EventDetail event={event} />
      {successMessage && (
        <div className="confirm-container">
          <p className="confirm-message">{successMessage}</p>
        </div>
      )}
      <EventAttendance
        goingCount={goingCount}
        isGoing={isGoing}
        user={user}
        updating={updating}
        onAddGoingTo={handleAddGoingTo}
        onRemoveGoingTo={handleRemoveGoingTo}
        error={error}
      />

      {user && (
        <CreateCommentForm eventId={event._id} fetchComments={fetchComments} />
      )}

      <div className="comments-section">
        <h3>
          <FaComments className="comments-icon" /> Komentáre ({comments.length})
        </h3>

        {user ? (
          <>
            <CreateCommentForm
              eventId={event._id}
              fetchComments={fetchComments}
            />

            {comments.length > 0 ? (
              <>
                {currentComments.map((comment) => (
                  <Comment
                    key={comment._id}
                    comment={comment}
                    onDelete={handleDeleteComment}
                    isAdmin={isAdmin}
                  />
                ))}

                <Pagination
                  currentPage={commentPage}
                  totalPages={totalCommentPages}
                  onPageChange={setCommentPage}
                />
              </>
            ) : (
              <p className="empty-text">
                Zatiaľ nie sú žiadne komentáre. Buďte prvý!
              </p>
            )}
          </>
        ) : (
          <div className="comments-blurred">
            <div className="login-overlay">
              <FaLock className="lock-icon" />
              <p>Pre zobrazenie komentárov k eventom sa prosím prihláste</p>
              <Link to="/login" className="login-button">
                Prihlásiť sa
              </Link>
            </div>

            {/* Túto časť používateľ nevidí (je rozmazaná), ale poskytuje obsah pre blur efekt */}
            <div className="blurred-content">
              <div className="sample-comment">
                <div className="sample-avatar"></div>
                <div className="sample-text">
                  <div className="sample-line"></div>
                  <div className="sample-line"></div>
                </div>
              </div>
              <div className="sample-comment">
                <div className="sample-avatar"></div>
                <div className="sample-text">
                  <div className="sample-line"></div>
                  <div className="sample-line"></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default EventDetailPage;
