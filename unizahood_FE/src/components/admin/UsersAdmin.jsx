import React, { useState, useEffect } from "react";
import {
  FaTrash,
  FaEdit,
  FaSearch,
  FaExclamationTriangle,
  FaUserPlus,
} from "react-icons/fa";
import { useApi } from "../../Hooks/useApi";
import Pagination from "../common/Pagination";

const UsersAdmin = ({ showImage }) => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  // Používame existujúci API hook
  const { get, del, loading: apiLoading, error: apiError } = useApi();

  useEffect(() => {
    const fetchUsers = async () => {
      setLocalLoading(true);
      try {
        const response = await get("/user/allUsers");

        if (response.success) {
          // Dáta sú v data.data
          if (Array.isArray(response.data.data)) {
            setUsers(response.data.data);
            setLocalError(null);
          } else {
            console.error("API vrátilo nesprávny formát dát:", response.data);
            setLocalError("Zo servera bol prijatý neplatný formát údajov");
            setUsers([]);
          }
        } else {
          console.error("Chyba pri načítaní používateľov:", response.error);
          setLocalError(
            "Načítanie používateľov zlyhalo. Skúste to prosím neskôr."
          );
          return <p className="empty-text">Žiadni používatelia</p>;
        }
      } catch (error) {
        console.error("Výnimka pri načítaní používateľov:", error);
        setLocalError("Vyskytla sa neočakávaná chyba");
        setMockData();
      } finally {
        setLocalLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Reset stránky pri zmene searchTerm
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredUsers = Array.isArray(users)
    ? users.filter(
        (user) =>
          (user.username || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (user.email || "").toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // Výpočet celkového počtu stránok
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

  // Získanie používateľov pre aktuálnu stránku
  const currentUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Naozaj chcete odstrániť tohto používateľa?")) {
      const response = await del(`/user/${userId}`);
      if (response.success) {
        setUsers(users.filter((user) => user._id !== userId));
      } else {
        console.error("Chyba pri odstraňovaní používateľa:", response.error);
        setLocalError(
          "Odstránenie používateľa zlyhalo. Skúste to prosím neskôr."
        );
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

  // Používame lokálny alebo API stav načítavania
  const isLoading = localLoading || apiLoading;
  // Používame lokálnu alebo API chybu
  const errorMessage = localError || apiError;

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Vyhľadať používateľov..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <button className="admin-button primary">
          <FaUserPlus className="button-icon" /> Pridať používateľa
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
              <th>Používateľ</th>
              <th>Email</th>
              <th>Rola</th>
              <th>Dátum registrácie</th>
              <th>Akcie</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="center-text">
                  Načítavam...
                </td>
              </tr>
            ) : currentUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="center-text">
                  Žiadni používatelia neboli nájdení
                </td>
              </tr>
            ) : (
              currentUsers.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div className="author-cell">
                      {user.photo && (
                        <img
                          src={`http://localhost:5000${user.photo}`}
                          alt={user.username}
                          className="author-avatar"
                          onClick={() =>
                            showImage(`http://localhost:5000${user.photo}`)
                          }
                        />
                      )}
                      <span>{user.username}</span>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`user-role ${user.role}`}>
                      {user.role === "admin" ? "Admin" : "Používateľ"}
                    </span>
                  </td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td>
                    <div className="action-buttons">
                      {user.role !== "admin" && (
                        <button
                          className="icon-button danger"
                          onClick={() => handleDeleteUser(user._id)}
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!isLoading && filteredUsers.length > ITEMS_PER_PAGE && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default UsersAdmin;
