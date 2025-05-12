import React, { useState, useEffect } from "react";
import { FaEdit, FaSave, FaTimes } from "react-icons/fa";
import { useApi } from "../../Hooks/useApi";
import "../../CSS/Profile/ProfileInfo.css";

const ProfileInfo = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    username: user.username,
    bio: user.bio || "",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [confirmatiomMessage, setConfirmationMessage] = useState(null);
  const { put } = useApi();

  // Nastavenie predvolených hodnôt pri načítaní alebo zmene používateľa
  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username,
        bio: user.bio || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Ak existuje predchádzajúci náhľad, uvoľníme jeho URL
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }

      setProfileImage(file);
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);
    }
  };

  const clearImagePreview = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    setProfileImage(null);
  };
  const validateSubmit = () => {
    if (profileData.username.trim() === "") {
      setValidationError("Používateľské meno nemôže byť prázdne.");
      return false;
    }
    if (profileData.username.length < 3) {
      setValidationError("Používateľské meno musí mať aspoň 3 znaky.");
      return false;
    }
    if (profileData.username.length > 20) {
      setValidationError("Používateľské meno môže mať maximálne 20 znakov.");
      return false;
    }
    return true;
  };
  const makeFormData = () => {
    // Ak sa nič do formdata nepridalo, vrátime null
    if (
      profileData.username === user.username &&
      !profileImage &&
      profileData.bio === user.bio
    ) {
      return null;
    }
    const formData = new FormData();
    if (profileData.username !== user.username) {
      formData.append("username", profileData.username);
    }
    if (profileData.bio !== user.bio) {
      formData.append("bio", profileData.bio);
    }

    if (profileImage) {
      formData.append("photo", profileImage);
    }

    return formData;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validácia
    if (!validateSubmit()) return;
    const formData = makeFormData();
    if (!formData) {
      setTimeout(() => {
        toggleEdit();
      }, 200);
      return;
    }
    try {
      // Upravená URL adresa podľa API endpointu
      const response = await fetch(
        `http://localhost:5000/api/user/${user._id}/update`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${
              JSON.parse(localStorage.getItem("user")).token
            }`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Chyba pri aktualizácii profilu");
      }

      const result = await response.json();
      console.log(result);
      // Kontrola či prišlo varovanie o používateľskom mene
      if (result.warning) {
        setSuccess(result.message);
        setError(result.warning);
      } else {
        // Obnovenie stránky pre zobrazenie aktualizovaných údajov
        setTimeout(() => {
          window.location.reload();
        }, 1500);
        setSuccess("Profil bol úspešne aktualizovaný!");
      }

      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleEdit = () => {
    if (isEditing) {
      setProfileData({
        username: user.username,
        bio: user.bio || "",
      });
      clearImagePreview();
      setValidationError(null);
      setError(null);
    }
    setIsEditing(!isEditing);
  };
  return (
    <div className="profile-info">
      <div
        className={`profile-view-container ${isEditing ? "hiding" : "showing"}`}
      >
        {/* Normálny režim zobrazenia */}
        <div className="profile-header">
          <img
            src={`http://localhost:5000${user.photo}`}
            alt="Profile"
            className="profile-picture"
          />
          <h2>{user.username}</h2>
          <p className="user-email">{user.email}</p>
        </div>
        <div className="bio">
          <h3>O mne</h3>
          <p>{user.bio || "Zatiaľ nevyplnené"}</p>
        </div>
        <button onClick={toggleEdit} className="edit-profile-btn">
          <FaEdit /> Upraviť profil
        </button>
      </div>

      <div
        className={`profile-edit-container ${isEditing ? "showing" : "hiding"}`}
      >
        {/* Formulár pre úpravu */}
        <form onSubmit={handleSubmit} className="profile-edit-form">
          <div className="profile-photo-edit">
            <div className="profile-image-container">
              <img
                src={imagePreview || `http://localhost:5000${user.photo}`}
                alt="Profile"
                className="profile-picture"
              />
              {imagePreview && (
                <button
                  type="button"
                  className="remove-image-btn"
                  onClick={clearImagePreview}
                >
                  ✕
                </button>
              )}
            </div>
            <div className="image-upload">
              <label htmlFor="photo" className="image-upload-label">
                Zmeniť fotografiu
              </label>
              <input
                id="photo"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="username">Používateľské meno</label>
            <input
              type="text"
              id="username"
              name="username"
              value={profileData.username}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="bio">O mne</label>
            <textarea
              id="bio"
              name="bio"
              value={profileData.bio}
              onChange={handleChange}
              rows="4"
            ></textarea>
          </div>

          <div className="form-actions">
            {success && <div className="success-message">{success}</div>}
            {error && (
              <div className="error-container">
                <p className="error-message">{error}</p>
              </div>
            )}
            {validationError && (
              <div className="error-container">
                <p className="error-message">{validationError}</p>
              </div>
            )}
            {confirmatiomMessage && (
              <div className="confirm-container">
                <p className="confirm-message">{confirmatiomMessage}</p>
              </div>
            )}
            <button type="submit" className="btn btn-primary">
              <FaSave /> Uložiť zmeny
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={toggleEdit}
            >
              <FaTimes /> Zrušiť
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileInfo;
