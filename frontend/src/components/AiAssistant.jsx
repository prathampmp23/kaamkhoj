import React from 'react';
import { Link } from 'react-router-dom';
import './AiAssistant.css';

const AiAssistant = ({ preview = false, language = 'hi' }) => {
  const translations = {
    hi: {
      title: "हमारा AI आपकी मदद करेगा",
      description: "टाइपिंग की चिंता न करें। बस बोलिए, और हमारा AI सहायक आपका प्रोफ़ाइल भर देगा। यह तेज़, आसान है, और आपको अपनी अगली नौकरी के करीब लाता है।",
      button: "AI सहायक के साथ शुरू करें"
    },
    en: {
      title: "Let Our AI Help You",
      description: "Don't worry about typing. Just speak, and our AI assistant will fill out your profile for you. It's fast, easy, and gets you closer to your next job.",
      button: "Start with AI Assistant"
    }
  };

  return (
    <section className="ai-assistant-preview">
      <div className="container">
        <div className="ai-preview-content">
          <div className="ai-preview-text">
            <h2>{translations[language].title}</h2>
            <p>{translations[language].description}</p>
            <Link to="/assistant">
              <button className="ai-start-btn">
                <i className="fas fa-microphone me-2"></i>
                {translations[language].button}
              </button>
            </Link>
          </div>
          <div className="ai-preview-image">
            <div className="ai-chat-interface">
              <div className="ai-chat-header">
                <div className="ai-avatar">AI</div>
                <div className="ai-name">कामखोज सहायक</div>
              </div>
              <div className="ai-chat-messages">
                <div className="ai-message">
                  नमस्ते! मैं आपका AI सहायक हूँ। मैं आपकी प्रोफ़ाइल बनाने में मदद करूँगा।
                </div>
                <div className="ai-message">
                  कृपया अपना नाम बताएं।
                </div>
                <div className="user-message">
                  मेरा नाम रमेश कुमार है
                </div>
                <div className="ai-message">
                  धन्यवाद, रमेश! अब कृपया अपना मोबाइल नंबर बताएं।
                </div>
              </div>
              <div className="ai-chat-input">
                <div className="mic-button">
                  <i className="fas fa-microphone"></i>
                </div>
                <span className="input-placeholder">बोलने के लिए माइक पर टैप करें...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AiAssistant;
