import React from "react";
import "../CSS/AuthForms.css";
import { Link } from "react-router-dom";

const LoginForm = ({
  credentials,
  setCredentials,
  handleSubmit,
  loading,
  error,
  validationError,
  confirmationMessage,
}) => {
  return (
    <div className="auth-form-container">
      <h2 className="auth-form-title">Prihlásenie</h2>
      <div className="auth-form">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={credentials.email}
              onChange={(e) =>
                setCredentials({ ...credentials, email: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <label>Heslo</label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) =>
                setCredentials({ ...credentials, password: e.target.value })
              }
              required
            />
          </div>
          {validationError && (
            <div className="error-container">
              <p className="error-message">{validationError}</p>
            </div>
          )}
          {error && (
            <div className="error-container">
              <p className="error-message">{error}</p>
            </div>
          )}
          {confirmationMessage && (
            <div className="confirm-container">
              <p className="confirm-message">{confirmationMessage}</p>
            </div>
          )}
          
          <button type="submit" disabled={loading} className="auth-button">
            {loading ? "Prihlasovanie..." : "Prihlásiť sa"}
          </button>
        </form>
        <div className="auth-switch">
          Nemáte účet? <Link to="/register">Zaregistrujte sa</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
