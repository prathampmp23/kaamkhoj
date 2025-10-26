import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./AiAssistantPage.css";
import { useLocation } from "react-router-dom";
import NavigationBar from "../components/NavigationBar";

function App() {
  const [text, setText] = useState("");
  const [response, setResponse] = useState("");
  const location = useLocation();
  // Get language preference from localStorage, URL parameters, or default to English
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem("preferredLanguage");
    const urlParams = new URLSearchParams(location.search);
    const langParam = urlParams.get("lang");

    if (langParam === "hi") return "hi-IN";
    if (langParam === "en") return "en-IN";
    if (savedLanguage === "hi") return "hi-IN";
    if (savedLanguage === "en") return "en-IN";
    return "en-IN"; // default English
  });

  // Helper functions to convert between language formats
  const getNavLanguage = () => (language === "hi-IN" ? "hi" : "en");
  const handleNavLanguageChange = (navLang) => {
    const newLang = navLang === "hi" ? "hi-IN" : "en-IN";
    setLanguage(newLang);
    localStorage.setItem("preferredLanguage", navLang);
  };
  const recognitionRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState("name");
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    age: "",
    address: "",
    phone: "",
    workExperience: "",
    skills: "",
    availability: "",
  });
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submittedUserId, setSubmittedUserId] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [jobListings, setJobListings] = useState([]);
  const [showJobs, setShowJobs] = useState(false);
  const [retryCount, setRetryCount] = useState({
    name: 0,
    gender: 0,
    age: 0,
    address: 0,
    phone: 0,
    workExperience: 0,
    skills: 0,
    availability: 0,
  });

  // Refs for tracking state between renders
  const hasInitialized = useRef(false);
  const isInitialLanguageRender = useRef(true);
  const inputDebounceTimers = useRef({});

  // Define questions in English and Hindi
  const questionsEN = {
    name: "What is your name? You can say 'My name is' followed by your name.",
    gender: "What is your gender?",
    age: "What is your age?",
    address:
      "What is your address? Please include house number, street, city and state.",
    phone: "What is your phone number?",
    workExperience: "How many years of work experience do you have?",
    skills: "What are your skills?",
    availability: "What is your availability?",
  };

  const questionsHI = {
    name: "आपका नाम क्या है? आप 'मेरा नाम' के बाद अपना नाम बोल सकते हैं।",
    gender: "आपका लिंग क्या है?",
    age: "आपकी उम्र क्या है?",
    address:
      "आपका पता क्या है? कृपया घर का नंबर, सड़क, शहर और राज्य शामिल करें।",
    phone: "आपका फोन नंबर क्या है?",
    workExperience: "आपके पास कितने साल का कार्य अनुभव है?",
    skills: "आपके कौशल क्या हैं?",
    availability: "आपकी उपलब्धता क्या है?",
  };

  // Select questions based on language
  const questions = language === "hi-IN" ? questionsHI : questionsEN;

  // Function to submit form data to backend
  const submitFormData = async (data) => {
    try {
      // Check if user is logged in and add their ID to the form data
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        data.authUserId = user.id;
      }
      
      const response = await axios.post(
        "http://localhost:5000/saveProfile",
        data
      );
      return {
        success: true,
        userId: response.data.user._id,
        user: response.data.user,
      };
    } catch (error) {
      console.error("Error submitting form:", error);
      return { success: false, error: error.message };
    }
  };

  // Function to fetch job listings
  const fetchJobListings = async () => {
    try {
      const response = await axios.get("http://localhost:5000/jobs");
      return response.data.jobs;
    } catch (error) {
      console.error("Error fetching job listings:", error);
      return [];
    }
  };

  // Function to handle form submission
  const handleFormSubmit = async () => {
    // Check if already submitting
    if (isSubmitting) return;

    // Check if all required fields are filled
    const requiredFields = ["name", "gender", "age", "address", "phone"];
    const missingFields = requiredFields.filter(
      (field) => !formData[field] || formData[field].trim() === ""
    );

    if (missingFields.length > 0) {
      // Format missing field names to be more user-friendly
      const formattedMissingFields = missingFields.map((field) => {
        return language === "hi-IN"
          ? {
              name: "नाम",
              gender: "लिंग",
              age: "उम्र",
              address: "पता",
              phone: "फोन नंबर",
            }[field]
          : field
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, (str) => str.toUpperCase());
      });

      // Some required fields are missing
      const missingFieldsMessage =
        language === "hi-IN"
          ? `कृपया निम्नलिखित आवश्यक फ़ील्ड भरें: ${formattedMissingFields.join(
              ", "
            )}`
          : `Please fill in the following required fields: ${formattedMissingFields.join(
              ", "
            )}`;

      addToConversation("assistant", missingFieldsMessage);
      speakText(missingFieldsMessage);
      return false;
    }

    // Set loading state
    setIsSubmitting(true);

    // Show loading message
    const loadingMessage =
      language === "hi-IN"
        ? "आपका फॉर्म जमा किया जा रहा है..."
        : "Submitting your form...";

    addToConversation("assistant", loadingMessage);
    speakText(loadingMessage);

    try {
      // Submit the form data
      const result = await submitFormData(formData);

      if (result.success) {
        // Store the user ID and profile data
        setSubmittedUserId(result.userId);
        setUserProfile(result.user);

        // Fetch job listings after successful form submission
        const jobs = await fetchJobListings();
        setJobListings(jobs);

        // Success message
        const successMessage =
          language === "hi-IN"
            ? "आपका फॉर्म सफलतापूर्वक जमा किया गया है! धन्यवाद। नीचे स्क्रॉल करके अपना प्रोफ़ाइल देखें और उपलब्ध नौकरियां देखें।"
            : "Your form has been successfully submitted! Thank you. Scroll down to see your profile and available jobs.";

        addToConversation("assistant", successMessage);
        speakText(successMessage);
        setFormSubmitted(true);
        return true;
      } else {
        // Error message
        const errorMessage =
          language === "hi-IN"
            ? "फॉर्म जमा करने में त्रुटि। कृपया पुनः प्रयास करें।"
            : "Error submitting form. Please try again.";

        addToConversation("assistant", errorMessage);
        speakText(errorMessage);
        return false;
      }
    } catch (error) {
      console.error("Form submission error:", error);
      const errorMessage =
        language === "hi-IN"
          ? "फॉर्म जमा करने में त्रुटि। कृपया पुनः प्रयास करें।"
          : "Error submitting form. Please try again.";

      addToConversation("assistant", errorMessage);
      speakText(errorMessage);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to initialize speech synthesis after user interaction
  const initializeVoiceSynthesis = () => {
    if (!window.speechSynthesis) return;
    
    // Pre-load voices to avoid delays later
    window.speechSynthesis.getVoices();
    
    // Speak a silent utterance to grant permission
    const silentUtterance = new SpeechSynthesisUtterance('');
    silentUtterance.volume = 0;
    window.speechSynthesis.speak(silentUtterance);
    
    console.log("Voice synthesis initialized after user interaction");
    
    // Remove the click event listener after initialization
    document.removeEventListener('click', initializeVoiceSynthesis);
  };
  
  // Add click listener to initialize speech synthesis on first user interaction
  useEffect(() => {
    document.addEventListener('click', initializeVoiceSynthesis);
    return () => {
      document.removeEventListener('click', initializeVoiceSynthesis);
    };
  }, []);
  
  // Cleanup effect - stop speech synthesis and recognition when component unmounts
  useEffect(() => {
    return () => {
      // Cancel any ongoing speech
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      
      // Cancel any ongoing recognition
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      
      console.log("AI Assistant component unmounted - voice services cleaned up");
    };
  }, []);
  
  // Start the conversation when component mounts
  useEffect(() => {
    // Only proceed if we haven't initialized yet and we're on the assistant page
    if (hasInitialized.current || !window.location.pathname.includes('/assistant')) return;

    // Initialize speech synthesis
    const initConversation = () => {
      // Mark as initialized immediately to prevent any possibility of double initialization
      hasInitialized.current = true;

      console.log("Initializing conversation...");

      // Start the conversation with the initial question after a delay
      setTimeout(() => {
        // Clear any existing history first
        setConversationHistory([]);

        // Then add the initial question
        const initialQuestion = questions[currentQuestion];
        console.log("Speaking initial question:", initialQuestion);
        addToConversation("assistant", initialQuestion);
        
        // Automatically speak the initial question
        // We'll use a silent utterance first to get permission
        const silentUtterance = new SpeechSynthesisUtterance(" ");
        window.speechSynthesis.speak(silentUtterance);
        
        // Then speak the initial question - no automatic listening
        setTimeout(() => {
          speakText(initialQuestion);
          // Don't automatically start listening - wait for user to click the speak button
        }, 500);
      }, 1000);
    };

    // Use a timeout approach instead of relying on the onvoiceschanged event
    if (window.speechSynthesis) {
      // Force voices to load
      window.speechSynthesis.getVoices();

      // Set a timeout to ensure voices are loaded
      setTimeout(() => {
        // Clean up any previous event listeners
        window.speechSynthesis.onvoiceschanged = null;

        // Initialize the conversation
        initConversation();
      }, 800);
    }

    // Cleanup
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
        window.speechSynthesis.cancel(); // Cancel any ongoing speech
      }
    };
  }, []);

  // When currentQuestion changes, ask the new question
  useEffect(() => {
    if (conversationHistory.length > 0) {
      // Skip the initial mount effect
      // For address field, provide extra guidance
      if (currentQuestion === "address") {
        const addressTip =
          language === "hi-IN"
            ? "कृपया अपने घर का नंबर, सड़क का नाम, शहर और राज्य शामिल करें।"
            : "Please include your house number, street name, city, and state.";
        addToConversation("assistant", addressTip);
      }
    }
  }, [currentQuestion]);

  // Function to speak text
  const speakText = (text) => {
    if (!text) return;
    
    // Skip speech if the browser doesn't support it
    if (!window.speechSynthesis) {
      console.error("Speech synthesis not supported in this browser");
      return;
    }
    
    // Set the speaking flag to true
    setIsSpeaking(true);

    try {
      const synth = window.speechSynthesis;

      // Clear any existing speech
      synth.cancel();
      
      // Reset speaking state if there was any ongoing speech
      setTimeout(() => {
        setIsSpeaking(false);
      }, 100);
      
      // Check if speech synthesis is allowed
      if (document.visibilityState !== 'visible') {
        console.warn("Speech synthesis might be blocked because the page is not visible");
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;

      // Get available voices
      const voices = synth.getVoices();
      console.log("Available voices:", voices.length);

      // Try to find a voice matching the selected language
      let voice = null;
      if (language === "hi-IN") {
        // Look for Hindi voice
        voice = voices.find((v) => v.lang === "hi-IN" || v.lang.startsWith("hi"));
        console.log("Selected Hindi voice:", voice?.name || "None found");
      } else {
        // Look for English voice - try multiple English variants
        voice = voices.find(
          (v) =>
            v.lang === "en-US" ||
            v.lang === "en-GB" ||
            v.lang === "en-IN" ||
            v.lang.startsWith("en")
        );
        console.log("Selected English voice:", voice?.name || "None found");
      }

      // Set the voice if found
      if (voice) {
        utterance.voice = voice;
      }

      // Adjust speech rate slightly slower for better clarity
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Handle errors
      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event);
        if (event.error === 'not-allowed') {
          console.warn("Speech synthesis permission denied. This typically happens when there was no user interaction before speech synthesis was triggered.");
        }
      };
      
      // Add end event to log completion and reset speaking state
      utterance.onend = () => {
        console.log("Speech synthesis completed successfully");
        // Add a short delay before setting isSpeaking to false to prevent immediate listening
        setTimeout(() => {
          setIsSpeaking(false);
        }, 500);
      };

      // Try to speak with user gesture flag
      try {
        // Speak the text only if the user has interacted with the page
        if (document.hasFocus()) {
          synth.speak(utterance);
        } else {
          console.warn("Speech synthesis skipped because page does not have focus");
        }
      } catch (speakError) {
        console.error("Error during speak:", speakError);
      }
      
      // If not speaking after 100ms, try the fallback
      setTimeout(() => {
        if (!synth.speaking && voices.length > 0) {
          console.log("Using fallback speech method");
          try {
            synth.speak(utterance);
          } catch (fallbackError) {
            console.error("Fallback speech method error:", fallbackError);
          }
        }
      }, 100);
    } catch (error) {
      console.error("Speech synthesis setup error:", error);
    }
  };

  // When language changes, update the UI and speak the current question in the new language
  useEffect(() => {
    // Only respond to actual language changes after initial mount
    if (isInitialLanguageRender.current) {
      isInitialLanguageRender.current = false;
      return;
    }

    if (conversationHistory.length > 0) {
      // Speak the current question in the new language
      const currentQ = questions[currentQuestion];
      if (currentQ) {
        console.log("Language changed, speaking:", currentQ);
        speakText(currentQ);

        // Clear recent assistant messages before adding the new one
        setConversationHistory((prev) => {
          // Keep only user messages and remove the last assistant message
          const filtered = prev.filter(
            (item, index) =>
              item.sender !== "assistant" || index < prev.length - 1
          );
          return [...filtered, { sender: "assistant", message: currentQ }];
        });
      }
    }
  }, [language]);

  // Cleanup any pending timers when component unmounts
  useEffect(() => {
    return () => {
      // Clear all debounce timers
      Object.keys(inputDebounceTimers.current).forEach((key) => {
        if (inputDebounceTimers.current[key]) {
          clearTimeout(inputDebounceTimers.current[key]);
        }
      });
    };
  }, []);

  // Add message to conversation history
  const addToConversation = (sender, message) => {
    // Check if this exact message from the same sender is already the last message in the history
    setConversationHistory((prev) => {
      if (
        prev.length > 0 &&
        prev[prev.length - 1].sender === sender &&
        prev[prev.length - 1].message === message
      ) {
        // Don't add duplicate consecutive messages
        return prev;
      }
      return [...prev, { sender, message }];
    });
  };

  // Function to handle moving to the next field after input
  const moveToNextField = (value, field) => {
    // Confirm the current value
    const message =
      language === "hi-IN"
        ? `${value} को ${field} के रूप में दर्ज किया गया है।`
        : `${value} has been recorded as your ${field}.`;

    addToConversation("assistant", message);
    speakText(message);

    // Find and move to the next question
    const fields = Object.keys(questions);
    const currentIndex = fields.indexOf(field);

    if (currentIndex < fields.length - 1) {
      const nextField = fields[currentIndex + 1];
      setCurrentQuestion(nextField);

      // Speak the next question
      setTimeout(() => {
        const nextQuestion = questions[nextField];
        speakText(nextQuestion);
        addToConversation("assistant", nextQuestion);
      }, 1500);
    } else {
      // Form completed
      const completionMessage =
        language === "hi-IN"
          ? "धन्यवाद! आपकी जानकारी सहेज ली गई है।"
          : "Thank you! Your information has been saved.";
      speakText(completionMessage);
      addToConversation("assistant", completionMessage);
    }
  };

  // Flag to track if speech synthesis is active
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Start speech recognition - only triggered by user clicking the speak button
  const startListening = () => {
    // Make sure any existing speech is canceled before starting listening
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    
    // Don't start listening if already listening
    if (isListening) {
      console.log("Already listening");
      return;
    }
    
    // Don't start listening if speech synthesis is still active
    if (isSpeaking) {
      console.log("Speech synthesis is active, please wait until it finishes");
      alert(language === "hi-IN" 
        ? "कृपया सहायक के बोलने के समाप्त होने तक प्रतीक्षा करें" 
        : "Please wait until the assistant finishes speaking");
      return;
    }
    
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser.");
      return;
    }
    
    // Only activate speech recognition on the assistant page
    if (!window.location.pathname.includes('/assistant')) {
      console.log("Speech recognition only available on assistant page");
      return;
    }
    
    // Set listening state to true to update UI
    setIsListening(true);
    console.log("Starting listening - microphone activated");
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = language;
    recognitionRef.current.continuous = false;

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setText(transcript);
      addToConversation("user", transcript);

      // Send text to backend for processing
      fetch("http://localhost:5000/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: transcript,
          lang: language,
          currentField: currentQuestion,
          retryCount: retryCount[currentQuestion],
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          setResponse(data.reply);

          // Update form data with the extracted information
          if (data.extractedValue) {
            setFormData((prev) => ({
              ...prev,
              [currentQuestion]: data.extractedValue,
            }));
          }

          // Move to the next question if value was successfully extracted
          if (data.success) {
            // Reset retry count for this field
            setRetryCount((prev) => ({
              ...prev,
              [currentQuestion]: 0,
            }));

            // Find the next question
            const fields = Object.keys(questions);
            const currentIndex = fields.indexOf(currentQuestion);

            if (currentIndex < fields.length - 1) {
              const nextField = fields[currentIndex + 1];
              setCurrentQuestion(nextField);

              // Speak the next question - no automatic listening
              setTimeout(() => {
                const nextQuestion = questions[nextField];
                speakText(nextQuestion);
                addToConversation("assistant", nextQuestion);
                
                // Don't automatically start listening - wait for user to click the speak button
                // Keep this comment for documentation purposes
              
              }, 1500);
            } else {
              // Form completed
              const completionMessage =
                "Thank you! Your information has been saved.";
              speakText(completionMessage);
              addToConversation("assistant", completionMessage);
            }
          } else {
            // Increment retry count for this field
            setRetryCount((prev) => ({
              ...prev,
              [currentQuestion]: prev[currentQuestion] + 1,
            }));

            // Ask the same question again if value couldn't be extracted
            setTimeout(() => {
              // Special handling for name field - be more persistent
              if (currentQuestion === "name") {
                let nameRetryMessage;
                const count = retryCount.name + 1; // +1 because we just incremented it

                if (language === "hi-IN") {
                  if (count === 1) {
                    nameRetryMessage =
                      "मुझे आपका नाम समझ नहीं आया। कृपया अपना नाम स्पष्ट रूप से बताएं, 'मेरा नाम' के साथ शुरू करें।";
                  } else if (count === 2) {
                    nameRetryMessage =
                      "एक बार फिर कोशिश करते हैं। कृपया अपना पूरा नाम स्पष्ट रूप से बताएं। उदाहरण के लिए, 'मेरा नाम राहुल शर्मा है'।";
                  } else if (count >= 3) {
                    nameRetryMessage =
                      "मुझे समझने में कठिनाई हो रही है। कृपया बिना किसी अन्य शब्द के सिर्फ अपना नाम बताएं।";
                  }
                } else {
                  if (count === 1) {
                    nameRetryMessage =
                      "I still didn't catch your name. Please say your name clearly, starting with 'My name is'.";
                  } else if (count === 2) {
                    nameRetryMessage =
                      "Let's try once more. Please say your full name clearly. For example, 'My name is John Smith'.";
                  } else if (count >= 3) {
                    nameRetryMessage =
                      "I'm having trouble understanding. Please simply state your name without any other words.";
                  }
                }

                speakText(nameRetryMessage);
                addToConversation("assistant", nameRetryMessage);
                
                // Don't automatically start listening - wait for user to click the speak button
                // Keep this comment for documentation purposes
              }
              // Special handling for address field
              else if (currentQuestion === "address") {
                let addressRetryMessage;
                const count = retryCount.address + 1;

                if (language === "hi-IN") {
                  if (count === 1) {
                    addressRetryMessage =
                      "मुझे आपका पता ठीक से नहीं मिला। कृपया अपना पूरा पता बताएं जिसमें घर का नंबर, सड़क, शहर और राज्य शामिल हो।";
                  } else if (count === 2) {
                    addressRetryMessage =
                      "फिर से कोशिश करते हैं। 'मेरा पता है' से शुरू करें और फिर अपना पूरा पता बताएं।";
                  } else if (count >= 3) {
                    addressRetryMessage =
                      "मुझे अभी भी समस्या हो रही है। कृपया अपना पता धीरे-धीरे और स्पष्ट रूप से बताएं, एक हिस्सा एक बार में।";
                  }
                } else {
                  if (count === 1) {
                    addressRetryMessage =
                      "I didn't quite get your address. Please provide your complete address including house number, street, city and state.";
                  } else if (count === 2) {
                    addressRetryMessage =
                      "Let's try again. Start with 'My address is' and then say your full address.";
                  } else if (count >= 3) {
                    addressRetryMessage =
                      "I'm still having trouble. Please say your address slowly and clearly, one part at a time.";
                  }
                }

                speakText(addressRetryMessage);
                addToConversation("assistant", addressRetryMessage);
                
                // Don't automatically start listening - wait for user to click the speak button
                // Keep this comment for documentation purposes
              } else {
                speakText(data.reply);
                addToConversation("assistant", data.reply);
                
                // Don't automatically start listening - wait for user to click the speak button
                // Keep this comment for documentation purposes
              }
            }, 1000);
          }
        })
        .catch((err) => console.error("Error:", err))
        .finally(() => {
          setIsListening(false);
        });
    };

    recognitionRef.current.onend = () => {
      console.log("Speech recognition ended");
      setIsListening(false);
    };
    
    recognitionRef.current.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      
      // Show alert for common errors
      if (event.error === 'not-allowed') {
        alert(language === "hi-IN"
          ? "माइक्रोफोन तक पहुंच की अनुमति नहीं है। कृपया अपने ब्राउज़र सेटिंग्स की जांच करें।"
          : "Microphone access not allowed. Please check your browser settings.");
      }
    };

    // Start the recognition
    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error("Failed to start speech recognition:", error);
      setIsListening(false);
      alert(language === "hi-IN"
        ? "माइक्रोफोन शुरू करने में समस्या। कृपया पुनः प्रयास करें।"
        : "Problem starting microphone. Please try again.");
    }
  };

  return (
    <div className="app-container" lang={language}>
      <NavigationBar
        language={getNavLanguage()}
        onLanguageChange={handleNavLanguageChange}
      />
      <div className="app-content-wrapper">
        <div className="header">
          <h1> 
            {language === "hi-IN"
              ? "आवाज़ फॉर्म सहायक"
              : "AI Voice Form Assistant"}
          </h1>
        </div>

        <div className="main-content">
          <div className="conversation-section">
            <h2>{language === "hi-IN" ? "आवाज़ सहायक" : "AI Assistant"}</h2>
            <div className="conversation-container">
              {conversationHistory
                // Filter out duplicates (same message from same sender consecutively)
                .filter((item, index, array) => {
                  if (index === 0) return true;
                  return !(
                    item.sender === array[index - 1].sender &&
                    item.message === array[index - 1].message
                  );
                })
                .map((item, index) => (
                  <div key={index} className={`message ${item.sender}`}>
                    <div className="message-content">
                      {item.sender === "assistant" ? "🤖 " : "👤 "}
                      {item.message}
                    </div>
                  </div>
                ))}
            </div>

            <div className="controls">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  console.log("Speak button clicked");
                  startListening();
                }}
                disabled={isListening || isSpeaking}
                className={isListening ? "recording" : ""}
                title={isSpeaking ? (language === "hi-IN" ? "सहायक बोल रहा है, कृपया प्रतीक्षा करें" : "Assistant is speaking, please wait") : ""}
              >
                {isListening
                  ? language === "hi-IN"
                    ? "🔴 सुन रहा हूँ..."
                    : "🔴 Listening..."
                  : language === "hi-IN"
                  ? "🎤 बोलें"
                  : "🎤 Speak"}
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  // Initialize speech synthesis if not already initialized
                  initializeVoiceSynthesis();
                  // Then speak the current question
                  setTimeout(() => speakText(questions[currentQuestion]), 100);
                }}
                className="repeat-question"
              >
                {language === "hi-IN"
                  ? "🔊 सवाल दोहराएं"
                  : "🔊 Repeat"}
              </button>
            </div>
          </div>

          <div className="form-section">
            <h2>
              {language === "hi-IN" ? "फॉर्म जानकारी" : "Form Information"}
            </h2>
            <div className="form-container">
              {Object.entries(formData).map(([field, value]) => {
                // Get field label based on language
                let fieldLabel = field
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase());

                if (language === "hi-IN") {
                  // Hindi labels for form fields
                  const hindiLabels = {
                    name: "नाम",
                    gender: "लिंग",
                    age: "उम्र",
                    address: "पता",
                    phone: "फोन नंबर",
                    workExperience: "कार्य अनुभव",
                    skills: "कौशल",
                    availability: "उपलब्धता",
                  };
                  fieldLabel = hindiLabels[field] || fieldLabel;
                }

                return (
                  <div key={field} className={`form-field ${field}`}>
                    <label>{fieldLabel}:</label>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => {
                        const newValue = e.target.value;

                        // Update the form data
                        setFormData((prev) => ({
                          ...prev,
                          [field]: newValue,
                        }));

                        // If this is the current field being asked and user entered something meaningful
                        if (
                          field === currentQuestion &&
                          newValue.trim().length >= 2
                        ) {
                          // Clear any existing timer for this field
                          if (inputDebounceTimers.current[field]) {
                            clearTimeout(inputDebounceTimers.current[field]);
                          }

                          // Use debounce to wait for user to finish typing
                          inputDebounceTimers.current[field] = setTimeout(
                            () => {
                              // Move to the next field after manual input
                              moveToNextField(newValue, field);

                              // Clear the timer reference
                              inputDebounceTimers.current[field] = null;
                            },
                            1500
                          ); // 1.5 second debounce
                        }
                      }}
                      onBlur={(e) => {
                        // Also trigger the move-to-next-field when user tabs out or clicks away
                        // Only if this is the current field and has content
                        const value = e.target.value;
                        if (
                          field === currentQuestion &&
                          value.trim().length >= 2
                        ) {
                          // Clear any existing timer for this field
                          if (inputDebounceTimers.current[field]) {
                            clearTimeout(inputDebounceTimers.current[field]);
                            inputDebounceTimers.current[field] = null;
                          }

                          // Process this as a completed field and move to next
                          moveToNextField(value, field);
                        }
                      }}
                      className={
                        currentQuestion === field ? "active-field" : ""
                      }
                    />
                    {field === "address" && currentQuestion === "address" && (
                      <div className="field-helper">
                        {language === "hi-IN"
                          ? "प्रारूप: घर/अपार्टमेंट #, सड़क, शहर, राज्य, पिन कोड"
                          : "Format: House/Apt #, Street, City, State, Zip"}
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="form-actions submit-all-container">
                <button
                  onClick={handleFormSubmit}
                  className="submit-all-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? language === "hi-IN"
                      ? "सबमिट हो रहा है..."
                      : "Submitting..."
                    : language === "hi-IN"
                    ? "सभी जानकारी सबमिट करें"
                    : "Submit All Information"}
                </button>
              </div>
            </div>

            {/* User Profile Section - shown after form submission */}
            {formSubmitted && userProfile && (
              <div className="profile-section">
                <h2>
                  {language === "hi-IN" ? "आपका प्रोफ़ाइल" : "Your Profile"}
                </h2>
                <div className="profile-card">
                  <div className="profile-header">
                    <h3>{userProfile.name}</h3>
                    <p className="profile-gender-age">
                      {userProfile.gender}, {userProfile.age}{" "}
                      {language === "hi-IN" ? "वर्ष" : "years"}
                    </p>
                  </div>
                  <div className="profile-details">
                    <div className="profile-item">
                      <strong>
                        {language === "hi-IN" ? "पता:" : "Address:"}
                      </strong>{" "}
                      {userProfile.address}
                    </div>
                    <div className="profile-item">
                      <strong>
                        {language === "hi-IN" ? "फोन:" : "Phone:"}
                      </strong>{" "}
                      {userProfile.phone}
                    </div>
                    <div className="profile-item">
                      <strong>
                        {language === "hi-IN"
                          ? "कार्य अनुभव:"
                          : "Work Experience:"}
                      </strong>{" "}
                      {userProfile.workExperience}
                    </div>
                    <div className="profile-item">
                      <strong>
                        {language === "hi-IN" ? "कौशल:" : "Skills:"}
                      </strong>{" "}
                      {userProfile.skills}
                    </div>
                    <div className="profile-item">
                      <strong>
                        {language === "hi-IN" ? "उपलब्धता:" : "Availability:"}
                      </strong>{" "}
                      {userProfile.availability}
                    </div>
                  </div>
                </div>

                <div className="job-section-toggle">
                  <button
                    onClick={() => setShowJobs(!showJobs)}
                    className="toggle-jobs-button"
                  >
                    {showJobs
                      ? language === "hi-IN"
                        ? "नौकरियां छुपाएं"
                        : "Hide Jobs"
                      : language === "hi-IN"
                      ? "उपलब्ध नौकरियां देखें"
                      : "View Available Jobs"}
                  </button>
                </div>

                {/* Job Listings Section */}
                {showJobs && (
                  <div className="job-listings">
                    <h2>
                      {language === "hi-IN"
                        ? "उपलब्ध नौकरियां"
                        : "Available Jobs"}
                    </h2>

                    <div className="jobs-container">
                      {jobListings.length > 0 ? (
                        jobListings.map((job, index) => (
                          <div key={index} className="job-card">
                            <h3 className="job-title">{job.jobName}</h3>
                            <p className="job-description">
                              {job.jobDescription}
                            </p>
                            <div className="job-details">
                              <div className="job-detail">
                                <strong>
                                  {language === "hi-IN"
                                    ? "अनुभव:"
                                    : "Experience:"}
                                </strong>{" "}
                                {job.experience}
                              </div>
                              <div className="job-detail">
                                <strong>
                                  {language === "hi-IN"
                                    ? "उपलब्धता:"
                                    : "Availability:"}
                                </strong>{" "}
                                {job.availability}
                              </div>
                              <div className="job-detail">
                                <strong>
                                  {language === "hi-IN"
                                    ? "न्यूनतम उम्र:"
                                    : "Min Age:"}
                                </strong>{" "}
                                {job.minAge}+
                              </div>
                              {job.skillsRequired.length > 0 && (
                                <div className="job-detail">
                                  <strong>
                                    {language === "hi-IN"
                                      ? "आवश्यक कौशल:"
                                      : "Required Skills:"}
                                  </strong>
                                  <ul className="skills-list">
                                    {job.skillsRequired.map((skill, i) => (
                                      <li key={i}>{skill}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                            <button className="apply-button">
                              {language === "hi-IN" ? "आवेदन करें" : "Apply"}
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="no-jobs-message">
                          {language === "hi-IN"
                            ? "फिलहाल कोई नौकरी उपलब्ध नहीं है।"
                            : "No jobs available at the moment."}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
