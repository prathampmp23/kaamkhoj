const axios = require("axios");

/**
 * Intelligent conversation service using local LLM for natural human-like interaction
 * This service maintains context and guides users through job registration naturally
 */
class ConversationService {
  constructor(ollamaBaseUrl = "http://localhost:11434") {
    this.baseUrl = ollamaBaseUrl;
    this.model = "qwen2.5:7b"; // Using qwen2.5:7b for multilingual support
    this.conversationHistory = new Map(); // Store conversation context per session
  }

  /**
   * Initialize a new conversation session
   * @param {string} sessionId - Unique session identifier
   * @param {string} language - Language code (en-IN, hi-IN)
   */
  initSession(sessionId, language = "en-IN") {
    const isHindi = language.startsWith("hi");
    
    this.conversationHistory.set(sessionId, {
      language: language,
      messages: [],
      userData: {},
      currentField: 'name',
      fields: ['name', 'address', 'experience', 'education'],
      systemPrompt: isHindi ? 
        `तुम एक दोस्ताना AI नौकरी सहायक हो। तुम्हारा काम लोगों को नौकरी खोजने में मदद करना है। तुम्हें उनसे बातचीत के दौरान निम्नलिखित जानकारी इकट्ठा करनी है:
1. नाम (name)
2. पता (address)  
3. कार्य अनुभव (experience) - कितने साल
4. शिक्षा (education)

महत्वपूर्ण निर्देश:
- प्राकृतिक और दोस्ताना बातचीत करो
- एक समय में एक ही सवाल पूछो
- हिंदी और अंग्रेजी दोनों को समझो
- जवाब छोटे रखो (1-2 वाक्य)
- हमेशा JSON फॉर्मेट में जवाब दो

JSON फॉर्मेट (बिल्कुल इसी तरह):
{"message":"बोलने का टेक्स्ट","extractedData":{"field":"value"},"nextField":"field_name","needsConfirmation":true,"isComplete":false}

ध्यान दें: JSON में कोई नई लाइन या अतिरिक्त स्पेस नहीं होनी चाहिए।` 
        : 
        `You are a friendly AI job assistant. Your job is to help people find work opportunities. You need to collect the following information through natural conversation:
1. Name
2. Address
3. Work experience (in years)
4. Education

Important instructions:
- Have natural, friendly conversations
- Ask one question at a time
- Understand both Hindi and English
- Keep responses short (1-2 sentences)
- Always respond in JSON format

JSON format (exactly like this):
{"message":"text to speak","extractedData":{"field":"value"},"nextField":"field_name","needsConfirmation":true,"isComplete":false}

Note: JSON must be on a single line with no extra newlines or spaces.`
    });
  }

