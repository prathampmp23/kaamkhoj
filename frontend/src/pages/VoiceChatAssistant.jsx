import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMicrophone, FaStop, FaTimes, FaComments, FaHome, FaArrowLeft } from 'react-icons/fa';
import { IoLanguage } from 'react-icons/io5';
import './VoiceChatUI.css';

const VoiceChatAssistant = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('en-IN');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('name');
  const [formData, setFormData] = useState({});
  const [statusTitle, setStatusTitle] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [retryCount, setRetryCount] = useState({});
  const [showHistory, setShowHistory] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [pendingValue, setPendingValue] = useState(null);
  const [pendingField, setPendingField] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [useIntelligentMode, setUseIntelligentMode] = useState(true); // Use AI conversation by default

  const currentAudioRef = useRef(null);
  const hasUserInteracted = useRef(false);
  const hasInitialized = useRef(false);

  // Questions for each field (phone and age skipped for voice - will be collected via text input later)
  const questions = {
    name: language === 'hi-IN' 
      ? "आपका नाम क्या है?"
      : "What's your name?",
    address: language === 'hi-IN'
      ? "आपका पता क्या है?"
      : "What's your address?",
    experience: language === 'hi-IN'
      ? "आपके पास कितने साल का अनुभव है?"
      : "How many years of experience do you have?",
    education: language === 'hi-IN'
      ? "आपकी शिक्षा क्या है?"
      : "What's your education level?"
  };

  // Greeting message
  const getGreeting = () => {
    if (language === 'hi-IN') {
      return "नमस्ते! मैं आपका AI सहायक हूं। मैं आपको सही नौकरी ढूंढने में मदद करूंगा।";
    }
    return "Hi! I'm your AI assistant. I'll help you find the perfect job.";
  };

  // Initialize
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    // Initialize conversation session
    initializeConversation();
  }, []);

  // Initialize AI conversation
  const initializeConversation = async () => {
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);

    try {
      const response = await fetch('http://localhost:5000/conversation/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: newSessionId,
          language: language
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setStatusTitle(data.message);
        setStatusMessage(language === 'hi-IN' ? "माइक बटन दबाएं और बोलें" : "Tap mic and speak");
        setUseIntelligentMode(true);
        
        // Store the initial question to speak on first mic tap
        setConversationHistory([{ sender: 'assistant', message: data.message }]);
      } else {
        // Fallback to old mode if AI not available
        console.warn('AI service not available, using fallback mode');
        setUseIntelligentMode(false);
        setStatusTitle(getGreeting());
        setStatusMessage(language === 'hi-IN' ? "शुरू करने के लिए माइक बटन दबाएं" : "Tap the mic button to start");
      }
    } catch (error) {
      console.error('Failed to initialize conversation:', error);
      setUseIntelligentMode(false);
      setStatusTitle(getGreeting());
      setStatusMessage(language === 'hi-IN' ? "शुरू करने के लिए माइक बटन दबाएं" : "Tap the mic button to start");
    }
  };

  // Speak text using TTS
  const speakText = async (text) => {
    if (!text) return;

    // Cancel any ongoing speech
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    setIsSpeaking(true);

    try {
      const response = await fetch("http://localhost:5000/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text,
          lang: language === "hi-IN" ? "hi" : "en",
        }),
      });

      if (!response.ok) throw new Error("TTS failed");

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;

      // Preload the audio to ensure it's ready
      audio.load();

      // Wait for audio to finish playing
      await new Promise((resolve, reject) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          currentAudioRef.current = null;
          setIsSpeaking(false);
          resolve();
        };

        audio.onerror = () => {
          URL.revokeObjectURL(audioUrl);
          currentAudioRef.current = null;
          setIsSpeaking(false);
          reject(new Error("Audio playback failed"));
        };

        // Small delay to ensure audio is loaded before playing
        setTimeout(() => {
          audio.play().catch(reject);
        }, 100);
      });

    } catch (error) {
      console.error("TTS Error:", error);
      currentAudioRef.current = null;
      setIsSpeaking(false);
    }
  };

  // Start listening
  const startListening = async () => {
    if (isListening || isSpeaking) return;

    try {
      // First interaction - speak the question
      if (!hasUserInteracted.current) {
        hasUserInteracted.current = true;
        
        // For intelligent mode, speak the initial greeting
        if (useIntelligentMode && statusTitle) {
          setStatusTitle(language === 'hi-IN' ? "सुन रहा हूं..." : "I'm listening...");
          await speakText(statusTitle);
          await new Promise(resolve => setTimeout(resolve, 800));
        } else if (!useIntelligentMode) {
          // Fallback mode
          const currentQ = questions[currentQuestion];
          if (currentQ) {
            setStatusTitle(language === 'hi-IN' ? "सुन रहा हूं..." : "I'm listening...");
            setStatusMessage(currentQ);
            await speakText(currentQ);
            await new Promise(resolve => setTimeout(resolve, 800));
          }
        }
      }

      setIsListening(true);
      setStatusTitle(language === 'hi-IN' ? "सुन रहा हूं..." : "I'm listening...");
      setStatusMessage(language === 'hi-IN' ? "बोलें..." : "Speak now...");

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

      mediaRecorder.onstop = async () => {
        try {
          const blob = new Blob(chunks, { type: "audio/webm" });
          const formDataUpload = new FormData();
          formDataUpload.append("audio", blob, "recording.webm");

          setStatusTitle(language === 'hi-IN' ? "प्रोसेस कर रहा हूं..." : "Processing...");
          setStatusMessage("");

          // Send to STT (now using improved Whisper 'small' model)
          const sttResp = await fetch("http://localhost:5000/stt", {
            method: "POST",
            body: formDataUpload,
          });

          if (!sttResp.ok) throw new Error("STT failed");

          const sttJson = await sttResp.json();
          if (!sttJson.text || sttJson.text.trim() === "") {
            const msg = language === 'hi-IN' 
              ? "मुझे कुछ नहीं सुनाई दिया। कृपया फिर से प्रयास करें।"
              : "I didn't hear anything. Please try again.";
            setStatusTitle(msg);
            await speakText(msg);
            return;
          }

          console.log('Transcribed text:', sttJson.text);

          // Add user message to history
          setConversationHistory(prev => [...prev, { sender: 'user', message: sttJson.text }]);

          // Use intelligent conversation mode if available
          if (useIntelligentMode && sessionId) {
            try {
              console.log('Sending to AI conversation service...');
              
              const convResp = await fetch("http://localhost:5000/conversation/message", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  sessionId: sessionId,
                  message: sttJson.text
                }),
              });

              if (!convResp.ok) {
                console.error('Conversation API failed:', convResp.status);
                throw new Error("Conversation service failed");
              }

              const convResult = await convResp.json();
              
              console.log('AI Response:', convResult);

              // Check if we got a valid response
              if (!convResult || !convResult.message) {
                throw new Error("Invalid response from conversation service");
              }

              // Add assistant response to history
              setConversationHistory(prev => [...prev, { 
                sender: 'assistant', 
                message: convResult.message 
              }]);

              // Update form data if extracted
              if (convResult.extractedData) {
                setFormData(prev => ({
                  ...prev,
                  ...convResult.extractedData
                }));
              }

              // Update current field
              if (convResult.nextField) {
                setCurrentQuestion(convResult.nextField);
              }

              // Update UI
              setStatusTitle(convResult.message);
              setStatusMessage(convResult.needsConfirmation ? 
                (language === 'hi-IN' ? "कृपया पुष्टि करें" : "Please confirm") : 
                "");

              // Speak the response
              await speakText(convResult.message);

              // Check if conversation is complete
              if (convResult.isComplete) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                const completionMsg = language === 'hi-IN' ?
                  "बहुत बढ़िया! मैंने सारी जानकारी इकट्ठा कर ली है। अब मैं आपके लिए नौकरियां खोजूंगा।" :
                  "Excellent! I have collected all the information. Now I will search for jobs for you.";
                
                setConversationHistory(prev => [...prev, { 
                  sender: 'assistant', 
                  message: completionMsg 
                }]);
                await speakText(completionMsg);
                
                // TODO: Navigate to jobs page or save profile
                console.log('Collected data:', formData);
              }

            } catch (convError) {
              console.error('AI conversation error:', convError);
              
              // Show specific error message
              const fallbackMsg = language === 'hi-IN' ?
                `समस्या हुई: ${convError.message}। कृपया फिर से प्रयास करें।` :
                `Error: ${convError.message}. Please try again.`;
              
              setStatusTitle(fallbackMsg);
              setConversationHistory(prev => [...prev, { 
                sender: 'assistant', 
                message: fallbackMsg 
              }]);
              await speakText(fallbackMsg);
            }
          }

          // If intelligent mode is not enabled, acknowledge the input
          if (!useIntelligentMode) {
            const ackMsg = language === 'hi-IN' ?
              `मैंने सुना: ${sttJson.text}` :
              `I heard: ${sttJson.text}`;
            
            setStatusTitle(ackMsg);
            setConversationHistory(prev => [...prev, { 
              sender: 'assistant', 
              message: ackMsg 
            }]);
            await speakText(ackMsg);
          }

        } catch (error) {
          console.error("Error:", error);
          const errMsg = language === 'hi-IN' ? "कुछ गलत हुआ। फिर कोशिश करें।" : "Something went wrong. Try again.";
          setStatusTitle(errMsg);
          await speakText(errMsg);
        } finally {
          stream.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start();
      setTimeout(() => {
        if (mediaRecorder.state === "recording") {
          mediaRecorder.stop();
          setIsListening(false);
        }
      }, 5000);

    } catch (error) {
      console.error("Microphone error:", error);
      setIsListening(false);
      alert(language === 'hi-IN' ? "माइक्रोफोन एक्सेस नहीं मिला" : "Microphone access denied");
    }
  };

  // Cancel listening
  const cancelListening = () => {
    setIsListening(false);
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    setStatusTitle(language === 'hi-IN' ? "रद्द किया गया" : "Cancelled");
    setStatusMessage(questions[currentQuestion]);
  };

  // Toggle language
  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en-IN' ? 'hi-IN' : 'en-IN');
  };

  // Check if user confirmed or rejected in natural language
  const checkConfirmation = (text) => {
    const lowerText = text.toLowerCase().trim();
    
    // English confirmations
    const confirmEn = ['yes', 'yeah', 'yep', 'correct', 'right', 'ok', 'okay', 'fine', 'sure', 'good', 'perfect', 'exactly', 'absolutely', 'confirm'];
    const rejectEn = ['no', 'nope', 'wrong', 'incorrect', 'not right', 'change', 'edit', 'fix', 'nah'];
    
    // Hindi confirmations
    const confirmHi = ['हाँ', 'हां', 'जी', 'सही', 'ठीक', 'बिल्कुल', 'करेक्ट'];
    const rejectHi = ['नहीं', 'नही', 'गलत', 'बदलो', 'चेंज'];
    
    // Check for confirmation
    if (confirmEn.some(word => lowerText.includes(word)) || 
        confirmHi.some(word => text.includes(word))) {
      return 'confirmed';
    }
    
    // Check for rejection
    if (rejectEn.some(word => lowerText.includes(word)) || 
        rejectHi.some(word => text.includes(word))) {
      return 'rejected';
    }
    
    return 'unclear';
  };

  // Get orb class
  const getOrbClass = () => {
    if (isListening) return 'listening';
    if (isSpeaking) return 'speaking';
    return 'idle';
  };

  const fields = Object.keys(questions);

  return (
    <div className="voice-chat-wrapper">
      {/* Navigation Bar */}
      <div className="voice-nav-bar">
        <button 
          className="voice-nav-btn" 
          onClick={() => navigate('/')}
          title={language === 'hi-IN' ? 'होम पर जाएं' : 'Go to Home'}
        >
          <FaHome size={20} />
        </button>
        {/* <button 
          className="voice-nav-btn" 
          onClick={() => navigate(-1)}
          title={language === 'hi-IN' ? 'वापस जाएं' : 'Go Back'}
        >
          <FaArrowLeft size={20} />
        </button> */}
        <button className="voice-lang-switch" onClick={toggleLanguage}>
          <IoLanguage size={18} />
          <span>{language === 'hi-IN' ? 'EN' : 'हिं'}</span>
        </button>
      </div>

      <div className="voice-chat-container">
        <div className="voice-chat-header">
          <h1 className="voice-chat-title">
            {language === 'hi-IN' ? 'AI नौकरी सहायक' : ' AI Job Assistant'}
          </h1>
          <p className="voice-chat-subtitle">
            {language === 'hi-IN' ? 'आवाज़ से बातचीत करें' : 'Voice Conversation'}
          </p>
        </div>

        <div className="voice-main-area">
          {/* Animated Video Orb */}
          <div className="voice-orb-container">
            {(isListening || isSpeaking) && (
              <>
                <div className="voice-pulse-ring"></div>
                <div className="voice-pulse-ring"></div>
                <div className="voice-pulse-ring"></div>
              </>
            )}
            <video 
              className={`voice-orb ${getOrbClass()}`}
              src="/original-11187fd1dc85fe35d20bf7d80454474f.mp4"
              autoPlay
              loop
              muted
              playsInline
            />
          </div>

          {/* Status */}
          <div className="voice-status-area">
            <h2 className="voice-status-title">{statusTitle}</h2>
            <p className="voice-status-message">{statusMessage}</p>
          </div>

          {/* Progress */}
          <div className="voice-progress-area">
            {fields.map((field, idx) => (
              <div
                key={field}
                className={`voice-progress-step ${
                  formData[field] ? 'completed' :
                  field === currentQuestion ? 'active' : ''
                }`}
              />
            ))}
          </div>

          {/* Controls */}
          <div className="voice-controls">
            <button
              className="voice-control-btn secondary"
              onClick={() => setShowHistory(!showHistory)}
              title={language === 'hi-IN' ? "बातचीत देखें" : "View conversation"}
            >
              <FaComments size={22} />
            </button>

            <button
              className={`voice-control-btn primary ${isListening ? 'recording' : ''}`}
              onClick={startListening}
              disabled={isListening || isSpeaking}
              title={language === 'hi-IN' ? "बोलने के लिए टैप करें" : "Tap to speak"}
            >
              {isListening ? <FaStop size={26} /> : <FaMicrophone size={26} />}
            </button>

            {isListening && (
              <button
                className="voice-control-btn secondary"
                onClick={cancelListening}
                title={language === 'hi-IN' ? "रद्द करें" : "Cancel"}
              >
                <FaTimes size={22} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Chat History */}
      <div className={`voice-chat-history ${showHistory ? 'show' : ''}`}>
        <div className="voice-history-header">
          <h3>{language === 'hi-IN' ? 'बातचीत इतिहास' : 'Conversation History'}</h3>
          <button 
            className="voice-history-close"
            onClick={() => setShowHistory(false)}
            title={language === 'hi-IN' ? 'बंद करें' : 'Close'}
          >
            <FaTimes size={18} />
          </button>
        </div>
        <div className="voice-history-content">
          {conversationHistory.length === 0 ? (
            <p className="voice-history-empty">
              {language === 'hi-IN' ? 'अभी तक कोई बातचीत नहीं...' : 'No conversation yet...'}
            </p>
          ) : (
            conversationHistory.map((msg, idx) => (
              <div key={idx} className={`voice-history-message ${msg.sender}`}>
                <div className="message-icon">
                  {msg.sender === 'assistant' ? '🤖' : '👤'}
                </div>
                <div className="message-text">{msg.message}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceChatAssistant;
