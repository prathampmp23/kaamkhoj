import React, { useEffect, useState } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import NavigationBar from '../components/NavigationBar';
import Footer from '../components/Footer';
import './ProfilePage.css';

const ProfilePage = () => {
  // Auth context
  const { currentUser, isAuthenticated } = useAuthContext();
  
  // Navigation
  const navigate = useNavigate();
  
  // State variables
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('en');
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  // Content translations
  const content = {
    hi: {
      title: 'प्रोफाइल',
      loading: 'लोड हो रहा है...',
      notLoggedIn: 'आप लॉग इन नहीं हैं। कृपया पहले लॉगिन करें।',
      personalInfo: 'व्यक्तिगत जानकारी',
      name: 'नाम',
      email: 'ईमेल',
      skills: 'कौशल',
      education: 'शिक्षा',
      experience: 'अनुभव',
      noProfileFound: 'कोई प्रोफाइल नहीं मिला',
      loginPrompt: 'लॉगिन करने के लिए',
      clickHere: 'यहां क्लिक करें',
      recommendedJobs: 'अनुशंसित नौकरियां',
      noRecommendedJobs: 'कोई अनुशंसित नौकरी नहीं मिली',
      viewJob: 'नौकरी देखें',
      salary: 'वेतन',
      location: 'स्थान',
      workExperience: 'कार्य अनुभव',
      gender: 'लिंग',
      age: 'उम्र',
      phone: 'फोन नंबर',
      address: 'पता',
      availability: 'उपलब्धता',
      completeProfile: 'अपनी प्रोफाइल पूरी करें',
      updateProfile: 'प्रोफाइल अपडेट करें'
    },
    en: {
      title: 'Profile',
      loading: 'Loading...',
      notLoggedIn: 'You are not logged in. Please login first.',
      personalInfo: 'Personal Information',
      name: 'Name',
      email: 'Email',
      skills: 'Skills',
      education: 'Education',
      experience: 'Experience',
      noProfileFound: 'No profile found',
      loginPrompt: 'To login',
      clickHere: 'click here',
      recommendedJobs: 'Recommended Jobs',
      noRecommendedJobs: 'No recommended jobs found',
      viewJob: 'View Job',
      salary: 'Salary',
      location: 'Location',
      workExperience: 'Work Experience',
      gender: 'Gender',
      age: 'Age',
      phone: 'Phone Number',
      address: 'Address',
      availability: 'Availability',
      completeProfile: 'Complete Your Profile',
      updateProfile: 'Update Profile'
    }
  };

  // Handle language change
  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    localStorage.setItem('preferredLanguage', lang);
  };

  // Function to recommend jobs based on profile
  const recommendJobs = async (profileData) => {
    try {
      setLoadingJobs(true);
      
      // First try to get jobs from API
      try {
        const response = await fetch('http://localhost:5000/jobs');
        if (response.ok) {
          const allJobs = await response.json();
          
          // Filter jobs based on user skills
          let filteredJobs = [];
          
          if (profileData.skills && profileData.skills.length > 0) {
            // Normalize user skills to lowercase for matching
            const userSkills = Array.isArray(profileData.skills) 
              ? profileData.skills.map(skill => skill.toLowerCase())
              : profileData.skills.toLowerCase().split(',').map(s => s.trim());
            
            // Filter jobs that match user skills
            filteredJobs = allJobs.jobs?.filter(job => {
              // Check if job requirements match user skills
              if (job.requirements) {
                const jobRequirements = job.requirements.toLowerCase();
                return userSkills.some(skill => jobRequirements.includes(skill));
              }
              
              // Check if job title or description matches user skills
              return userSkills.some(skill => 
                job.title.toLowerCase().includes(skill) || 
                job.description.toLowerCase().includes(skill)
              );
            }) || [];
            
            // If no matches, just return some jobs
            if (filteredJobs.length === 0) {
              filteredJobs = allJobs.jobs?.slice(0, 3) || [];
            }
          } else {
            // If no skills, return sample jobs
            filteredJobs = allJobs.jobs?.slice(0, 3) || [];
          }
          
          setRecommendedJobs(filteredJobs);
        }
      } catch (error) {
        console.error('Error fetching jobs from API:', error);
        
        // Fallback to dummy jobs if API fails
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
    } catch (error) {
      console.error('Error recommending jobs:', error);
    } finally {
      setLoadingJobs(false);
    }
  };

  // Effect for loading language preference and authentication check
  useEffect(() => {
    // Check if user has a language preference stored
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Effect for fetching profile data
  useEffect(() => {
    // Only fetch profile if authenticated
    if (!isAuthenticated) return;

    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }
        
        // First try to get profile from local storage if available
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          
          try {
            // Try to fetch from API
            const response = await fetch(`http://localhost:5000/api/profile/${user.id}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (response.ok) {
              const data = await response.json();
              setProfile(data);
            } else {
              // If API fails, try from the assistant profile endpoint
              const assistantResponse = await fetch(`http://localhost:5000/profile/${user.id}`, {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
              
              if (assistantResponse.ok) {
                const assistantData = await assistantResponse.json();
                setProfile(assistantData);
              } else {
                // If both fail, create a dummy profile
                setProfile({
                  name: user.username || 'User',
                  email: user.email || 'No email provided',
                  skills: ['No skills added yet'],
                  education: [],
                  experience: [],
                  address: 'No address provided',
                  phone: 'No phone number provided',
                  gender: 'Not specified',
                  age: 'Not specified',
                  availability: 'Not specified',
                  workExperience: 'Not specified'
                });
              }
            }
          } catch (error) {
            console.error('Error fetching profile from API:', error);
            // Create dummy profile as fallback
            setProfile({
              name: user.username || 'User',
              email: user.email || 'No email provided',
              skills: ['No skills added yet'],
              education: [],
              experience: [],
              address: 'No address provided',
              phone: 'No phone number provided',
              gender: 'Not specified',
              age: 'Not specified',
              availability: 'Not specified',
              workExperience: 'Not specified'
            });
          }
        } else {
          throw new Error('User data not found');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated]);

  // Effect for recommending jobs when profile changes
  useEffect(() => {
    if (profile) {
      recommendJobs(profile);
    }
  }, [profile]);

  // Conditional rendering based on auth status and loading state
  if (!isAuthenticated) {
    return (
      <div className="profile-page">
        <NavigationBar language={language} onLanguageChange={handleLanguageChange} />
        <div className="profile-container">
          <div className="not-logged-in">
            <h2>{content[language].notLoggedIn}</h2>
            <p>
              {content[language].loginPrompt} <Link to="/login">{content[language].clickHere}</Link>
            </p>
          </div>
        </div>
        <Footer language={language} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="profile-page">
        <NavigationBar language={language} onLanguageChange={handleLanguageChange} />
        <div className="profile-container loading">
          <p>{content[language].loading}</p>
        </div>
        <Footer language={language} />
      </div>
    );
  }

  /* Removed duplicate function and useEffect */

  // Add job related translations
  content.hi.recommendedJobs = 'अनुशंसित नौकरियां';
  content.hi.noRecommendedJobs = 'कोई अनुशंसित नौकरी नहीं मिली';
  content.hi.viewJob = 'नौकरी देखें';
  content.hi.salary = 'वेतन';
  content.hi.location = 'स्थान';
  content.hi.workExperience = 'कार्य अनुभव';
  content.hi.gender = 'लिंग';
  content.hi.age = 'उम्र';
  content.hi.phone = 'फोन नंबर';
  content.hi.address = 'पता';
  content.hi.availability = 'उपलब्धता';
  content.hi.completeProfile = 'अपनी प्रोफाइल पूरी करें';
  content.hi.updateProfile = 'प्रोफाइल अपडेट करें';
  
  content.en.recommendedJobs = 'Recommended Jobs';
  content.en.noRecommendedJobs = 'No recommended jobs found';
  content.en.viewJob = 'View Job';
  content.en.salary = 'Salary';
  content.en.location = 'Location';
  content.en.workExperience = 'Work Experience';
  content.en.gender = 'Gender';
  content.en.age = 'Age';
  content.en.phone = 'Phone Number';
  content.en.address = 'Address';
  content.en.availability = 'Availability';
  content.en.completeProfile = 'Complete Your Profile';
  content.en.updateProfile = 'Update Profile';

  return (
    <div className="profile-page">
      <NavigationBar language={language} onLanguageChange={handleLanguageChange} />
      
      <div className="profile-container">
        <h1>{content[language].title}</h1>
        
        {profile ? (
          <div className="profile-content">
            <div className="profile-section personal-info">
              <h2>{content[language].personalInfo}</h2>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">{content[language].name}:</span>
                  <span className="value">{profile.name}</span>
                </div>
                <div className="info-item">
                  <span className="label">{content[language].email}:</span>
                  <span className="value">{currentUser?.email || profile.email || 'No email provided'}</span>
                </div>
                {profile.gender && (
                  <div className="info-item">
                    <span className="label">{content[language].gender}:</span>
                    <span className="value">{profile.gender}</span>
                  </div>
                )}
                {profile.age && (
                  <div className="info-item">
                    <span className="label">{content[language].age}:</span>
                    <span className="value">{profile.age}</span>
                  </div>
                )}
                {profile.phone && (
                  <div className="info-item">
                    <span className="label">{content[language].phone}:</span>
                    <span className="value">{profile.phone}</span>
                  </div>
                )}
                {profile.address && (
                  <div className="info-item">
                    <span className="label">{content[language].address}:</span>
                    <span className="value">{profile.address}</span>
                  </div>
                )}
                {profile.availability && (
                  <div className="info-item">
                    <span className="label">{content[language].availability}:</span>
                    <span className="value">{profile.availability}</span>
                  </div>
                )}
              </div>
            </div>

            {profile.workExperience && (
              <div className="profile-section">
                <h2>{content[language].workExperience}</h2>
                <p>{profile.workExperience}</p>
              </div>
            )}

            {profile.skills && (
              <div className="profile-section">
                <h2>{content[language].skills}</h2>
                <ul className="skills-list">
                  {Array.isArray(profile.skills) ? (
                    profile.skills.map((skill, index) => (
                      <li key={index} className="skill-item">{skill}</li>
                    ))
                  ) : (
                    <li className="skill-item">{profile.skills}</li>
                  )}
                </ul>
              </div>
            )}

            {profile.education && profile.education.length > 0 && (
              <div className="profile-section">
                <h2>{content[language].education}</h2>
                {profile.education.map((edu, index) => (
                  <div key={index} className="education-item">
                    <h3>{edu.degree}</h3>
                    <p>{edu.institution}</p>
                    <p>{edu.year}</p>
                  </div>
                ))}
              </div>
            )}

            {profile.experience && profile.experience.length > 0 && (
              <div className="profile-section">
                <h2>{content[language].experience}</h2>
                {profile.experience.map((exp, index) => (
                  <div key={index} className="experience-item">
                    <h3>{exp.position}</h3>
                    <p>{exp.company}</p>
                    <p>{exp.duration}</p>
                    <p>{exp.description}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="profile-actions">
              <Link to="/assistant" className="profile-action-btn">
                {content[language].updateProfile}
              </Link>
            </div>

            {/* Recommended Jobs Section */}
            <div className="profile-section recommended-jobs">
              <h2>{content[language].recommendedJobs}</h2>
              {loadingJobs ? (
                <p>{content[language].loading}</p>
              ) : recommendedJobs.length > 0 ? (
                <div className="jobs-grid">
                  {recommendedJobs.map(job => (
                    <div key={job.id} className="job-card">
                      <h3 className="job-title">{job.title}</h3>
                      <p className="job-description">{job.description}</p>
                      <div className="job-details">
                        {job.location && (
                          <p><i className="fas fa-map-marker-alt"></i> {job.location}</p>
                        )}
                        {job.salary && (
                          <p><i className="fas fa-money-bill-wave"></i> {job.salary}</p>
                        )}
                      </div>
                      <Link to={`/jobs?id=${job.id}`} className="view-job-btn">
                        {content[language].viewJob}
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-jobs-message">{content[language].noRecommendedJobs}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="no-profile">
            <p>{content[language].noProfileFound}</p>
            <Link to="/assistant" className="profile-action-btn">
              {content[language].completeProfile}
            </Link>
          </div>
        )}
      </div>
      
      <Footer language={language} />
    </div>
  );
};

export default ProfilePage;