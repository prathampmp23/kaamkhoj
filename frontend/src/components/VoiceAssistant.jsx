// VoiceAssistant.jsx
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./VoiceAssistant.css";

const VoiceAssistant = ({ 
  language = "en-IN", 
  onLanguageChange,
  onExtractedData 
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [extractedData, setExtractedData] = useState(null);
  const [processingStatus, setProcessingStatus] = useState("");
  const recognitionRef = useRef(null);
  
  // Start listening for voice input
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setProcessingStatus("Speech recognition not supported in this browser");
      return;
    }
    
    // Cancel any ongoing recognition
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
    
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = language;
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    
    recognitionRef.current.onstart = () => {
      setIsListening(true);
      setProcessingStatus("Listening...");
    };
    
    recognitionRef.current.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      processText(text);
    };
    
    recognitionRef.current.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setProcessingStatus(`Error: ${event.error}`);
      setIsListening(false);
    };
    
    recognitionRef.current.onend = () => {
      setIsListening(false);
    };
    
    recognitionRef.current.start();
  };
  
  // Stop listening for voice input
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };
  
  // Process the transcript by sending it to the backend
  const processText = async (text) => {
    try {
      setProcessingStatus("Processing...");
      
      // Detect field type based on the content (optional)
      const fieldType = detectFieldType(text);
      
      // Send to backend for processing
      const response = await axios.post("http://localhost:5000/process", {
        text,
        lang: language,
        fieldType
      });
      
      setExtractedData(response.data);
      setProcessingStatus("Processed successfully");
      
      // Notify parent component about the extracted data
      if (onExtractedData && response.data.success) {
        onExtractedData({
          field: response.data.field || fieldType,
          value: response.data.extractedValue,
          confidence: response.data.confidence
        });
      }
    } catch (error) {
      console.error("Error processing text:", error);
      setProcessingStatus("Error processing text");
    }
  };
  
  // Heuristic to detect what field the user might be talking about
  const detectFieldType = (text) => {
    const lowerText = text.toLowerCase();
    
    // Name patterns
    if (lowerText.includes("name") || lowerText.includes("call me") || 
        lowerText.includes("naam") || lowerText.includes("नाम")) {
      return "name";
    }
    
    // Gender patterns
    if (lowerText.includes("gender") || lowerText.includes("male") || 
        lowerText.includes("female") || lowerText.includes("लिंग") || 
        lowerText.includes("पुरुष") || lowerText.includes("महिला")) {
      return "gender";
    }
    
    // Age patterns
    if (lowerText.includes("age") || lowerText.includes("years old") || 
        lowerText.includes("उम्र") || lowerText.includes("साल")) {
      return "age";
    }
    
    // Address patterns
    if (lowerText.includes("address") || lowerText.includes("live") || 
        lowerText.includes("पता") || lowerText.includes("निवास")) {
      return "address";
    }
    
    // Phone patterns
    if (lowerText.includes("phone") || lowerText.includes("number") || 
        lowerText.includes("contact") || lowerText.includes("फोन") || 
        lowerText.includes("मोबाइल") || lowerText.includes("नंबर")) {
      return "phone";
    }
    
    // Work experience patterns
    if (lowerText.includes("experience") || lowerText.includes("worked") || 
        lowerText.includes("अनुभव") || lowerText.includes("काम किया")) {
      return "workExperience";
    }
    
    // Skills patterns
    if (lowerText.includes("skill") || lowerText.includes("can do") || 
        lowerText.includes("good at") || lowerText.includes("कौशल") || 
        lowerText.includes("कर सकता")) {
      return "skills";
    }
    
    // Availability patterns
    if (lowerText.includes("available") || lowerText.includes("work") || 
        lowerText.includes("time") || lowerText.includes("उपलब्ध") || 
        lowerText.includes("समय")) {
      return "availability";
    }
    
    return "unknown";
  };
  
  // Render the voice assistant component
  return (
    <div className="voice-assistant-container">
      <div className="voice-controls">
        <button 
          onClick={isListening ? stopListening : startListening} 
          className={`voice-button ${isListening ? 'listening' : ''}`}
        >
          {isListening ? '🔴 Stop' : '🎤 Start Voice Input'}
        </button>
        
        <div className="language-selector">
          <select 
            value={language === "hi-IN" ? "hi" : "en"} 
            onChange={(e) => onLanguageChange(e.target.value)}
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
          </select>
        </div>
      </div>
      
      {transcript && (
        <div className="transcript-container">
          <h3>{language === "hi-IN" ? "आपने कहा:" : "You said:"}</h3>
          <p className="transcript-text">{transcript}</p>
          
          <div className="status-message">
            {processingStatus}
          </div>
        </div>
      )}
      
      {extractedData && extractedData.success && (
        <div className="extracted-data-container">
          <h3>{language === "hi-IN" ? "निकाली गई जानकारी:" : "Extracted Information:"}</h3>
          <div className="extracted-value">
            <strong>{extractedData.field || "Value"}:</strong> {extractedData.extractedValue}
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceAssistant;