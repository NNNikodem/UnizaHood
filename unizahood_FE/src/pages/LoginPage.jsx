import React, { useState } from "react";
import LoginForm from "../components/LoginForm";
import { useLogin } from "../hooks/useLogin";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [validationError, setValidationError] = useState(null);
  const [confirmationMessage, setConfirmationMessage] = useState(null);
  const { login, error, loading } = useLogin();
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const handleRedirect = (redirect) => {
    navigate(redirect);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const response = await login(credentials.email, credentials.password);

    if (response && response.success) {
      // Úspešné prihlásenie
      setConfirmationMessage("Prihlásenie úspešné! Presmerovanie...");

      // Reset formulára
      setCredentials({
        email: "",
        password: "",
      });

      // Presmerovanie na profil po 1.5 sekundách
      handleRedirect("/profile");
    } else {
      // Chyba pri prihlásení - error už nastavil hook useLogin
      setConfirmationMessage(null);
    }
  };
  // Validacia
  const validateForm = () => {
    setValidationError(null);

    // Validácia emailu pomocou regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(credentials.email)) {
      setValidationError("Prosím, zadajte platný email");
      return false;
    }

    // Validácia hesla
    if (credentials.password.length < 6) {
      setValidationError("Heslo musí mať aspoň 6 znakov");
      return false;
    }

    return true;
  };

  // Ak je používateľ už prihlásený, presmeruj ho na profil
  if (user) {
    handleRedirect("/profile");
    return null; // Zastav vykreslenie komponentu
  }
  return (
    <>
      <LoginForm
        credentials={credentials}
        setCredentials={setCredentials}
        handleSubmit={handleSubmit}
        loading={loading}
        validationError={validationError}
        error={error}
        confirmationMessage={confirmationMessage}
      />
    </>
  );
};

export default LoginPage;
