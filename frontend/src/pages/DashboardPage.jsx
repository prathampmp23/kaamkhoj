import React, { useEffect, useState } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import NavigationBar from '../components/NavigationBar';
import Footer from '../components/Footer';
import './DashboardPage.css';

const DashboardPage = () => {
  const { currentUser, isAuthenticated } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('en');
  const [profile, setProfile] = useState(null);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [recentActivities, setRecentActivities] = useState([]);
  const navigate = useNavigate();

  // Content translations
  const content = {
    hi: {
      title: 'डैशबोर्ड',
      loading: 'लोड हो रहा है...',
      welcome: 'आपका स्वागत है',
      recentActivity: 'हाल की गतिविधि',
      noActivity: 'कोई हाल की गतिविधि नहीं',
      jobApplications: 'नौकरी के आवेदन',
      savedJobs: 'सहेजे गए नौकरियां',
      profile: 'प्रोफाइल',
      viewProfile: 'प्रोफाइल देखें',
      editProfile: 'प्रोफाइल संपादित करें',
      name: 'नाम',
      skills: 'कौशल',
      recommendedJobs: 'अनुशंसित नौकरियां',
      viewAllJobs: 'सभी नौकरियां देखें',
      completeProfile: 'प्रोफ़ाइल पूरा करें',
      profileIncomplete: 'अपनी प्रोफ़ाइल अभी तक पूरी नहीं है',
      browseJobs: 'नौकरियां ब्राउज़ करें',
      viewDetails: 'विवरण देखें',
      aiAssistanceRequired: 'प्रोफ़ाइल के लिए AI सहायक का उपयोग करें',
      completeProfileWithAI: 'AI सहायक के साथ प्रोफ़ाइल पूरा करें',
      createProfileForJobs: 'व्यक्तिगत नौकरी सिफारिशें प्राप्त करने के लिए हमारे AI सहायक के साथ अपनी प्रोफ़ाइल बनाएं',
    },
    en: {
      title: 'Dashboard',
      loading: 'Loading...',
      welcome: 'Welcome',
      recentActivity: 'Recent Activity',
      noActivity: 'No recent activity',
      jobApplications: 'Job Applications',
      savedJobs: 'Saved Jobs',
      profile: 'Profile',
      viewProfile: 'View Profile',
      editProfile: 'Edit Profile',
      name: 'Name',
      skills: 'Skills',
      recommendedJobs: 'Recommended Jobs',
      viewAllJobs: 'View All Jobs',
      completeProfile: 'Complete Profile',
      profileIncomplete: 'Your profile is not complete yet',
      browseJobs: 'Browse Jobs',
      viewDetails: 'View Details',
      aiAssistanceRequired: 'Use AI Assistant to create your profile',
      completeProfileWithAI: 'Complete Profile with AI Assistant',
      createProfileForJobs: 'Create your profile with our AI Assistant to get personalized job recommendations',
    }
  };

  useEffect(() => {
    // Check if user has a language preference stored
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setLoading(false);
  }, [isAuthenticated, navigate]);
  
  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!isAuthenticated || !currentUser) return;
      
      setLoadingProfile(true);
      try {
        // Get profile from API
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (userData) {
          const user = JSON.parse(userData);
          
          try {
            // Try to fetch from API
            const response = await fetch(`http://localhost:5000/profile/${user.id}`, {
              headers: {
                'Authorization': `Bearer ${token || ''}`
              }
            });
            
            if (response.ok) {
              const data = await response.json();
              // Only set profile if it was created through AI assistance
              if (data.createdThroughAI) {
                setProfile(data);
                
                // Generate some recent activities
                setRecentActivities([
                  {
                    id: 1,
                    type: 'profile_update',
                    date: new Date().toLocaleDateString(),
                    message: language === 'hi' ? 'आपने अपनी प्रोफ़ाइल अपडेट की' : 'You updated your profile'
                  },
                  {
                    id: 2,
                    type: 'job_view',
                    date: new Date(Date.now() - 86400000).toLocaleDateString(),
                    message: language === 'hi' ? 'आपने एक नौकरी देखी' : 'You viewed a job'
                  }
                ]);
                
                // Fetch recommended jobs based on AI-created profile
                try {
                  const jobsResponse = await fetch('http://localhost:5000/jobs');
                  if (jobsResponse.ok) {
                    const jobsData = await jobsResponse.json();
                    // Filter jobs based on skills if available
                    if (data.skills && jobsData.jobs) {
                      const userSkills = Array.isArray(data.skills) 
                        ? data.skills.map(s => s.toLowerCase())
                        : data.skills.toLowerCase().split(',').map(s => s.trim());
                        
                      const matchedJobs = jobsData.jobs.filter(job => {
                        return userSkills.some(skill => 
                          job.title.toLowerCase().includes(skill) || 
                          job.description.toLowerCase().includes(skill)
                        );
                      });
                      
                      setRecommendedJobs(matchedJobs.slice(0, 3));
                    } else {
                      setRecommendedJobs(jobsData.jobs?.slice(0, 3) || []);
                    }
                  }
                } catch (jobError) {
                  console.error('Error fetching jobs:', jobError);
                  // Set dummy jobs as fallback
                  setRecommendedJobs([
                    {
                      id: '1',
                      title: language === 'hi' ? 'ड्राइवर की नौकरी' : 'Driver Job',
                      description: language === 'hi' ? 'ऑफिस के लिए ड्राइवर की आवश्यकता है' : 'Driver needed for office commute',
                      location: 'Mumbai',
                      salary: '₹15,000 - ₹20,000',
                    },
                    {
                      id: '2',
                      title: language === 'hi' ? 'रसोइया की नौकरी' : 'Cook Job',
                      description: language === 'hi' ? 'रेस्टोरेंट के लिए रसोइया चाहिए' : 'Cook needed for restaurant',
                      location: 'Delhi',
                      salary: '₹18,000 - ₹25,000',
                    }
                  ]);
                }
              } else {
                // Profile exists but not through AI assistance
                setProfile(null);
                setRecommendedJobs([]);
              }
            }
          } catch (error) {
            console.error('Error fetching profile:', error);
            setProfile(null);
            setRecommendedJobs([]);
          }
        }
      } catch (error) {
        console.error('Error in profile fetch:', error);
        setProfile(null);
        setRecommendedJobs([]);
      } finally {
        setLoadingProfile(false);
      }
    };
    
    fetchProfileData();
  }, [isAuthenticated, currentUser, language]);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    localStorage.setItem('preferredLanguage', lang);
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <NavigationBar language={language} onLanguageChange={handleLanguageChange} />
        <div className="dashboard-container loading">
          <p>{content[language].loading}</p>
        </div>
        <Footer language={language} />
      </div>
    );
  }

  // Content translations are now defined at the top of the component

  return (
    <div className="dashboard-page">
      <NavigationBar language={language} onLanguageChange={handleLanguageChange} />
      
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>{content[language].title}</h1>
          <p>{content[language].welcome}, {currentUser?.username || profile?.name || 'User'}!</p>
        </div>
        
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <div className="card-header">
              <h2>{content[language].recentActivity}</h2>
              <span className="badge">{recentActivities.length}</span>
            </div>
            <div className="card-body">
              {recentActivities.length > 0 ? (
                <ul className="activity-list">
                  {recentActivities.map(activity => (
                    <li key={activity.id} className="activity-item">
                      <div className="activity-date">{activity.date}</div>
                      <div className="activity-message">{activity.message}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>{content[language].noActivity}</p>
              )}
            </div>
          </div>
          
          <div className="dashboard-card">
            <div className="card-header">
              <h2>{content[language].jobApplications}</h2>
              <span className="badge">0</span>
            </div>
            <div className="card-body">
              <p>{content[language].noActivity}</p>
              <div className="card-actions">
                <button 
                  className="action-button secondary"
                  onClick={() => navigate('/jobs')}
                >
                  {content[language].browseJobs}
                </button>
              </div>
            </div>
          </div>
          
          <div className="dashboard-card">
            <div className="card-header">
              <h2>{content[language].profile}</h2>
            </div>
            <div className="card-body">
              {loadingProfile ? (
                <p>{content[language].loading}</p>
              ) : profile ? (
                <>
                  <div className="profile-summary">
                    <p><strong>{content[language].name}:</strong> {profile.name}</p>
                    {profile.skills && (
                      <p><strong>{content[language].skills}:</strong> {Array.isArray(profile.skills) ? profile.skills.join(', ') : profile.skills}</p>
                    )}
                  </div>
                  <div className="action-buttons">
                    <button 
                      className="action-button primary"
                      onClick={() => navigate('/profile')}
                    >
                      {content[language].viewProfile}
                    </button>
                    <button 
                      className="action-button secondary"
                      onClick={() => navigate('/assistant')}
                    >
                      {content[language].editProfile}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="profile-incomplete">{content[language].profileIncomplete}</p>
                  <p className="ai-assistance-message">{content[language].aiAssistanceRequired}</p>
                  <div className="action-buttons">
                    <button 
                      className="action-button primary ai-button"
                      onClick={() => navigate('/assistant')}
                    >
                      {content[language].completeProfileWithAI}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Recommended Jobs Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>{content[language].recommendedJobs}</h2>
            <button 
              className="view-all-btn"
              onClick={() => navigate('/jobs')}
            >
              {content[language].viewAllJobs}
            </button>
          </div>
          
          <div className="jobs-grid">
            {recommendedJobs.length > 0 ? (
              recommendedJobs.map(job => (
                <div key={job.id} className="job-card">
                  <h3>{job.title}</h3>
                  <p className="job-description">{job.description}</p>
                  <div className="job-details">
                    {job.location && <p><i className="fas fa-map-marker-alt"></i> {job.location}</p>}
                    {job.salary && <p><i className="fas fa-money-bill-wave"></i> {job.salary}</p>}
                  </div>
                  <button
                    className="job-action-btn"
                    onClick={() => navigate(`/jobs?id=${job.id}`)}
                  >
                    {content[language].viewDetails}
                  </button>
                </div>
              ))
            ) : profile ? (
              <div className="no-jobs-message">
                <p>{content[language].noActivity}</p>
              </div>
            ) : (
              <div className="no-jobs-message ai-message">
                <p>{content[language].createProfileForJobs}</p>
                <button 
                  className="action-button ai-button"
                  onClick={() => navigate('/assistant')}
                >
                  {content[language].completeProfileWithAI}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer language={language} />
    </div>
  );
};

export default DashboardPage;