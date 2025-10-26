import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Dropdown, NavDropdown } from "react-bootstrap";
import "./NavigationBar.css";
import { useAuthContext } from "../context/AuthContext";

const NavigationBar = ({ language = "hi", onLanguageChange}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { isAuthenticated, setIsAuthenticated, setCurrentUser } = useAuthContext();
  const navigate = useNavigate();

  // Translation content
  const content = {
    hi: {
      brand: "कामखोज",
      home: "होम",
      jobs: "नौकरियां",
      assistant: "AI सहायक",
      profile: "प्रोफाइल",
      user: "उपयोगकर्ता",
      dashboard: "डैशबोर्ड",
      logout: "लॉगआउट",
      login: "लॉग इन",
      signup: "साइन अप",
      language: "भाषा",
      hindi: "हिंदी",
      english: "English",
    },
    en: {
      brand: "KaamKhoj",
      home: "Home",
      jobs: "Jobs",
      assistant: "AI Assistant",
      profile: "Profile",
      user: "User",
      dashboard: "Dashboard",
      logout: "Logout",
      login: "Login",
      signup: "Sign Up",
      language: "Language",
      hindi: "हिंदी",
      english: "English",
    },
  };

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Toggle mobile menu
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    // Close language dropdown when toggling menu
    if (langDropdownOpen) setLangDropdownOpen(false);
  };

  // Toggle language dropdown
  const toggleLangDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLangDropdownOpen(!langDropdownOpen);
  };

  // Handle language change
  const handleLanguageChange = (lang) => {
    if (onLanguageChange) {
      onLanguageChange(lang);
    }
    setLangDropdownOpen(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (langDropdownOpen) setLangDropdownOpen(false);
      if (profileDropdownOpen) setProfileDropdownOpen(false);
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [langDropdownOpen, profileDropdownOpen]);
  
  // Handle logout
  const handleLogout = () => {
    // Remove user data and token from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    
    // Update context
    setCurrentUser(null);
    setIsAuthenticated(false);
    
    // Navigate to home page
    navigate('/');
  };
  
  // Toggle profile dropdown
  const toggleProfileDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setProfileDropdownOpen(!profileDropdownOpen);
  };

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-brand">
            {content[language].brand}
          </Link>

          <button
            className={`menu-toggle ${menuOpen ? "active" : ""}`}
            onClick={toggleMenu}
            aria-label="Toggle navigation menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <div className={`navbar-menu ${menuOpen ? "active" : ""}`}>
            <ul className="nav-links">
              <li>
                <Link to="/" className="nav-link">
                  {content[language].home}
                </Link>
              </li>
              <li>
                <Link to="/jobs" className="nav-link">
                  {content[language].jobs}
                </Link>
              </li>
              <li>
                <Link to="/assistant" className="nav-link">
                  {content[language].assistant}
                </Link>
              </li>
              <li className="language-dropdown-container">
                <button
                  className="nav-link language-toggle"
                  onClick={toggleLangDropdown}
                  aria-label="Select language"
                >
                  {content[language].language}{" "}
                  <i
                    className={`fas fa-chevron-${
                      langDropdownOpen ? "up" : "down"
                    } ml-1`}
                  ></i>
                </button>
                <div
                  className={`language-dropdown ${
                    langDropdownOpen ? "show" : ""
                  }`}
                >
                  <button
                    className={`language-option ${
                      language === "hi" ? "active" : ""
                    }`}
                    onClick={() => handleLanguageChange("hi")}
                  >
                    हिंदी
                  </button>
                  <button
                    className={`language-option ${
                      language === "en" ? "active" : ""
                    }`}
                    onClick={() => handleLanguageChange("en")}
                  >
                    English
                  </button>
                </div>
              </li>
            </ul>

            <div className="auth-buttons">
              {isAuthenticated ? (
                // Show profile dropdown when logged in
                <div className="profile-dropdown-container">
                  <button
                    className="signup-btn profile-toggle"
                    onClick={toggleProfileDropdown}
                    aria-label="Profile options"
                  >
                    {content[language].user}{" "}
                    <i
                      className={`fas fa-chevron-${
                        profileDropdownOpen ? "up" : "down"
                      } ml-1`}
                    ></i>
                  </button>
                  <div
                    className={`profile-dropdown ${
                      profileDropdownOpen ? "show" : ""
                    }`}
                  >
                    <Link to="/profile" className="dropdown-item">
                       {content[language].profile}
                    </Link>
                    <Link to="/dashboard" className="dropdown-item">
                       {content[language].dashboard}
                    </Link>
                    <button
                      className="dropdown-item"
                      onClick={handleLogout}
                    >
                      <i className="fas fa-sign-out-alt mr-2"></i> {content[language].logout}
                    </button>
                  </div>
                </div>
              ) : (
                // Show login and signup buttons when not logged in
                <>
                  <Link to="/login" className="login-btn">
                    {content[language].login}
                  </Link>
                  <Link to="/signup" className="signup-btn">
                    {content[language].signup}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;