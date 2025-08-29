import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import NavigationBar from "../components/NavigationBar";
import Footer from "../components/Footer";
import useAuth from "../hooks/useAuth";
import "./SignupPage.css";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false
  });
  const [errors, setErrors] = useState({});
  const [language, setLanguage] = useState("en"); // Default language is English
  const { isLoading, error, register, setError } = useAuth();
  
  // Load saved language preference
  useEffect(() => {
    const savedLanguage = localStorage.getItem("preferredLanguage");
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);
  
  // Translation content
  const content = {
    hi: {
      createAccount: "खाता बनाएँ",
      joinKaamkhoj: "नौकरी के अवसर खोजने के लिए कामखोज से जुड़ें",
      username: "उपयोगकर्ता नाम",
      chooseUsername: "उपयोगकर्ता नाम चुनें",
      email: "ईमेल",
      enterEmail: "अपना ईमेल दर्ज करें",
      password: "पासवर्ड",
      createPassword: "पासवर्ड बनाएँ",
      confirmPassword: "पासवर्ड की पुष्टि करें",
      confirmYourPassword: "अपने पासवर्ड की पुष्टि करें",
      agreeTerms: "मैं नियम और शर्तों और गोपनीयता नीति से सहमत हूँ",
      termsAndConditions: "नियम और शर्तें",
      privacyPolicy: "गोपनीयता नीति",
      signUp: "साइन अप",
      creatingAccount: "खाता बनाया जा रहा है...",
      alreadyHaveAccount: "पहले से ही खाता है?",
      login: "लॉग इन",
      usernameRequired: "उपयोगकर्ता नाम आवश्यक है",
      usernameLength: "उपयोगकर्ता नाम कम से कम 3 अक्षरों का होना चाहिए",
      emailRequired: "ईमेल आवश्यक है",
      invalidEmail: "ईमेल पता अमान्य है",
      passwordRequired: "पासवर्ड आवश्यक है",
      passwordLength: "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए",
      passwordsDoNotMatch: "पासवर्ड मेल नहीं खाते",
      mustAgreeTerms: "आपको नियम और शर्तों से सहमत होना चाहिए"
    },
    en: {
      createAccount: "Create Account",
      joinKaamkhoj: "Join KaamKhoj to find the perfect job opportunity",
      username: "Username",
      chooseUsername: "Choose a username",
      email: "Email",
      enterEmail: "Enter your email",
      password: "Password",
      createPassword: "Create a password",
      confirmPassword: "Confirm Password",
      confirmYourPassword: "Confirm your password",
      agreeTerms: "I agree to the Terms and Conditions and Privacy Policy",
      termsAndConditions: "Terms and Conditions",
      privacyPolicy: "Privacy Policy",
      signUp: "Sign Up",
      creatingAccount: "Creating Account...",
      alreadyHaveAccount: "Already have an account?",
      login: "Login",
      usernameRequired: "Username is required",
      usernameLength: "Username must be at least 3 characters",
      emailRequired: "Email is required",
      invalidEmail: "Email address is invalid",
      passwordRequired: "Password is required",
      passwordLength: "Password must be at least 6 characters",
      passwordsDoNotMatch: "Passwords do not match",
      mustAgreeTerms: "You must agree to the terms and conditions"
    }
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
    } else if (formData.username.length < 3) {
      newErrors.username = content[language].usernameLength;
    }
    
    if (!formData.email.trim()) {
      newErrors.email = content[language].emailRequired;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = content[language].invalidEmail;
    }
    
    if (!formData.password) {
      newErrors.password = content[language].passwordRequired;
    } else if (formData.password.length < 6) {
      newErrors.password = content[language].passwordLength;
    }
    
    // if (formData.password !== formData.confirmPassword) {
    //   newErrors.confirmPassword = content[language].passwordsDoNotMatch;
    // }
    
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = content[language].mustAgreeTerms;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Use the register function from our custom hook
    register({
      username: formData.username,
      email: formData.email,
      password: formData.password
    });
  };

  return (
    <>
      <NavigationBar language={language} onLanguageChange={handleLanguageChange} />
      <div className="signup-container">
        <div className="signup-overlay"></div>
        <div className="signup-card">
          <div className="signup-header">
            <h1 className="signup-title">{content[language].createAccount}</h1>
            <p className="signup-subtitle">{content[language].joinKaamkhoj}</p>
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
                placeholder={content[language].chooseUsername}
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
              <label htmlFor="email" className="form-label">
                {content[language].email}
              </label>
              <input
                name="email"
                id="email"
                type="email"
                placeholder={content[language].enterEmail}
                className={`form-control ${errors.email ? "is-invalid" : ""}`}
                value={formData.email}
                onChange={handleChange}
                required
              />
              {errors.email && (
                <span className="error-message">{errors.email}</span>
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
                placeholder={content[language].createPassword}
                className={`form-control ${errors.password ? "is-invalid" : ""}`}
                value={formData.password}
                onChange={handleChange}
                required
              />
              {errors.password && (
                <span className="error-message">{errors.password}</span>
              )}
            </div>
            
            {/* <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                {content[language].confirmPassword}
              </label>
              <input
                name="confirmPassword"
                id="confirmPassword"
                type="password"
                placeholder={content[language].confirmYourPassword}
                className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              {errors.confirmPassword && (
                <span className="error-message">{errors.confirmPassword}</span>
              )}
            </div> */}
            
            <div className={`terms-checkbox ${errors.agreeTerms ? "is-invalid" : ""}`}>
              <input
                type="checkbox"
                id="agreeTerms"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                required
              />
              <label htmlFor="agreeTerms" className="terms-text">
                {content[language].agreeTerms.split('Terms and Conditions')[0]}
                <Link to="/terms" className="terms-link">{content[language].termsAndConditions}</Link>
                {' '}{content[language].agreeTerms.includes('and') ? 'and' : 'और'}{' '}
                <Link to="/privacy" className="terms-link">{content[language].privacyPolicy}</Link>
              </label>
            </div>
            {errors.agreeTerms && (
              <span className="error-message">{errors.agreeTerms}</span>
            )}
            
            <button 
              type="submit" 
              className="btn-signup"
              disabled={isLoading}
            >
              {isLoading ? content[language].creatingAccount : content[language].signUp}
            </button>
          </form>
          
          <div className="login-link-container">
            <span className="login-text">
              {content[language].alreadyHaveAccount} <Link to="/login" className="login-link">{content[language].login}</Link>
            </span>
          </div>
        </div>
      </div>
      <Footer language={language} />
    </>
  );
}
