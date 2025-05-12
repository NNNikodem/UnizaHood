import React, { useState, useEffect } from "react";
import ProfileInfo from "../components/Profile/ProfileInfo";
import ProfileActivities from "../components/Profile/ProfileActivities";
import ProfileSettings from "../components/Profile/ProfileSettings";
import "../CSS/Profile/ProfilePage.css";
import { useNavigate } from "react-router-dom";
import { useApi } from "../Hooks/useApi"; // Pridaný import

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const localData = JSON.parse(localStorage.getItem("user"));
  const { get } = useApi(); // Používame useApi hook

  const handleRedirect = (redirect) => {
    navigate(redirect);
  };

  const fetchUserData = async () => {
    try {
      // Kontrola či používateľ existuje v localStorage
      if (!localData || !localData.id || !localData.token) {
        handleRedirect("/login");
        return;
      }

      // Použitie get metódy z useApi hooku
      const { success, data, error } = await get(`/user/${localData.id}`);

      if (success && data) {
        setUser(data.data); // Nastavenie používateľských dát
      } else {
        console.error("Chyba pri načítaní používateľských dát:", error);
        handleRedirect("/login");
      }
    } catch (error) {
      console.error("Chyba pri načítaní dát:", error);
      handleRedirect("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);
  if (loading) {
    return <div className="loading">Načítavam profil...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <ProfileInfo user={user} />
      <ProfileActivities userId={user.id} />
      <ProfileSettings user={user} />
    </>
  );
};

export default ProfilePage;
