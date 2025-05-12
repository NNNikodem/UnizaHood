import React, { useState } from "react";
import { FaSave, FaExclamationTriangle } from "react-icons/fa";
import { useApi } from "../../Hooks/useApi";

const SettingsAdmin = () => {
  const [settings, setSettings] = useState({
    enableUserRegistration: true,
    enableEventCreation: true,
    enableComments: true,
    notificationEmail: "admin@unizahood.com",
    maintenanceMode: false,
  });

  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Používame existujúci API hook
  const { post, loading: apiLoading, error: apiError } = useApi();

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    setSettings({
      ...settings,
      [name]: checked,
    });
    setSaveSuccess(false);
  };

  const handleTextChange = (event) => {
    const { name, value } = event.target;
    setSettings({
      ...settings,
      [name]: value,
    });
    setSaveSuccess(false);
  };

  const handleSaveSettings = async () => {
    setLocalLoading(true);
    setSaveSuccess(false);

    try {
      const response = await post("/settings/update", settings);
      if (response.success) {
        setSaveSuccess(true);
        setLocalError(null);
      } else {
        setLocalError("Uloženie nastavení zlyhalo. Skúste to prosím neskôr.");
      }
    } catch (error) {
      console.error("Chyba pri ukladaní nastavení:", error);
      setLocalError("Vyskytla sa neočakávaná chyba");
    } finally {
      setLocalLoading(false);
    }
  };

  // Používame lokálny alebo API stav načítavania
  const isLoading = localLoading || apiLoading;
  // Používame lokálnu alebo API chybu
  const errorMessage = localError || apiError;

  return (
    <div className="admin-container">
      <h2 className="settings-title">Nastavenia platformy</h2>

      {errorMessage && (
        <div className="admin-alert error">
          <FaExclamationTriangle /> {errorMessage}
        </div>
      )}

      {saveSuccess && (
        <div className="admin-alert success">
          Nastavenia boli úspešne uložené!
        </div>
      )}

      <div className="settings-section">
        <h3 className="settings-section-title">Základné nastavenia</h3>
        <div className="settings-divider"></div>

        <div className="settings-item">
          <label className="settings-checkbox">
            <input
              type="checkbox"
              name="enableUserRegistration"
              checked={settings.enableUserRegistration}
              onChange={handleCheckboxChange}
            />
            <span className="checkbox-label">
              Povoliť registráciu používateľov
            </span>
          </label>
        </div>

        <div className="settings-item">
          <label className="settings-checkbox">
            <input
              type="checkbox"
              name="enableEventCreation"
              checked={settings.enableEventCreation}
              onChange={handleCheckboxChange}
            />
            <span className="checkbox-label">Povoliť vytváranie udalostí</span>
          </label>
        </div>

        <div className="settings-item">
          <label className="settings-checkbox">
            <input
              type="checkbox"
              name="enableComments"
              checked={settings.enableComments}
              onChange={handleCheckboxChange}
            />
            <span className="checkbox-label">Povoliť komentáre</span>
          </label>
        </div>
      </div>

      <div className="settings-section">
        <h3 className="settings-section-title">Údržba</h3>
        <div className="settings-divider"></div>

        <div className="settings-item">
          <label className="settings-checkbox">
            <input
              type="checkbox"
              name="maintenanceMode"
              checked={settings.maintenanceMode}
              onChange={handleCheckboxChange}
            />
            <span className="checkbox-label">Režim údržby</span>
          </label>
          <p className="settings-description">
            Keď je režim údržby zapnutý, prístup k stránke majú iba
            administrátori.
          </p>
        </div>
      </div>

      <div className="settings-section">
        <h3 className="settings-section-title">Notifikácie</h3>
        <div className="settings-divider"></div>

        <div className="settings-item">
          <label className="settings-input-label">Email pre notifikácie</label>
          <input
            type="email"
            name="notificationEmail"
            value={settings.notificationEmail}
            onChange={handleTextChange}
            className="settings-input"
          />
        </div>
      </div>

      <div className="settings-actions">
        <button
          className="admin-button primary"
          onClick={handleSaveSettings}
          disabled={isLoading}
        >
          <FaSave className="button-icon" />
          {isLoading ? "Ukladám..." : "Uložiť nastavenia"}
        </button>
      </div>
    </div>
  );
};

export default SettingsAdmin;
