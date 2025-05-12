import React, { useState } from "react";
import { FaLock, FaSave, FaTimes } from "react-icons/fa";
import { useApi } from "../../Hooks/useApi";
import "../../CSS/Profile/ProfileSettings.css";
import PasswordChangeForm from "./PasswordChangeForm";

const ProfileSettings = () => {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const { put, loading } = useApi();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
  };
  const validatePassword = () => {
    setValidationError(null);
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setValidationError("Heslá sa nezhodujú");
      return false;
    }
    if (passwordData.newPassword.length < 6) {
      setValidationError("Heslo musí mať aspoň 6 znakov");
      return false;
    }
    if (!/[A-Z]/.test(passwordData.newPassword)) {
      setValidationError("Heslo musí obsahovať aspoň jedno veľké písmeno");
      return false;
    }
    if (!/[0-9]/.test(passwordData.newPassword)) {
      setValidationError("Heslo musí obsahovať aspoň jedno číslo");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validácia
    if (!validatePassword()) return;

    try {
      const response = await put("/user/password-change", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      });
      console.log("Response:", response);

      if (response.success) {
        setSuccess("Heslo bolo úspešne zmenené!");
        // Reset formulára
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        // Zatvorenie formulára po 2 sekundách
        setTimeout(() => {
          setIsChangingPassword(false);
          setSuccess(null);
        }, 2000);
      } else {
        setError(response.error || "Chyba pri zmene hesla");
      }
    } catch (err) {
      setError("Chyba pri zmene hesla");
    }
  };

  const toggleChangePassword = () => {
    if (isChangingPassword) {
      // Reset formulára pri zrušení
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
    setIsChangingPassword(!isChangingPassword);
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="profile-settings">
      <h3>Nastavenia účtu</h3>

      {isChangingPassword ? (
        <PasswordChangeForm
          handleSubmit={handleSubmit}
          handleChange={handleChange}
          toggleChangePassword={toggleChangePassword}
          passwordData={passwordData}
          validateError={validationError}
          error={error}
          successMessage={success}
        />
      ) : (
        <button onClick={toggleChangePassword} className="change-password-btn">
          <FaLock /> Zmeniť heslo
        </button>
      )}
    </div>
  );
};

export default ProfileSettings;
