import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/HomePage";
import EventsPage from "./pages/EventsPage";
import EventDetailPage from "./pages/EventDetailPage";
import CreateEventPage from "./pages/CreateEventPage";
import EditEventPage from "./pages/EditEventPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import NotFoundPage from "./pages/NotFoundPage";
import AdminPage from "./pages/AdminPage";
import { useState } from "react";

const App = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  return (
    <Router>
      <Header
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
        setIsLoggedIn={setIsLoggedIn}
      />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<EventsPage />} />
          <Route
            path="/event/:slug"
            element={<EventDetailPage isAdmin={isAdmin} />}
          />
          <Route
            path="/events/category/:categoryName"
            element={<EventsPage />}
          />
          <Route
            path="/event/edit/:slug"
            element={<EditEventPage isLoggedIn={isLoggedIn} />}
          />
          <Route
            path="/create-event"
            element={<CreateEventPage isLoggedIn={isLoggedIn} />}
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/profile"
            element={<ProfilePage isLoggedIn={isLoggedIn} />}
          />
          <Route path="/admin" element={<AdminPage isAdmin={isAdmin} />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
};

export default App;
