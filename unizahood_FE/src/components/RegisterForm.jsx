import React from "react";
import "../CSS/AuthForms.css";
import { Link } from "react-router-dom";

const RegisterForm = ({
  userDetails,
  setUserDetails,
  handleSubmit,
  isLoading,
  validationError,
  confirmationMessage,
  error,
}) => {
  return (
    <div className="auth-form-container">
      <h2 className="auth-form-title">Registrácia</h2>
      <div className="auth-form">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Používateľské meno</label>
            <input
              type="text"
              value={userDetails.username}
              onChange={(e) =>
                setUserDetails({ ...userDetails, username: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={userDetails.email}
              onChange={(e) =>
                setUserDetails({ ...userDetails, email: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <label>Heslo</label>
            <input
              type="password"
              value={userDetails.password}
              onChange={(e) =>
                setUserDetails({ ...userDetails, password: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <label>Potvrdiť heslo</label>
            <input
              type="password"
              value={userDetails.repeatPassword}
              onChange={(e) =>
                setUserDetails({
                  ...userDetails,
                  repeatPassword: e.target.value,
                })
              }
              required
            />
          </div>
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
          {confirmationMessage && (
            <div className="confirm-container">
              <p className="confirma-message">{confirmationMessage}</p>
            </div>
          )}

          <button type="submit" disabled={isLoading} className="auth-button">
            {isLoading ? "Registrácia..." : "Zaregistrovať sa"}
          </button>
        </form>
        <div className="auth-switch">
          Už máte účet? <Link to="/login">Prihláste sa</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
