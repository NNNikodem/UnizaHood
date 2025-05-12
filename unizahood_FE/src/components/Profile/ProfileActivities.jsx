import React, { useState, useEffect } from "react";
import { useApi } from "../../Hooks/useApi";
import ProfileEventCard from "../Profile/ProfileEventCard";
import { formatDistanceToNow } from "date-fns";
import { sk } from "date-fns/locale";
import Pagination from "../common/Pagination";
import ProfileMyComment from "./ProfileMyComment";

const ProfileActivities = ({ userId }) => {
  const [myEvents, setMyEvents] = useState([]);
  const [goingToEvents, setGoingToEvents] = useState([]);
  const [myComments, setMyComments] = useState([]);

  // Pagination states
  const [eventsPage, setEventsPage] = useState(1);
  const [goingToPage, setGoingToPage] = useState(1);
  const [commentsPage, setCommentsPage] = useState(1);

  // Items per page
  const EVENTS_PER_PAGE = 6;
  const COMMENTS_PER_PAGE = 5;

  const { get, del } = useApi();

  const deleteEvent = async (eventId) => {
    const confirmed = window.confirm("Naozaj chcete vymazať tento event?");
    if (!confirmed) return;

    const { success, data, error } = await del(`/events/${eventId}`);

    if (success) {
      setMyEvents((prevEvents) =>
        prevEvents.filter((event) => event._id !== eventId)
      );
      setGoingToEvents((prevEvents) =>
        prevEvents.filter((event) => event._id !== eventId)
      );
    } else {
      console.error("Chyba pri mazaní eventu:", error);
    }
  };

  const deleteComment = async (commentId) => {
    const confirmed = window.confirm("Naozaj chcete vymazať tento komentár?");
    if (!confirmed) return;

    const { success } = await del(`/comments/${commentId}`);
    if (success) {
      setMyComments((prevComments) =>
        prevComments.filter((comment) => comment._id !== commentId)
      );
    } else {
      console.error("Chyba pri mazaní komentára");
    }
  };

  const fetchMyEvents = async () => {
    const { success, data, error } = await get(`/events/my`);
    if (success) {
      setMyEvents(data.data);
    } else {
      console.error("Chyba pri načítaní eventov:", error);
    }
  };

  const fetchGoingToEvents = async () => {
    const { success, data, error } = await get(`/events/goingTo`);
    if (success) {
      setGoingToEvents(data.data);
    } else {
      console.error("Chyba pri načítaní eventov:", error);
    }
  };

  const fetchMyComments = async () => {
    const { success, data, error } = await get(`/comments/my`);
    if (success) {
      // Zoradenie komentárov podľa času (najnovšie ako prvé)
      const sortedComments = [...data].sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      setMyComments(sortedComments);
      console.log("Moje komentáre:", sortedComments);
    } else {
      console.error("Chyba pri načítaní komentárov:", error);
    }
  };

  useEffect(() => {
    fetchMyEvents();
    fetchGoingToEvents();
    fetchMyComments();
  }, [userId]);

  // Pagination logic
  const totalEventsPages = Math.ceil((myEvents?.length || 0) / EVENTS_PER_PAGE);
  const totalGoingToPages = Math.ceil(
    (goingToEvents?.length || 0) / EVENTS_PER_PAGE
  );
  const totalCommentsPages = Math.ceil(
    (myComments?.length || 0) / COMMENTS_PER_PAGE
  );

  // Current page items
  const currentEvents =
    myEvents?.slice(
      (eventsPage - 1) * EVENTS_PER_PAGE,
      eventsPage * EVENTS_PER_PAGE
    ) || [];

  const currentGoingToEvents =
    goingToEvents?.slice(
      (goingToPage - 1) * EVENTS_PER_PAGE,
      goingToPage * EVENTS_PER_PAGE
    ) || [];

  const currentComments =
    myComments?.slice(
      (commentsPage - 1) * COMMENTS_PER_PAGE,
      commentsPage * COMMENTS_PER_PAGE
    ) || [];

  return (
    <div className="space-y-10">
      {/* Vytvorené eventy */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">
          📝 Moje vytvorené eventy
        </h2>
        {myEvents?.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {currentEvents.map((event) => (
                <ProfileEventCard
                  key={event._id}
                  event={event}
                  onDelete={deleteEvent}
                />
              ))}
            </div>
            <Pagination
              currentPage={eventsPage}
              totalPages={totalEventsPages}
              onPageChange={setEventsPage}
            />
          </>
        ) : (
          <p className="empty-text">Zatiaľ ste nevytvorili žiadne eventy.</p>
        )}
      </section>

      {/* Zúčastním sa */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">🎉 Zúčastním sa</h2>
        {goingToEvents?.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {currentGoingToEvents.map((event) => (
                <ProfileEventCard key={event._id} event={event} />
              ))}
            </div>
            <Pagination
              currentPage={goingToPage}
              totalPages={totalGoingToPages}
              onPageChange={setGoingToPage}
            />
          </>
        ) : (
          <p className="empty-text">
            Zatiaľ sa nezúčastňujete žiadnych eventov.
          </p>
        )}
      </section>

      {/* Komentáre */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">💬 Moje komentáre</h2>
        {myComments?.length > 0 ? (
          <>
            <div className="space-y-4">
              {currentComments.map((comment) => (
                <ProfileMyComment
                  key={comment._id}
                  comment={comment}
                  onDelete={deleteComment}
                />
              ))}
            </div>
            <Pagination
              currentPage={commentsPage}
              totalPages={totalCommentsPages}
              onPageChange={setCommentsPage}
            />
          </>
        ) : (
          <p className="empty-text">Zatiaľ ste nepridali žiadne komentáre.</p>
        )}
      </section>
    </div>
  );
};

export default ProfileActivities;
