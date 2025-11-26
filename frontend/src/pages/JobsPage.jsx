import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NavigationBar from '../components/NavigationBar';
import Footer from '../components/Footer';
import { useAuthContext } from '../context/AuthContext';
import './JobsPage.css';

const JobsPage = () => {
  const [language, setLanguage] = useState('en');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showAddJobForm, setShowAddJobForm] = useState(false);
  const { currentUser, isAuthenticated } = useAuthContext();
  const [userType, setUserType] = useState(null); // 'worker' or 'contractor'
  
  // Content translations
  const content = {
    hi: {
      pageTitle: 'नौकरियां',
      search: 'नौकरियां खोजें...',
      addJob: 'नौकरी पोस्ट करें',
      categories: 'श्रेणियां',
      all: 'सभी',
      popular: 'लोकप्रिय नौकरियां',
      noJobs: 'कोई नौकरी उपलब्ध नहीं है',
      applyNow: 'अभी आवेदन करें',
      login: 'नौकरी पोस्ट करने के लिए लॉगिन करें',
      loading: 'लोड हो रहा है...',
      addNewJob: 'नई नौकरी जोड़ें',
      jobTitle: 'नौकरी का शीर्षक',
      jobDescription: 'नौकरी का विवरण',
      location: 'स्थान',
      salary: 'वेतन',
      category: 'श्रेणी',
      skillsRequired: 'आवश्यक कौशल',
      experience: 'अनुभव',
      submitJob: 'नौकरी जमा करें',
      cancel: 'रद्द करें',
      userTypeQuestion: 'आप क्या हैं?',
      worker: 'कर्मचारी',
      contractor: 'ठेकेदार',
      continueBtn: 'जारी रखें',
      workerInfo: 'कर्मचारी नौकरियों के लिए आवेदन कर सकते हैं',
      contractorInfo: 'ठेकेदार नौकरियां पोस्ट कर सकते हैं',
      categoryDriver: 'ड्राइवर',
      categoryCook: 'रसोइया',
      categoryCleaner: 'सफाईकर्मी',
      categoryGardener: 'माली',
      categoryPlumber: 'प्लंबर',
      categoryElectrician: 'इलेक्ट्रीशियन',
      categoryOther: 'अन्य',
      minAge: 'न्यूनतम आयु',
      availability: 'उपलब्धता',
      fullTime: 'पूर्णकालिक',
      partTime: 'अंशकालिक',
      weekends: 'सप्ताहांत',
      flexible: 'लचीला',
    },
    en: {
      pageTitle: 'Jobs',
      search: 'Search jobs...',
      addJob: 'Post a Job',
      categories: 'Categories',
      all: 'All',
      popular: 'Popular Jobs',
      noJobs: 'No jobs available',
      applyNow: 'Apply Now',
      login: 'Login to post jobs',
      loading: 'Loading...',
      addNewJob: 'Add New Job',
      jobTitle: 'Job Title',
      jobDescription: 'Job Description',
      location: 'Location',
      salary: 'Salary',
      category: 'Category',
      skillsRequired: 'Skills Required',
      experience: 'Experience',
      submitJob: 'Submit Job',
      cancel: 'Cancel',
      userTypeQuestion: 'What are you?',
      worker: 'Worker',
      contractor: 'Contractor',
      continueBtn: 'Continue',
      workerInfo: 'Workers can apply for jobs',
      contractorInfo: 'Contractors can post jobs',
      categoryDriver: 'Driver',
      categoryCook: 'Cook',
      categoryCleaner: 'Cleaner',
      categoryGardener: 'Gardener',
      categoryPlumber: 'Plumber',
      categoryElectrician: 'Electrician',
      categoryOther: 'Other',
      minAge: 'Minimum Age',
      availability: 'Availability',
      fullTime: 'Full-time',
      partTime: 'Part-time',
      weekends: 'Weekends',
      flexible: 'Flexible',
    }
  };

  // Sample job categories
  const categories = [
    { id: 'driver', nameEn: 'Driver', nameHi: 'ड्राइवर', icon: 'car' },
    { id: 'cook', nameEn: 'Cook', nameHi: 'रसोइया', icon: 'utensils' },
    { id: 'cleaner', nameEn: 'Cleaner', nameHi: 'सफाईकर्मी', icon: 'broom' },
    { id: 'gardener', nameEn: 'Gardener', nameHi: 'माली', icon: 'seedling' },
    { id: 'plumber', nameEn: 'Plumber', nameHi: 'प्लंबर', icon: 'wrench' },
    { id: 'electrician', nameEn: 'Electrician', nameHi: 'इलेक्ट्रीशियन', icon: 'bolt' },
    { id: 'other', nameEn: 'Other', nameHi: 'अन्य', icon: 'briefcase' },
  ];

  useEffect(() => {
    // Check if user has a language preference stored
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }

    // Load jobs
    fetchJobs();
    
    // Check user type if logged in
    if (isAuthenticated && currentUser) {
      checkUserType();
    }
  }, [isAuthenticated, currentUser]);

  const checkUserType = async () => {
    try {
      // In a real application, you would fetch this from your backend
      // For now, we'll use localStorage for demonstration purposes
      const type = localStorage.getItem('userType');
      if (type) {
        setUserType(type);
      }
    } catch (error) {
      console.error('Error checking user type:', error);
    }
  };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      // In a real app, you would fetch from your API
      // For now, we'll use mock data
      const mockJobs = [
        {
          id: 1,
          title: {
            en: "Driver",
            hi: "ड्राइवर",
          },
          description: {
            en: "Looking for experienced drivers for local deliveries",
            hi: "स्थानीय डिलीवरी के लिए अनुभवी ड्राइवरों की आवश्यकता है",
          },
          company: {
            en: "Fast Deliveries",
            hi: "फास्ट डिलीवरीज",
          },
          location: {
            en: "Mumbai, India",
            hi: "मुंबई, भारत",
          },
          salary: "₹15,000 - ₹20,000",
          category: "driver",
          icon: "car",
          minAge: 21,
          availability: "full-time",
          skillsRequired: ["Driving License", "2 Years Experience"],
          experience: "2+ years"
        },
        {
          id: 2,
          title: {
            en: "Cook",
            hi: "रसोइया",
          },
          description: {
            en: "Restaurant seeking experienced cook for Indian cuisine",
            hi: "रेस्तरां को भारतीय व्यंजनों के लिए अनुभवी रसोइया चाहिए",
          },
          company: {
            en: "Spice Garden Restaurant",
            hi: "स्पाइस गार्डन रेस्टोरेंट",
          },
          location: {
            en: "Delhi, India",
            hi: "दिल्ली, भारत",
          },
          salary: "₹18,000 - ₹25,000",
          category: "cook",
          icon: "utensils",
          minAge: 25,
          availability: "full-time",
          skillsRequired: ["Indian Cuisine", "Food Preparation"],
          experience: "3+ years"
        },
        {
          id: 3,
          title: {
            en: "Cleaner",
            hi: "सफाईकर्मी",
          },
          description: {
            en: "Office cleaner needed for daily cleaning",
            hi: "दैनिक सफाई के लिए कार्यालय सफाईकर्मी की आवश्यकता है",
          },
          company: {
            en: "CleanCorp Services",
            hi: "क्लीनकॉर्प सर्विसेज",
          },
          location: {
            en: "Bangalore, India",
            hi: "बैंगलोर, भारत",
          },
          salary: "₹12,000 - ₹15,000",
          category: "cleaner",
          icon: "broom",
          minAge: 18,
          availability: "part-time",
          skillsRequired: ["Cleaning Experience"],
          experience: "1+ years"
        },
        {
          id: 4,
          title: {
            en: "Gardener",
            hi: "माली",
          },
          description: {
            en: "Needed gardener for maintaining corporate garden",
            hi: "कॉर्पोरेट गार्डन के रखरखाव के लिए माली की आवश्यकता है",
          },
          company: {
            en: "WhiteSpace Inc",
            hi: "ग्रीनस्पेस इंक",
          },
          location: {
            en: "Pune, India",
            hi: "पुणे, भारत",
          },
          salary: "₹14,000 - ₹18,000",
          category: "gardener",
          icon: "seedling",
          minAge: 20,
          availability: "full-time",
          skillsRequired: ["Plant Knowledge", "Gardening Tools Experience"],
          experience: "2+ years"
        },
        {
          id: 5,
          title: {
            en: "Plumber",
            hi: "प्लंबर",
          },
          description: {
            en: "Experienced plumber needed for residential services",
            hi: "आवासीय सेवाओं के लिए अनुभवी प्लंबर की आवश्यकता है",
          },
          company: {
            en: "FixIt Plumbing",
            hi: "फिक्सइट प्लंबिंग",
          },
          location: {
            en: "Chennai, India",
            hi: "चेन्नई, भारत",
          },
          salary: "₹20,000 - ₹25,000",
          category: "plumber",
          icon: "wrench",
          minAge: 25,
          availability: "flexible",
          skillsRequired: ["Pipe Fitting", "Leak Repair", "Water Systems"],
          experience: "3+ years"
        },
        {
          id: 6,
          title: {
            en: "Electrician",
            hi: "इलेक्ट्रीशियन",
          },
          description: {
            en: "Electrician needed for commercial wiring projects",
            hi: "व्यावसायिक वायरिंग परियोजनाओं के लिए इलेक्ट्रीशियन की आवश्यकता है",
          },
          company: {
            en: "PowerTech Solutions",
            hi: "पावरटेक सॉल्यूशंस",
          },
          location: {
            en: "Hyderabad, India",
            hi: "हैदराबाद, भारत",
          },
          salary: "₹22,000 - ₹30,000",
          category: "electrician",
          icon: "bolt",
          minAge: 23,
          availability: "full-time",
          skillsRequired: ["Electrical Wiring", "Circuit Testing", "Safety Standards"],
          experience: "4+ years"
        }
      ];
      
      setJobs(mockJobs);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setLoading(false);
    }
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    localStorage.setItem('preferredLanguage', lang);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryFilter = (category) => {
    setFilterCategory(category);
  };

  const handleAddJob = () => {
    if (!isAuthenticated) {
      // Redirect to login
      return;
    }
    
    if (!userType) {
      // Show user type selection modal
      setShowUserTypeModal(true);
      return;
    }
    
    if (userType === 'contractor') {
      // Show add job form
      setShowAddJobForm(true);
    } else {
      // Show message that only contractors can post jobs
      alert(language === 'en' ? 'Only contractors can post jobs' : 'केवल ठेकेदार ही नौकरियां पोस्ट कर सकते हैं');
    }
  };

  const handleSubmitJob = (e) => {
    e.preventDefault();
    // In a real app, you would submit to your API
    alert(language === 'en' ? 'Job submitted successfully!' : 'नौकरी सफलतापूर्वक जमा की गई!');
    setShowAddJobForm(false);
    // Add job to list
    // In a real app, you would refetch the jobs or update the state with the new job
  };

  const [showUserTypeModal, setShowUserTypeModal] = useState(false);
  
  const handleUserTypeSelection = (type) => {
    setUserType(type);
    localStorage.setItem('userType', type);
    setShowUserTypeModal(false);
    
    if (type === 'contractor') {
      setShowAddJobForm(true);
    }
  };

  // Filter jobs based on search term and category
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.title[language].toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description[language].toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company[language].toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location[language].toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || job.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="jobs-page">
      <NavigationBar language={language} onLanguageChange={handleLanguageChange} />
      
      <div className="jobs-content">
        <div className="container">
          <div className="jobs-header">
            <h1>{content[language].pageTitle}</h1>
            
            <div className="jobs-actions">
              <div className="search-container">
                <input 
                  type="text" 
                  placeholder={content[language].search} 
                  value={searchTerm}
                  onChange={handleSearch}
                  className="search-input"
                />
                <i className="fas fa-search search-icon"></i>
              </div>
              
              <button className="post-job-button" onClick={handleAddJob}>
                <i className="fas fa-plus"></i> {content[language].addJob}
              </button>
            </div>
          </div>
          
          <div className="categories-section">
            <h2>{content[language].categories}</h2>
            <div className="categories-container">
              <div 
                className={`category-item ${filterCategory === 'all' ? 'active' : ''}`}
                onClick={() => handleCategoryFilter('all')}
              >
                <div className="category-icon">
                  <i className="fas fa-th-large"></i>
                </div>
                <span>{content[language].all}</span>
              </div>
              
              {categories.map(category => (
                <div 
                  key={category.id}
                  className={`category-item ${filterCategory === category.id ? 'active' : ''}`}
                  onClick={() => handleCategoryFilter(category.id)}
                >
                  <div className="category-icon">
                    <i className={`fas fa-${category.icon}`}></i>
                  </div>
                  <span>{language === 'en' ? category.nameEn : category.nameHi}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="jobs-listing">
            <h2>{content[language].popular}</h2>
            
            {loading ? (
              <div className="loading-container">
                <p>{content[language].loading}</p>
              </div>
            ) : filteredJobs.length > 0 ? (
              <div className="jobs-grid">
                {filteredJobs.map(job => (
                  <div className="job-card" key={job.id}>
                    <div className="job-card-header">
                      <div className="job-icon">
                        <i className={`fas fa-${job.icon}`}></i>
                      </div>
                      <h3 className="job-title">{job.title[language]}</h3>
                      <div className="job-company">{job.company[language]}</div>
                    </div>
                    
                    <div className="job-card-body">
                      <p className="job-description">{job.description[language]}</p>
                      
                      <div className="job-meta">
                        <div className="job-meta-item">
                          <i className="fas fa-map-marker-alt"></i>
                          <span>{job.location[language]}</span>
                        </div>
                        
                        <div className="job-meta-item">
                          <i className="fas fa-money-bill-wave"></i>
                          <span>{job.salary}</span>
                        </div>
                        
                        <div className="job-meta-item">
                          <i className="fas fa-clock"></i>
                          <span>{job.availability === 'full-time' ? (language === 'en' ? 'Full-time' : 'पूर्णकालिक') : 
                                 job.availability === 'part-time' ? (language === 'en' ? 'Part-time' : 'अंशकालिक') : 
                                 job.availability === 'weekends' ? (language === 'en' ? 'Weekends' : 'सप्ताहांत') :
                                 (language === 'en' ? 'Flexible' : 'लचीला')}</span>
                        </div>
                      </div>
                      
                      <div className="skills-container">
                        {job.skillsRequired.map((skill, index) => (
                          <span className="skill-tag" key={index}>{skill}</span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="job-card-footer">
                      <button className="apply-button">
                        {content[language].applyNow}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-jobs-container">
                <p>{content[language].noJobs}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Add Job Form Modal */}
      {showAddJobForm && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>{content[language].addNewJob}</h2>
              <button className="close-button" onClick={() => setShowAddJobForm(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <form onSubmit={handleSubmitJob}>
                <div className="form-group">
                  <label htmlFor="jobTitle">{content[language].jobTitle}</label>
                  <input type="text" id="jobTitle" required />
                </div>
                
                <div className="form-group">
                  <label htmlFor="jobDescription">{content[language].jobDescription}</label>
                  <textarea id="jobDescription" rows="4" required></textarea>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="location">{content[language].location}</label>
                    <input type="text" id="location" required />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="salary">{content[language].salary}</label>
                    <input type="text" id="salary" placeholder="₹15,000 - ₹20,000" required />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="category">{content[language].category}</label>
                    <select id="category" required>
                      <option value="driver">{content[language].categoryDriver}</option>
                      <option value="cook">{content[language].categoryCook}</option>
                      <option value="cleaner">{content[language].categoryCleaner}</option>
                      <option value="gardener">{content[language].categoryGardener}</option>
                      <option value="plumber">{content[language].categoryPlumber}</option>
                      <option value="electrician">{content[language].categoryElectrician}</option>
                      <option value="other">{content[language].categoryOther}</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="minAge">{content[language].minAge}</label>
                    <input type="number" id="minAge" min="18" required />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="availability">{content[language].availability}</label>
                  <select id="availability" required>
                    <option value="full-time">{content[language].fullTime}</option>
                    <option value="part-time">{content[language].partTime}</option>
                    <option value="weekends">{content[language].weekends}</option>
                    <option value="flexible">{content[language].flexible}</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="skillsRequired">{content[language].skillsRequired}</label>
                  <input type="text" id="skillsRequired" placeholder="Separate with commas" required />
                </div>
                
                <div className="form-group">
                  <label htmlFor="experience">{content[language].experience}</label>
                  <input type="text" id="experience" placeholder="e.g., 2+ years" required />
                </div>
                
                <div className="form-buttons">
                  <button type="button" className="cancel-button" onClick={() => setShowAddJobForm(false)}>
                    {content[language].cancel}
                  </button>
                  <button type="submit" className="submit-button">
                    {content[language].submitJob}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* User Type Selection Modal */}
      {showUserTypeModal && (
        <div className="modal-overlay">
          <div className="modal-container user-type-modal">
            <div className="modal-header">
              <h2>{content[language].userTypeQuestion}</h2>
              <button className="close-button" onClick={() => setShowUserTypeModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="user-type-options">
                <div className="user-type-option" onClick={() => handleUserTypeSelection('worker')}>
                  <div className="user-type-icon">
                    <i className="fas fa-hard-hat"></i>
                  </div>
                  <h3>{content[language].worker}</h3>
                  <p>{content[language].workerInfo}</p>
                </div>
                
                <div className="user-type-option" onClick={() => handleUserTypeSelection('contractor')}>
                  <div className="user-type-icon">
                    <i className="fas fa-building"></i>
                  </div>
                  <h3>{content[language].contractor}</h3>
                  <p>{content[language].contractorInfo}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <Footer language={language} />
    </div>
  );
};

export default JobsPage;
