/**
 * Simple language detection service
 * This is a basic implementation that can be replaced with more robust libraries
 * like 'franc' or 'langdetect' in production
 */
class LanguageDetectionService {
  constructor() {
    // Hindi common words and patterns
    this.hindiPatterns = [
      /[क-ह]/,  // Hindi Unicode range
      /मेरा|नाम|है|हूँ|आप|तुम|वह|यह|मैं|हम|वे/,  // Common Hindi words
      /नमस्ते|धन्यवाद|अच्छा|ठीक|हाँ|नहीं/  // Common Hindi phrases
    ];
    
    // English common words and patterns
    this.englishPatterns = [
      /\b(?:i|me|my|mine|you|your|yours|he|she|him|her|his|hers|we|us|our|ours|they|them|their|theirs)\b/i,
      /\b(?:is|am|are|was|were|be|being|been|do|does|did|have|has|had|will|would|shall|should|may|might|must|can|could)\b/i,
      /\b(?:hello|hi|hey|thank|thanks|good|yes|no|please|sorry|excuse)\b/i
    ];
  }

  /**
   * Detect if text is primarily Hindi
   * @param {string} text 
   * @returns {boolean}
   */
  isHindi(text) {
    if (!text) return false;
    
    let hindiScore = 0;
    let englishScore = 0;
    
    // Check for Hindi patterns
    this.hindiPatterns.forEach(pattern => {
      if (pattern.test(text)) {
        hindiScore++;
      }
    });
    
    // Check for English patterns
    this.englishPatterns.forEach(pattern => {
      if (pattern.test(text)) {
        englishScore++;
      }
    });
    
    // If Hindi score is higher or equal to English, consider it Hindi
    return hindiScore >= englishScore;
  }

  /**
   * Detect the language of the text
   * @param {string} text 
   * @returns {string} 'hi-IN' for Hindi, 'en-IN' for English
   */
  detectLanguage(text) {
    return this.isHindi(text) ? 'hi-IN' : 'en-IN';
  }
}

module.exports = LanguageDetectionService;