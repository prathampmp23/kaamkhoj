import React from "react";
import { Link } from "react-router-dom";
import "./AiAssistant.css";

const AiAssistant = ({ preview = false, language = "hi" }) => {
  const translations = {
    hi: {
      title: "हमारा AI आपकी मदद करेगा",
      description:
        "टाइपिंग की चिंता न करें। बस बोलिए, और हमारा AI सहायक आपका प्रोफ़ाइल भर देगा। यह तेज़, आसान है, और आपको अपनी अगली नौकरी के करीब लाता है।",
      button: "AI सहायक के साथ शुरू करें",
      assistantName: "कामखोज सहायक",
      greeting:
        "नमस्ते! मैं आपका AI सहायक हूँ। मैं आपकी प्रोफ़ाइल बनाने में मदद करूँगा।",
      askName: "कृपया अपना नाम बताएं।",
      userName: "मेरा नाम रमेश कुमार है",
      askMobile: "धन्यवाद, रमेश! अब कृपया अपना मोबाइल नंबर बताएं।",
      micPlaceholder: "बोलने के लिए माइक पर टैप करें...",
    },
    en: {
      title: "Let Our AI Help You",
      description:
        "Don't worry about typing. Just speak, and our AI assistant will fill out your profile for you. It's fast, easy, and gets you closer to your next job.",
      button: "Start with AI Assistant",
      assistantName: "KaamKhoj Assistant",
      greeting:
        "Hello! I'm your AI assistant. I'll help you create your profile.",
      askName: "Please tell me your name.",
      userName: "My name is Ramesh Kumar",
      askMobile: "Thank you, Ramesh! Now please tell me your mobile number.",
      micPlaceholder: "Tap the mic to speak...",
    },
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
                <div className="ai-name">
                  {translations[language].assistantName}
                </div>
              </div>
              <div className="ai-chat-messages">
                <div className="ai-message">
                  {translations[language].greeting}
                </div>
                <div className="ai-message">
                  {translations[language].askName}
                </div>
                <div className="user-message">
                  {translations[language].userName}
                </div>
                <div className="ai-message">
                  {translations[language].askMobile}
                </div>
              </div>
              <div className="ai-chat-input">
                <div className="mic-button">
                  <i className="fas fa-microphone"></i>
                </div>
                <span className="input-placeholder">
                  {translations[language].micPlaceholder}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AiAssistant;
