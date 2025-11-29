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

  const currentAudioRef = useRef(null);
  const hasUserInteracted = useRef(false);
  const hasInitialized = useRef(false);

  // Questions for each field
  const questions = {
    name: language === 'hi-IN' 
      ? "आपका नाम क्या है?"
      : "What's your name?",
    phone: language === 'hi-IN'
      ? "आपका फोन नंबर क्या है?"
      : "What's your phone number?",
    age: language === 'hi-IN'
      ? "आपकी उम्र क्या है?"
      : "How old are you?",
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

    setStatusTitle(getGreeting());
    setStatusMessage(language === 'hi-IN' ? "शुरू करने के लिए माइक बटन दबाएं" : "Tap the mic button to start");
  }, []);

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

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        currentAudioRef.current = null;
        setTimeout(() => setIsSpeaking(false), 100);
      };

      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        currentAudioRef.current = null;
        setIsSpeaking(false);
      };

      await audio.play();
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
        const currentQ = questions[currentQuestion];
        setStatusTitle(language === 'hi-IN' ? "सुन रहा हूं..." : "I'm listening...");
        setStatusMessage(currentQ);
        await speakText(currentQ);
        await new Promise(resolve => setTimeout(resolve, 500));
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
          const formData = new FormData();
          formData.append("audio", blob, "recording.webm");

          setStatusTitle(language === 'hi-IN' ? "प्रोसेस कर रहा हूं..." : "Processing...");
          setStatusMessage("");

          // Send to STT
          const sttResp = await fetch("http://localhost:5000/stt", {
            method: "POST",
            body: formData,
          });

          if (!sttResp.ok) throw new Error("STT failed");

          const sttJson = await sttResp.json();
          if (!sttJson.text || sttJson.text.trim() === "") {
            const msg = language === 'hi-IN' 
              ? "मुझे कुछ नहीं सुनाई दिया। कृपया फिर से प्रयास करें।"
              : "I didn't hear anything. Please try again.";
            setStatusTitle(msg);
            setStatusMessage(questions[currentQuestion]);
            speakText(msg);
            return;
          }

          // Add to history
          setConversationHistory(prev => [...prev, { sender: 'user', message: sttJson.text }]);

          // Process with backend
          const processResp = await fetch("http://localhost:5000/process", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text: sttJson.text,
              lang: sttJson.lang || language,
              currentField: currentQuestion,
              retryCount: retryCount[currentQuestion] || 0,
            }),
          });

          const processJson = await processResp.json();

          // Update form data
          if (processJson.extractedValue) {
            setFormData(prev => ({
              ...prev,
              [currentQuestion]: processJson.extractedValue,
            }));
          }

          // Add response to history
          setConversationHistory(prev => [...prev, { sender: 'assistant', message: processJson.reply }]);
          
          setStatusTitle(processJson.reply);

          // Move to next question or finish
          if (processJson.success) {
            setRetryCount(prev => ({ ...prev, [currentQuestion]: 0 }));

            const fields = Object.keys(questions);
            const currentIndex = fields.indexOf(currentQuestion);

            if (currentIndex < fields.length - 1) {
              const nextField = fields[currentIndex + 1];
              setCurrentQuestion(nextField);
              const nextQ = questions[nextField];
              setStatusMessage(nextQ);
              await speakText(processJson.reply);
              await new Promise(resolve => setTimeout(resolve, 800));
              speakText(nextQ);
            } else {
              // All done
              const doneMsg = language === 'hi-IN'
                ? "बहुत बढ़िया! सभी जानकारी मिल गई है। धन्यवाद!"
                : "Perfect! I have all the information. Thank you!";
              setStatusMessage(doneMsg);
              speakText(doneMsg);
            }
          } else {
            setRetryCount(prev => ({ ...prev, [currentQuestion]: (prev[currentQuestion] || 0) + 1 }));
            setStatusMessage(questions[currentQuestion]);
            speakText(processJson.reply);
          }

        } catch (error) {
          console.error("Error:", error);
          const errMsg = language === 'hi-IN' ? "कुछ गलत हुआ। फिर कोशिश करें।" : "Something went wrong. Try again.";
          setStatusTitle(errMsg);
          speakText(errMsg);
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
            {language === 'hi-IN' ? 'AI नौकरी सहायक' : 'AI Job Assistant'}
          </h1>
          <p className="voice-chat-subtitle">
            {language === 'hi-IN' ? 'आवाज़ से बातचीत करें' : 'Voice Conversation'}
          </p>
        </div>

        <div className="voice-main-area">
          {/* Animated Orb */}
          <div className="voice-orb-container">
            {(isListening || isSpeaking) && (
              <>
                <div className="voice-pulse-ring"></div>
                <div className="voice-pulse-ring"></div>
                <div className="voice-pulse-ring"></div>
              </>
            )}
            <div className={`voice-orb ${getOrbClass()}`}></div>
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
