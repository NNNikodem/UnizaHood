import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaTrash,
  FaEye,
  FaSearch,
  FaExclamationTriangle,
} from "react-icons/fa";
import { useApi } from "../../Hooks/useApi";
import Pagination from "../common/Pagination";

const CommentsAdmin = ({ showImage }) => {
  const [comments, setComments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  // Používame existujúci API hook
  const { get, del, loading: apiLoading, error: apiError } = useApi();

  useEffect(() => {
    const fetchComments = async () => {
      setLocalLoading(true);
      try {
        const response = await get("/comments/get-all");

        if (response.success) {
          // Dáta sú v data.data
          if (Array.isArray(response.data.data)) {
            setComments(response.data.data);
            setLocalError(null);
          } else {
            console.error("API vrátilo nesprávny formát dát:", response.data);
            setLocalError("Zo servera bol prijatý neplatný formát údajov");
            setComments([]);
          }
        } else {
          // Spracovanie chyby
          console.error("Chyba pri načítaní komentárov:", response.error);
          setLocalError(
            "Načítanie komentárov zlyhalo. Skúste to prosím neskôr."
          );
          // Nastavenie záložných dát
          setMockData();
        }
      } catch (error) {
        console.error("Výnimka pri načítaní komentárov:", error);
        setLocalError("Vyskytla sa neočakávaná chyba");
        setMockData();
      } finally {
        setLocalLoading(false);
      }
    };

    fetchComments();
  }, []);

  // Reset stránky pri zmene searchTerm
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Funkcia na nastavenie ukážkových dát
  const setMockData = () => {};

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Zabezpečenie, že comments je vždy pole pred filtrovaním
  const filteredComments = Array.isArray(comments)
    ? comments.filter(
        (comment) =>
          (comment.author?.username || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (comment.text || "").toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // Výpočet celkového počtu stránok
  const totalPages = Math.ceil(filteredComments.length / ITEMS_PER_PAGE);

  // Získanie komentárov pre aktuálnu stránku
  const currentComments = filteredComments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleDeleteComment = async (commentId) => {
    console.log("Odstraňujem komentár s ID:", commentId);
    if (window.confirm("Naozaj chcete odstrániť tento komentár?")) {
      const response = await del(`/comments/${commentId}`);
      if (response.success) {
        setComments(comments.filter((comment) => comment._id !== commentId));
      }
    }
  };

  // Funkcia na formátovanie dátumu
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("sk-SK");
    } catch (e) {
      return dateString;
    }
  };

  // Použitie lokálneho alebo API stavu načítavania
  const isLoading = localLoading || apiLoading;
  // Použitie lokálnej alebo API chyby
  const errorMessage = localError || apiError;

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Vyhľadať komentáre..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
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
              <th>Obsah</th>
              <th>Príspevok</th>
              <th>Dátum</th>
              <th>Príloha</th>
              <th>Akcie</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="center-text">
                  Načítavam...
                </td>
              </tr>
            ) : currentComments.length === 0 ? (
              <tr>
                <td colSpan={6} className="center-text">
                  Žiadne komentáre neboli nájdené
                </td>
              </tr>
            ) : (
              currentComments.map((comment) => (
                <tr
                  key={comment._id}
                  className={comment.reported ? "reported-row" : ""}
                >
                  <td>
                    <div className="author-cell">
                      {comment.author?.photo && (
                        <img
                          src={`http://localhost:5000${comment.author.photo}`}
                          alt={comment.author?.username}
                          className="author-avatar"
                          onClick={() =>
                            showImage(
                              `http://localhost:5000${comment.author.photo}`
                            )
                          }
                        />
                      )}
                      <span>
                        {comment.author?.username || "Neznámy užívateľ"}
                      </span>
                    </div>
                  </td>
                  <td>
                    {comment.text?.length > 50
                      ? `${comment.text.substring(0, 50)}...`
                      : comment.text}
                  </td>
                  <td>
                    <Link to={`/event/${comment.event?.slug}`}>
                      {comment.event?.title}
                    </Link>
                  </td>
                  <td>{formatDate(comment.createdAt)}</td>
                  <td>
                    {comment.imageUrl ? (
                      <div className="comment-image-container">
                        <img
                          src={`http://localhost:5000${comment.imageUrl}`}
                          alt="Obrázok komentára"
                          className="comment-image-thumbnail"
                          onClick={() =>
                            showImage(
                              `http://localhost:5000${comment.imageUrl}`
                            )
                          }
                        />
                      </div>
                    ) : (
                      <span className="no-image">Žiadna príloha</span>
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="icon-button danger"
                        onClick={() => handleDeleteComment(comment._id)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!isLoading && filteredComments.length > ITEMS_PER_PAGE && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default CommentsAdmin;