  /**
   * Process user input and generate intelligent response
   * @param {string} sessionId - Session identifier
   * @param {string} userInput - What the user said
   * @returns {Promise<{message: string, extractedData: object, nextField: string, needsConfirmation: boolean, isComplete: boolean}>}
   */
  async processInput(sessionId, userInput) {
    const session = this.conversationHistory.get(sessionId);
    
    if (!session) {
      throw new Error("Session not found. Please initialize session first.");
    }

    const isHindi = session.language.startsWith("hi");

    // Add user message to history
    session.messages.push({
      role: "user",
      content: userInput
    });

    // Build the conversation context
    const conversationContext = this._buildContext(session);

    // Create the prompt for the LLM
    const prompt = `${session.systemPrompt}

पिछली बातचीत / Conversation so far:
${conversationContext}

उपयोगकर्ता की जानकारी अब तक / User data collected so far:
${JSON.stringify(session.userData, null, 2)}

अगला फील्ड जो पूछना है / Next field to ask: ${session.currentField}

उपयोगकर्ता ने अभी कहा / User just said: "${userInput}"

निर्देश / Instructions:
1. उपयोगकर्ता के जवाब से जानकारी निकालो
2. अगर जानकारी मिली, तो पुष्टि के लिए पूछो
3. अगर पुष्टि हो गई, तो अगला सवाल पूछो
4. हमेशा एक लाइन में JSON फॉर्मेट में जवाब दो (कोई नई लाइन नहीं)

JSON फॉर्मेट (एक ही लाइन में):
{"message":"उपयोगकर्ता से बोलने के लिए टेक्स्ट","extractedData":{"field_name":"value"},"nextField":"अगला फील्ड या current","needsConfirmation":true,"isComplete":false}

उदाहरण:
User says: "मेरा नाम राम है"
Response: {"message":"धन्यवाद राम जी! क्या यह सही है?","extractedData":{"name":"राम"},"nextField":"name","needsConfirmation":true,"isComplete":false}

User confirms: "हाँ सही है"
Response: {"message":"बहुत बढ़िया! आप कहाँ रहते हैं?","extractedData":null,"nextField":"address","needsConfirmation":false,"isComplete":false}`;

    try {
      const response = await axios.post(`${this.baseUrl}/api/generate`, {
        model: this.model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.3, // Slightly creative but mostly predictable
          top_p: 0.9,
        },
      });

      const llmOutput = response.data.response;
      console.log("LLM Raw Output:", llmOutput);

      // Extract JSON from the response
      const jsonMatch = llmOutput.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        let jsonString = jsonMatch[0];
        
        // Clean up the JSON string - fix common issues
        jsonString = jsonString
          .replace(/\n/g, ' ')  // Remove newlines
          .replace(/\r/g, '')   // Remove carriage returns
          .replace(/\t/g, ' ')  // Replace tabs with spaces
          .replace(/\s+/g, ' ') // Collapse multiple spaces
          .trim();
        
        console.log("Cleaned JSON string:", jsonString);
        
        try {
          const result = JSON.parse(jsonString);
          
          // Add assistant response to history
          session.messages.push({
            role: "assistant",
            content: result.message
          });

          // Update userData if we have extracted data
          if (result.extractedData) {
            Object.assign(session.userData, result.extractedData);
          }

          // Update current field
          if (result.nextField) {
            session.currentField = result.nextField;
          }

          // Check if all fields are collected
          const allFieldsCollected = session.fields.every(
            field => session.userData[field] !== undefined && session.userData[field] !== null
          );

          if (allFieldsCollected && !result.needsConfirmation) {
            result.isComplete = true;
          }

          return result;
          
        } catch (parseError) {
          console.error("JSON parse error:", parseError);
          console.error("Attempted to parse:", jsonString);
          
          // Fallback: Extract message manually if JSON parsing fails
          const messageMatch = llmOutput.match(/"message"\s*:\s*"([^"]+)"/);
          if (messageMatch) {
            return {
              message: messageMatch[1],
              extractedData: null,
              nextField: session.currentField,
              needsConfirmation: false,
              isComplete: false
            };
          }
        }
      }

      // Fallback if JSON parsing fails
      return {
        message: isHindi ? 
          "मुझे समझने में कठिनाई हुई। कृपया दोबारा बताएं।" : 
          "I didn't quite understand. Could you please repeat that?",
        extractedData: null,
        nextField: session.currentField,
        needsConfirmation: false,
        isComplete: false
      };

    } catch (error) {
      console.error("Error in conversation service:", error);
      
      return {
        message: isHindi ? 
          "क्षमा करें, मुझे कुछ समस्या हुई। कृपया फिर से प्रयास करें।" :
          "Sorry, I encountered an issue. Please try again.",
        extractedData: null,
        nextField: session.currentField,
        needsConfirmation: false,
        isComplete: false
      };
    }
  }

  /**
   * Build conversation context from message history
   * @private
   */
  _buildContext(session) {
    return session.messages
      .slice(-6) // Keep last 6 messages for context
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');
  }

  /**
   * Get current session data
   */
  getSessionData(sessionId) {
    const session = this.conversationHistory.get(sessionId);
    return session ? session.userData : null;
  }

  /**
   * Clear session
   */
  clearSession(sessionId) {
    this.conversationHistory.delete(sessionId);
  }

  /**
   * Check if Ollama service is available
   */
  async isAvailable() {
    try {
      await axios.get(`${this.baseUrl}/api/version`);
      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = ConversationService;
