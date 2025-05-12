import { FaLock, FaSave, FaTimes } from "react-icons/fa";
const PasswordChangeForm = ({
  handleSubmit,
  handleChange,
  toggleChangePassword,
  passwordData,
  validateError,
  error,
  successMessage,
}) => {
  return (
    <form onSubmit={handleSubmit} className="password-change-form">
      <div className="form-group">
        <label htmlFor="currentPassword">Aktuálne heslo</label>
        <input
          type="password"
          id="currentPassword"
          name="currentPassword"
          value={passwordData.currentPassword}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="newPassword">Nové heslo</label>
        <input
          type="password"
          id="newPassword"
          name="newPassword"
          value={passwordData.newPassword}
          onChange={handleChange}
          required
          minLength={6}
        />
      </div>

      <div className="form-group">
        <label htmlFor="confirmPassword">Potvrdiť nové heslo</label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={passwordData.confirmPassword}
          onChange={handleChange}
          required
        />
      </div>
      {validateError && (
        <div className="error-container">
          <p className="error-message">{validateError}</p>
        </div>
      )}
      {error && (
        <div className="error-container">
          <p className="error-message">{error}</p>
        </div>
      )}
      {successMessage && (
        <div className="confirm-container">
          <p className="confirm-message">{successMessage}</p>
        </div>
      )}
      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          <FaSave /> Uložiť nové heslo
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={toggleChangePassword}
        >
          <FaTimes /> Zrušiť
        </button>
      </div>
    </form>
  );
};
export default PasswordChangeForm;
