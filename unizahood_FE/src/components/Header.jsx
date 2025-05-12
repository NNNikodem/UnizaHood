import { Link } from "react-router-dom";
import { useLogout } from "../Hooks/useLogout";
import { useAuthContext } from "../Hooks/useAuthContext";
import { useEffect, useState } from "react";
import "../CSS/Header.css";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const Header = ({ children, isAdmin, setIsAdmin, setIsLoggedIn }) => {
  const LOGO_PATH = "../UnizaHood_Logo.png";
  const { logout } = useLogout();
  const { user } = useAuthContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const handleRedirect = (redirect) => {
    navigate(redirect);
  };
  const handleLogout = () => {
    logout();
    handleRedirect("/");
    // Close the menu after logout
    setIsMenuOpen(false);
  };
  const handleLogoClick = () => {
    handleRedirect("/");
    // Close the menu when logo is clicked
    setIsMenuOpen(false);
  };
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  useEffect(() => {
    if (user) {
      const decodedToken = jwtDecode(user.token);
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp < currentTime) {
        handleLogout();
      }
      if (decodedToken.role === "admin") {
        setIsAdmin(true);
      } else setIsAdmin(false);
    } else {
      setIsAdmin(false);
    }
  }, [user]);
  useEffect(() => {
    setIsLoggedIn = localStorage.getItem("user") ? true : false;
  }, []);
  return (
    <>
      <header>
        <nav>
          <div className="nav-logo">
            <img
              src={LOGO_PATH}
              alt="Logo"
              className="logo"
              onClick={handleLogoClick}
            />
          </div>

          <button className="hamburger" onClick={toggleMenu} aria-label="Menu">
            <span></span>
            <span></span>
            <span></span>
          </button>

          <div className={`nav-container ${isMenuOpen ? "active" : ""}`}>
            <div className="nav-links">
              <Link to="/" onClick={() => setIsMenuOpen(false)}>
                Domov
              </Link>
              <Link to="/events" onClick={() => setIsMenuOpen(false)}>
                Eventy
              </Link>
            </div>

            {!user && (
              <div className="user-section">
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  Prihlásenie
                </Link>
                <Link
                  className="register-btn"
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Registrácia
                </Link>
              </div>
            )}

            {user && (
              <>
                <div className="user-section">
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                      Admin Panel
                    </Link>
                  )}
                  <Link to="/create-event" onClick={() => setIsMenuOpen(false)}>
                    Pridať Event
                  </Link>
                  <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
                    Profil
                  </Link>
                  <button
                    className="logout-btn"
                    onClick={handleLogout}
                    aria-label="Odhlásiť sa"
                  />
                </div>
              </>
            )}
          </div>
        </nav>
      </header>
      <h1>{children}</h1>
    </>
  );
};

export default Header;
