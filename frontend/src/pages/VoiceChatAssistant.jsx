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
        const currentQ = questions[currentQuestion];
        setStatusTitle(language === 'hi-IN' ? "सुन रहा हूं..." : "I'm listening...");
        setStatusMessage(currentQ);
        await speakText(currentQ);
        await new Promise(resolve => setTimeout(resolve, 800)); // Wait before starting recording
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

          // Check if we're waiting for confirmation
          if (awaitingConfirmation) {
            const confirmStatus = checkConfirmation(sttJson.text);
            
            if (confirmStatus === 'confirmed') {
              // User confirmed - save the data and move to next field
              setFormData(prev => ({
                ...prev,
                [pendingField]: pendingValue,
              }));
              
              setAwaitingConfirmation(false);
              setPendingValue(null);
              setPendingField(null);
              setRetryCount(prev => ({ ...prev, [currentQuestion]: 0 }));

              const fields = Object.keys(questions);
              const currentIndex = fields.indexOf(currentQuestion);
              
              const thankYouMsg = language === 'hi-IN' 
                ? "धन्यवाद!"
                : "Great!";
              
              setConversationHistory(prev => [...prev, { sender: 'assistant', message: thankYouMsg }]);

              if (currentIndex < fields.length - 1) {
                const nextField = fields[currentIndex + 1];
                setCurrentQuestion(nextField);
                const nextQ = questions[nextField];
                setStatusTitle(nextQ);
                setStatusMessage("");
                
                await speakText(thankYouMsg);
                await new Promise(resolve => setTimeout(resolve, 800));
                await speakText(nextQ);
              } else {
                const doneMsg = language === 'hi-IN'
                  ? "बहुत बढ़िया! बेसिक जानकारी मिल गई है। फोन नंबर और उम्र बाद में टेक्स्ट फॉर्म में भर सकते हैं। धन्यवाद!"
                  : "Perfect! I have the basic information. You can provide phone number and age later in the text form. Thank you!";
                setStatusTitle(doneMsg);
                setStatusMessage("");
                await speakText(doneMsg);
              }
              return;
              
            } else if (confirmStatus === 'rejected') {
              // User wants to change - ask again
              const retryMsg = language === 'hi-IN'
                ? `ठीक है, ${questions[currentQuestion]}`
                : `Okay, ${questions[currentQuestion]}`;
              
              setAwaitingConfirmation(false);
              setPendingValue(null);
              setPendingField(null);
              setStatusTitle(retryMsg);
              setStatusMessage("");
              setConversationHistory(prev => [...prev, { sender: 'assistant', message: retryMsg }]);
              
              await speakText(retryMsg);
              return;
              
            } else {
              // Unclear response - ask again
              const clarifyMsg = language === 'hi-IN'
                ? "कृपया 'हाँ' या 'नहीं' में जवाब दें। क्या यह सही है?"
                : "Please say 'yes' or 'no'. Is this correct?";
              
              setStatusTitle(clarifyMsg);
              setConversationHistory(prev => [...prev, { sender: 'assistant', message: clarifyMsg }]);
              
              await speakText(clarifyMsg);
              return;
            }
          }

          // Normal processing - extract information
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

          // Add response to history
          setConversationHistory(prev => [...prev, { sender: 'assistant', message: processJson.reply }]);
          
          setStatusTitle(processJson.reply);

          // If extraction was successful, ask for confirmation
          if (processJson.success && processJson.extractedValue) {
            setAwaitingConfirmation(true);
            setPendingValue(processJson.extractedValue);
            setPendingField(currentQuestion);
            setStatusMessage(language === 'hi-IN' ? "कृपया 'हाँ' या 'नहीं' बोलें" : "Please say 'yes' or 'no'");
            
            await speakText(processJson.reply);
          } else {
            // Extraction failed - ask again
            setRetryCount(prev => ({ ...prev, [currentQuestion]: (prev[currentQuestion] || 0) + 1 }));
            setStatusMessage(questions[currentQuestion]);
            await speakText(processJson.reply);
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
              src="/images/original-11187fd1dc85fe35d20bf7d80454474f.mp4"
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
