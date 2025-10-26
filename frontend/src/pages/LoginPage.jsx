import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import NavigationBar from "../components/NavigationBar";
import Footer from "../components/Footer";
import Notification from "../components/Notification";
import useAuth from "../hooks/useAuth";
import "./LoginPage.css";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState(null);
  const [language, setLanguage] = useState("en"); // Default language is English
  const { isLoading, error, login, setError } = useAuth();
  const location = useLocation();
  
  // Load saved language preference
  useEffect(() => {
    const savedLanguage = localStorage.getItem("preferredLanguage");
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);
  
  // Check if user was redirected from registration
  useEffect(() => {
    if (location.state?.registered) {
      setNotification({
        type: 'success',
        message: content[language].registrationSuccess
      });
    }
  }, [location, language]);
  
  // Translation content
  const content = {
    hi: {
      welcomeBack: "वापसी पर स्वागत है",
      enterCredentials: "कृपया अपनी लॉगिन जानकारी दर्ज करें",
      username: "उपयोगकर्ता नाम",
      enterUsername: "अपना उपयोगकर्ता नाम दर्ज करें",
      password: "पासवर्ड",
      enterPassword: "अपना पासवर्ड दर्ज करें",
      rememberMe: "मुझे याद रखें",
      forgotPassword: "पासवर्ड भूल गए?",
      login: "लॉग इन",
      loggingIn: "लॉगिन हो रहा है...",
      orLoginWith: "या इसके साथ लॉग इन करें",
      dontHaveAccount: "खाता नहीं है?",
      signUp: "साइन अप",
      usernameRequired: "उपयोगकर्ता नाम आवश्यक है",
      passwordRequired: "पासवर्ड आवश्यक है",
      passwordLength: "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए",
      registrationSuccess: "पंजीकरण सफल! अब आप लॉग इन कर सकते हैं।",
    },
    en: {
      welcomeBack: "Welcome Back",
      enterCredentials: "Please enter your credentials to login",
      username: "Username",
      enterUsername: "Enter your username",
      password: "Password",
      enterPassword: "Enter your password",
      rememberMe: "Remember me",
      forgotPassword: "Forgot Password?",
      login: "Login",
      loggingIn: "Logging in...",
      orLoginWith: "or login with",
      dontHaveAccount: "Don't have an account?",
      signUp: "Sign Up",
      usernameRequired: "Username is required",
      passwordRequired: "Password is required",
      passwordLength: "Password must be at least 6 characters",
      registrationSuccess: "Registration successful! You can now log in.",
    },
  };

  // Handle language change
  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    localStorage.setItem("preferredLanguage", lang);
  };
  
  // Set error from auth hook to our local errors state
  useEffect(() => {
    if (error) {
      setErrors({ general: error });
    }
  }, [error]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    
    // Clear errors when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
    
    // Clear general error when typing
    if (errors.general) {
      setErrors({
        ...errors,
        general: "",
      });
      setError(null);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = content[language].usernameRequired;
    }
    
    if (!formData.password) {
      newErrors.password = content[language].passwordRequired;
    } else if (formData.password.length < 6) {
      newErrors.password = content[language].passwordLength;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Use the login function from our custom hook
    login({
      username: formData.username,
      password: formData.password,
      rememberMe: formData.rememberMe
    });
  };

  return (
    <>
      <NavigationBar language={language} onLanguageChange={handleLanguageChange} />
      {notification && (
        <Notification 
          type={notification.type} 
          message={notification.message} 
          onClose={() => setNotification(null)}
        />
      )}
      <div className="login-container">
        <div className="login-overlay"></div>
        <div className="login-card">
          <div className="login-header">
            <h1 className="login-title">{content[language].welcomeBack}</h1>
            <p className="login-subtitle">{content[language].enterCredentials}</p>
          </div>
          
          {errors.general && (
            <div className="alert alert-danger" role="alert">
              {errors.general}
            </div>
          )}
          
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                {content[language].username}
              </label>
              <input
                name="username"
                id="username"
                type="text"
                placeholder={content[language].enterUsername}
                className={`form-control ${errors.username ? "is-invalid" : ""}`}
                value={formData.username}
                onChange={handleChange}
                required
              />
              {errors.username && (
                <span className="error-message">{errors.username}</span>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                {content[language].password}
              </label>
              <input
                name="password"
                id="password"
                type="password"
                placeholder={content[language].enterPassword}
                className={`form-control ${errors.password ? "is-invalid" : ""}`}
                value={formData.password}
                onChange={handleChange}
                required
              />
              {errors.password && (
                <span className="error-message">{errors.password}</span>
              )}
            </div>
            
            <div className="remember-forgot">
              <div className="remember-me">
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                <label htmlFor="rememberMe">{content[language].rememberMe}</label>
              </div>
              {/* <Link to="/forgot-password" className="forgot-password">
                {content[language].forgotPassword}
              </Link> */}
            </div>
            
            <button 
              type="submit" 
              className="btn-login"
              disabled={isLoading}
            >
              {isLoading ? content[language].loggingIn : content[language].login}
            </button>
          </form>
          
          {/* <div className="login-divider">
            <span className="login-divider-text">{content[language].orLoginWith}</span>
          </div>
          
          <div className="social-login">
            <button className="social-button" type="button">
              <i className="fab fa-google"></i>
            </button>
          </div> */}
          
          <div className="signup-link-container">
            <span className="signup-text">
              {content[language].dontHaveAccount} <Link to="/signup" className="signup-link">{content[language].signUp}</Link>
            </span>
          </div>
        </div>
      </div>
      <Footer language={language} />
    </>
  );
}
