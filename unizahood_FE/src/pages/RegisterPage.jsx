import React, { useState } from "react";
import RegisterForm from "../components/RegisterForm";
import { useRegister } from "../hooks/useRegister";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const [userDetails, setUserDetails] = useState({
    username: "",
    email: "",
    password: "",
    repeatPassword: "",
  });
  const { register, error, isLoading } = useRegister();
  const [validationError, setValidationError] = useState(null);
  const [confirmationMessage, setConfirmationMessage] = useState(null);
  const navigate = useNavigate();
  const handleRedirect = (redirect) => {
    navigate(redirect);
  };
  // Ak je používateľ už prihlásený, presmeruj ho na profil
  const user = JSON.parse(localStorage.getItem("user"));
  if (user) {
    handleRedirect("/profile");
    return null;
  }
  //validation
  const validateForm = () => {
    setValidationError(null);
    if (!userDetails.username || !userDetails.email || !userDetails.password) {
      setValidationError("Vyplňte všetky polia");
      return false;
    }
    if (userDetails.password !== userDetails.repeatPassword) {
      setValidationError("Heslá sa nezhodujú");
      return false;
    }
    if (userDetails.username.length < 3) {
      setValidationError("Meno musí mať aspoň 3 znaky");
      return false;
    }
    if (userDetails.password.length < 6) {
      setValidationError("Heslo musí mať aspoň 6 znakov");
      return false;
    }
    if (!/[A-Z]/.test(userDetails.password)) {
      setValidationError("Heslo musí obsahovať aspoň jedno veľké písmeno");
      return false;
    }
    if (!/[0-9]/.test(userDetails.password)) {
      setValidationError("Heslo musí obsahovať aspoň jedno číslo");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(userDetails.email)) {
      setValidationError("Zadajte platný email");
      return false;
    }
    return true;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Očakávame, že register() vráti objekt s tokenom a dátami používateľa
    const response = await register(
      userDetails.username,
      userDetails.email,
      userDetails.password
    );

    if (response && response.success) {
      // Úspešná registrácia
      setConfirmationMessage("Registrácia bola úspešná! Presmerovanie...");

      // Reset formulára
      setUserDetails({
        username: "",
        email: "",
        password: "",
        repeatPassword: "",
      });

      // Presmerovanie po 3 sekundách
      handleRedirect("/profile");
    } else {
      setConfirmationMessage(null);
    }
  };

  return (
    <>
      <RegisterForm
        userDetails={userDetails}
        setUserDetails={setUserDetails}
        handleSubmit={handleSubmit}
        validationError={validationError}
        confirmationMessage={confirmationMessage}
        error={error}
        isLoading={isLoading}
      />
    </>
  );
};

export default RegisterPage;
