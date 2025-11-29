import React from "react";
import "./JobListings.css";
import { Link, useNavigate } from "react-router-dom";

const JobListings = ({ title, showCount = 6, language = "hi" }) => {
  const navigate = useNavigate();

  const translations = {
    hi: {
      applyNow: "अभी आवेदन करें",
      viewAll: "सभी नौकरियां देखें",
    },
    en: {
      applyNow: "Apply Now",
      viewAll: "View All Jobs",
    },
  };

  // Sample job data
  const jobs = [
    {
      id: 1,
      title: {
        en: "Construction Worker",
        hi: "निर्माण कार्यकर्ता",
      },
      company: {
        en: "BuildIt Corp",
        hi: "बिल्डइट कॉर्प",
      },
      location: {
        en: "Mumbai, India",
        hi: "मुंबई, भारत",
      },
      icon: "hard-hat",
    },
    {
      id: 2,
      title: {
        en: "Factory Worker",
        hi: "फैक्टरी कार्यकर्ता",
      },
      company: {
        en: "MegaFactory Inc.",
        hi: "मेगाफैक्टरी इंक.",
      },
      location: {
        en: "Delhi, India",
        hi: "दिल्ली, भारत",
      },
      icon: "industry",
    },
    {
      id: 3,
      title: {
        en: "Delivery Driver",
        hi: "डिलीवरी ड्राइवर",
      },
      company: {
        en: "QuickShip",
        hi: "क्विकशिप",
      },
      location: {
        en: "Bangalore, India",
        hi: "बैंगलोर, भारत",
      },
      icon: "truck",
    },
    {
      id: 4,
      title: {
        en: "Plumber",
        hi: "प्लंबर",
      },
      company: {
        en: "FixIt Right",
        hi: "फिक्सइट राइट",
      },
      location: {
        en: "Mumbai, India",
        hi: "मुंबई, भारत",
      },
      icon: "wrench",
    },
    {
      id: 5,
      title: {
        en: "Electrician",
        hi: "इलेक्ट्रीशियन",
      },
      company: {
        en: "Sparky Services",
        hi: "स्पार्की सर्विसेज",
      },
      location: {
        en: "Delhi, India",
        hi: "दिल्ली, भारत",
      },
      icon: "bolt",
    },
    {
      id: 6,
      title: {
        en: "Carpenter",
        hi: "बढ़ई",
      },
      company: {
        en: "WoodWorks",
        hi: "वुडवर्क्स",
      },
      location: {
        en: "Bangalore, India",
        hi: "बैंगलोर, भारत",
      },
      icon: "hammer",
    },
  ];

  // Show only the requested number of jobs
  const displayedJobs = jobs.slice(0, showCount);

  return (
    <section className="job-listings-section">
      <div className="container">
        <h2 className="section-title">{title}</h2>

        <div className="job-cards-container">
          {displayedJobs.map((job) => (
            <div className="job-card" key={job.id}>
              <div className="job-icon">
                <i className={`fas fa-${job.icon}`}></i>
              </div>
              <div className="job-details">
                <h3 className="job-title">{job.title[language]}</h3>
                <div className="job-company">{job.company[language]}</div>
                <div className="job-location">
                  <i className="fas fa-map-marker-alt"></i>{" "}
                  {job.location[language]}
                </div>
              </div>
              <button className="job-apply-btn">
                {translations[language].applyNow}
              </button>
            </div>
          ))}
        </div>

        <div className="view-all-container">
          {/* <button className="view-all-btn"></button> */}
          <Link to="/jobs" className="view-all-btn">
            {translations[language].viewAll}{" "}
            <i className="fas fa-arrow-right"></i>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default JobListings;
