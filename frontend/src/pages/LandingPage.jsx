import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import NavigationBar from "../components/NavigationBar";
import HeroSection from "../components/HeroSection";
import JobListings from "../components/JobListings";
import AiAssistant from "../components/AiAssistant";
import Footer from "../components/Footer";
import "./LandingPage.css";

const LandingPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguage] = useState("en"); // Default language is English ('en')

  useEffect(() => {
    // Check if user has a language preference stored
    const savedLanguage = localStorage.getItem("preferredLanguage");
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }

    // Simulate loading time for components
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    localStorage.setItem("preferredLanguage", lang);
  };

  // Content translations
  const content = {
    hi: {
      brandName: "कामखोज",
      brandTagline: "रोज़गार का नया रास्ता",
      quickActions: {
        findJob: {
          title: "नौकरी खोजें",
          description: "अपने क्षेत्र में उपलब्ध नौकरियां देखें",
          button: "देखें",
        },
        voiceForm: {
          title: "आवाज से फॉर्म भरें",
          description: "बोलकर अपना विवरण जमा करें",
          button: "शुरू करें",
        },
        contact: {
          title: "संपर्क करें",
          description: "मदद के लिए हमसे बात करें",
          button: "कॉल करें",
        },
      },
      features: {
        title: "कामखोज के फायदे",
        list: [
          {
            title: "हिंदी और अंग्रेजी में",
            description: "अपनी भाषा में बात करें और काम खोजें",
          },
          {
            title: "बोलकर फॉर्म भरें",
            description: "टाइपिंग की जरूरत नहीं - बस बोलिए",
          },
          {
            title: "पास के काम",
            description: "अपने क्षेत्र में उपलब्ध नौकरियां खोजें",
          },
          {
            title: "सुरक्षित प्लेटफॉर्म",
            description: "विश्वसनीय नियोक्ताओं से जुड़ें",
          },
        ],
      },
      jobListings: "नौकरी के अवसर",
      cta: {
        title: "आज ही अपनी नई नौकरी खोजें",
        description: "हमारा AI सहायक आपको फॉर्म भरने में मदद करेगा",
        button: "अभी शुरू करें",
      },
      languageSelector: "भाषा बदलें",
    },
    en: {
      brandName: "KaamKhoj",
      brandTagline: "A New Path to Employment",
      quickActions: {
        findJob: {
          title: "Find Jobs",
          description: "View available jobs in your area",
          button: "View",
        },
        voiceForm: {
          title: "Voice Form",
          description: "Submit your details by speaking",
          button: "Start Now",
        },
        contact: {
          title: "Contact Us",
          description: "Talk to us for help",
          button: "Call",
        },
      },
      features: {
        title: "Benefits of KaamKhoj",
        list: [
          {
            title: "Hindi & English Support",
            description: "Communicate and find jobs in your language",
          },
          {
            title: "Voice-Based Forms",
            description: "No typing needed - just speak",
          },
          {
            title: "Nearby Jobs",
            description: "Find available jobs in your area",
          },
          {
            title: "Secure Platform",
            description: "Connect with trusted employers",
          },
        ],
      },
      jobListings: "Job Opportunities",
      cta: {
        title: "Find Your New Job Today",
        description: "Our AI assistant will help you fill forms",
        button: "Start Now",
      },
      languageSelector: "Change Language",
    },
  };

  return (
    <div className="landing-page">
      {isLoading ? (
        <div className="loader-container">
          <div className="loader"></div>
          <h2 className="brand-name">{content[language].brandName}</h2>
          <p className="brand-tagline">{content[language].brandTagline}</p>
        </div>
      ) : (
        <>
          <NavigationBar
            language={language}
            onLanguageChange={handleLanguageChange}
          />

          <main>
            <HeroSection language={language} />

            {/* <section className="quick-actions">
              <div className="container">
                <div className="action-card">
                  <div className="action-icon">
                    <i className="fas fa-search-location"></i>
                  </div>
                  <h3>{content[language].quickActions.findJob.title}</h3>
                  <p>{content[language].quickActions.findJob.description}</p>
                  <button className="action-btn">
                    {content[language].quickActions.findJob.button}
                  </button>
                </div>

                <div className="action-card highlight">
                  <div className="action-icon">
                    <i className="fas fa-microphone"></i>
                  </div>
                  <h3>{content[language].quickActions.voiceForm.title}</h3>
                  <p>{content[language].quickActions.voiceForm.description}</p>
                  <button className="action-btn">
                    {content[language].quickActions.voiceForm.button}
                  </button>
                </div>

                <div className="action-card">
                  <div className="action-icon">
                    <i className="fas fa-phone-alt"></i>
                  </div>
                  <h3>{content[language].quickActions.contact.title}</h3>
                  <p>{content[language].quickActions.contact.description}</p>
                  <button className="action-btn">
                    {content[language].quickActions.contact.button}
                  </button>
                </div>
              </div>
            </section> */}

            <section className="features-section">
              <div className="container">
                <h2 className="section-title">
                  {content[language].features.title}
                </h2>
                <div className="features-grid">
                  {content[language].features.list.map((feature, index) => (
                    <div className="feature" key={index}>
                      <div className="feature-icon">
                        <i
                          className={`fas fa-${
                            [
                              "language",
                              "volume-up",
                              "map-marker-alt",
                              "user-shield",
                            ][index]
                          }`}
                        ></i>
                      </div>
                      <h3>{feature.title}</h3>
                      <p>{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <AiAssistant language={language} />

            <JobListings
              title={content[language].jobListings}
              showCount={4}
              language={language}
            />

            <section className="ai-integration">
              <div className="container">
                <h2>
                  {language === "hi"
                    ? "बेहतर अनुभव के लिए"
                    : "For Better Experience"}
                </h2>
                <p>
                  {language === "hi"
                    ? "पूरी फंक्शनैलिटी के लिए AI असिस्टेंट पेज पर जाएं। वहां आप अपना प्रोफ़ाइल बना सकते हैं और अपने लिए नौकरियां खोज सकते हैं।"
                    : "Visit the AI Assistant page for full functionality. There you can create your profile and find jobs that match your skills."}
                </p>
                <Link
                  to={`/assistant?lang=${language}`}
                  className="ai-page-link"
                >
                  <button className="ai-page-btn">
                    {language === "hi"
                      ? "AI असिस्टेंट पेज पर जाएं"
                      : "Go to AI Assistant Page"}
                  </button>
                </Link>
              </div>
            </section>

            {/* <section className="cta-section">
              <div className="container">
                <h2>{content[language].cta.title}</h2>
                <p>{content[language].cta.description}</p>
                <button className="cta-button">
                  {content[language].cta.button}
                </button>
              </div>
            </section> */}
          </main>

          <Footer language={language} />
        </>
      )}
    </div>
  );
};

export default LandingPage;
