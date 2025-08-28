import React from "react";
import "./HeroSection.css";

const HeroSection = ({ language = "hi" }) => {
  const translations = {
    hi: {
      title: "अपनी सही नौकरी खोजें",
      subtitle: "आवाज से फॉर्म भरें और अपनी नई नौकरी तक पहुंचें",
      searchPlaceholder: "स्किल या शहर के नाम से खोजें",
      searchButton: "खोजें",
      popularSearches: "लोकप्रिय खोजें",
      popularTags: [
        "ड्राइवर",
        "कुक",
        "क्लीनर",
        "गार्डनर",
        "प्लंबर",
        "इलेक्ट्रीशियन",
      ],
    },
    en: {
      title: "Find Your Perfect Job",
      subtitle: "Fill forms using voice and reach your new job",
      searchPlaceholder: "Search by skill or city",
      searchButton: "Search",
      popularSearches: "Popular Searches",
      popularTags: [
        "Driver",
        "Cook",
        "Cleaner",
        "Gardener",
        "Plumber",
        "Electrician",
      ],
    },
  };

  return (
    <section className="hero-section">
      <div className="hero-overlay"></div>
      <div className="container">
        <div className="hero-content">
          <h1 className="hero-title">{translations[language].title}</h1>
          <p className="hero-subtitle">{translations[language].subtitle}</p>

          <div className="search-box">
            <input
              type="text"
              placeholder={translations[language].searchPlaceholder}
              className="search-input"
            />
            <button className="search-button">
              <i className="fas fa-search"></i>{" "}
              {translations[language].searchButton}
            </button>
          </div>

          <div className="popular-searches">
            <span>{translations[language].popularSearches}: </span>
            <div className="popular-tags">
              {translations[language].popularTags.map((tag, index) => (
                <a href="#" className="tag" key={index}>
                  {tag}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
