import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './NavigationBar.css';

const NavigationBar = ({ language = 'hi', onLanguageChange }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  // Translation content
  const content = {
    hi: {
      brand: "कामखोज",
      home: "होम",
      jobs: "नौकरियां",
      assistant: "AI सहायक",
      profile: "प्रोफाइल",
      contact: "संपर्क",
      login: "लॉग इन",
      signup: "साइन अप",
      language: "भाषा",
      hindi: "हिंदी",
      english: "English"
    },
    en: {
      brand: "KaamKhoj",
      home: "Home",
      jobs: "Jobs",
      assistant: "AI Assistant",
      profile: "Profile",
      contact: "Contact",
      login: "Login",
      signup: "Sign Up",
      language: "Language",
      hindi: "हिंदी",
      english: "English"
    }
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

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
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
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [langDropdownOpen]);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-brand">
            {content[language].brand}
          </Link>

          <button 
            className={`menu-toggle ${menuOpen ? 'active' : ''}`} 
            onClick={toggleMenu}
            aria-label="Toggle navigation menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <div className={`navbar-menu ${menuOpen ? 'active' : ''}`}>
            <ul className="nav-links">
              <li>
                <Link to="/" className="nav-link">{content[language].home}</Link>
              </li>
              <li>
                <Link to="/jobs" className="nav-link">{content[language].jobs}</Link>
              </li>
              <li>
                <Link to="/assistant" className="nav-link">{content[language].assistant}</Link>
              </li>
              <li>
                <Link to="/profile" className="nav-link">{content[language].profile}</Link>
              </li>
              <li>
                <Link to="/contact" className="nav-link">{content[language].contact}</Link>
              </li>
              <li className="language-dropdown-container">
                <button 
                  className="nav-link language-toggle" 
                  onClick={toggleLangDropdown}
                >
                  {content[language].language} <i className={`fas fa-chevron-${langDropdownOpen ? 'up' : 'down'}`}></i>
                </button>
                <div className={`language-dropdown ${langDropdownOpen ? 'show' : ''}`}>
                  <button 
                    className={`language-option ${language === 'hi' ? 'active' : ''}`}
                    onClick={() => handleLanguageChange('hi')}
                  >
                    हिंदी
                  </button>
                  <button 
                    className={`language-option ${language === 'en' ? 'active' : ''}`}
                    onClick={() => handleLanguageChange('en')}
                  >
                    English
                  </button>
                </div>
              </li>
            </ul>

            <div className="auth-buttons">
              <Link to="/login" className="login-btn">{content[language].login}</Link>
              <Link to="/signup" className="signup-btn">{content[language].signup}</Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
