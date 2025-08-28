const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();

// Import models
const User = require('./models/user');
const Job = require('./models/job');

// Import address helper functions
const { extractHouseAndStreet, extractCity, extractState, partialAddresses } = require('./addressHelper');

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/kaamkhoj', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('MongoDB connection error:', error);
});

app.use(cors());
app.use(express.json());

// Natural language processing functions for extracting information
function extractName(text) {
  // Match patterns like "My name is John", "I am John", "John is my name", etc.
  const patterns = [
    /my name is\s+(.+?)(?:\s+and|\s+but|\s+or|$|\.|,)/i,
    /i am\s+(.+?)(?:\s+and|\s+but|\s+or|$|\.|,)/i,
    /(?:call me|i'm|i'm called)\s+(.+?)(?:\s+and|\s+but|\s+or|$|\.|,)/i,
    /(.+?)\s+(?:is my name)(?:\s+and|\s+but|\s+or|$|\.|,)/i,
    /mera naam\s+(.+?)(?:\s+hai|\s+h|\s+he|$|\.|,)/i,
    /mera name\s+(.+?)(?:\s+hai|\s+h|\s+he|$|\.|,)/i,
    /naam\s+(.+?)(?:\s+hai|\s+h|\s+he|$|\.|,)/i,
    /(?:^|\s+)(.+?)(?:\s+hai mera naam)/i
  ];

  // Try to match with the standard patterns first
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const potentialName = match[1].trim();

      // Basic validation - name should be at least 2 chars and not too long
      if (potentialName.length >= 2 && potentialName.length <= 30) {
        // Filter out common words that might be picked up incorrectly
        const commonWords = ['yes', 'no', 'hello', 'hi', 'okay', 'sure', 'the', 'a', 'an', 'is', 'am', 'are'];
        if (!commonWords.includes(potentialName.toLowerCase())) {
          return potentialName;
        }
      }
    }
  }

  // If standard patterns fail, check if the text could be just a name by itself
  // This is especially important after several retries when we ask the user to just say their name
  const directNameText = text.trim();
  const wordCount = directNameText.split(/\s+/).length;

  // Check if the text could be a direct name (1-3 words, not too short, not too long)
  if (wordCount <= 3 && directNameText.length >= 2 && directNameText.length <= 30) {
    // Additional validation - check if it contains question words or common dialogue phrases
    const questionWords = ['what', 'who', 'where', 'when', 'why', 'how'];
    const commonPhrases = ['yes', 'no', 'okay', 'thank you', 'thanks', 'please', 'hello', 'hi', 'bye'];

    const lowerText = directNameText.toLowerCase();
    const containsQuestionWord = questionWords.some(word => lowerText.includes(word));
    const isCommonPhrase = commonPhrases.includes(lowerText);

    if (!containsQuestionWord && !isCommonPhrase) {
      return directNameText;
    }
  }

  return null;
}

function extractGender(text) {
  const lowerText = text.toLowerCase();

  // Check for explicit gender mentions in English
  if (lowerText.includes("male") || lowerText.match(/\bi am a man\b/) ||
      lowerText.match(/\bi'm a man\b/)) {
    return "Male";
  } else if (lowerText.includes("female") || lowerText.match(/\bi am a woman\b/) ||
             lowerText.match(/\bi'm a woman\b/)) {
    return "Female";
  } else if (lowerText.includes("non-binary") || lowerText.includes("other") ||
             lowerText.includes("third gender") || lowerText.includes("transgender")) {
    return "Other";
  }

  // Check for explicit gender mentions in Hindi
  if (lowerText.includes("पुरुष") || lowerText.includes("लड़का") ||
      lowerText.includes("आदमी") || lowerText.includes("मेल")) {
    return "पुरुष";
  } else if (lowerText.includes("महिला") || lowerText.includes("लड़की") ||
             lowerText.includes("औरत") || lowerText.includes("स्त्री") ||
             lowerText.includes("फीमेल")) {
    return "महिला";
  } else if (lowerText.includes("अन्य") || lowerText.includes("थर्ड जेंडर") ||
             lowerText.includes("ट्रांसजेंडर")) {
    return "अन्य";
  }

  return null;
}

function extractAge(text) {
  // Clean up the text
  const cleanText = text.trim();
  
  // Match patterns for age like "I am 25 years old", "My age is 25", etc.
  const patterns = [
    /\b(?:i am|i'm)\s+(\d+)(?:\s+years?\s+old)?\b/i,
    /\bmy age is\s+(\d+)\b/i,
    /\bi am\s+(\d+)\s+years?\b/i,
    /\b(\d+)\s+(?:years?|yrs?)\s+old\b/i,
    /\bage\s+(\d+)\b/i,
    /\bmeri (?:age|umar|उम्र)\s+(\d+)\b/i,
    /\b(\d+)\s+(?:saal|sal|साल|वर्ष)\b/i,
    /\bमेरी उम्र\s+(\d+)\s+(?:साल|वर्ष)\b/i,
    /\b(?:^|\s+)(\d+)(?:\s+साल|\s+वर्ष)\b/i,    // Direct age in Hindi (21 साल)
    /\b(?:^|\s+)मेरी उम्र (\d+) है\b/i,         // "मेरी उम्र 21 है"
    /\b(?:^|\s+)(\d+) वर्ष\b/i,                // "21 वर्ष"
    /\b(?:^|\s+)उम्र (\d+)(?:\s+साल|\s+वर्ष)?\b/i, // "उम्र 21 साल"
    // Additional patterns for more direct statements
    /\bage is (\d+)\b/i,
    /\bumar (\d+) hai\b/i,
    /\bumar (\d+) h\b/i,
    /\bउम्र (\d+) है\b/i,
    /\bमेरी आयु (\d+) है\b/i,
    /\bmain (\d+) saal ka hun\b/i,
    /\bmain (\d+) saal ki hun\b/i,
    /\bमैं (\d+) साल का हूं\b/i,
    /\bमैं (\d+) साल की हूं\b/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const age = parseInt(match[1]);
      if (age > 0 && age < 120) { // Reasonable age range check
        return age.toString();
      }
    }
  }

  // For direct age input (if the input is just a number)
  const directAgeMatch = cleanText.match(/^(\d+)$/);
  if (directAgeMatch && directAgeMatch[1]) {
    const age = parseInt(directAgeMatch[1]);
    if (age > 0 && age < 120) {
      return age.toString();
    }
  }
  
  // Convert Hindi/English number words to digits
  const numberWordMap = {
    'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 
    'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
    'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15,
    'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19, 'twenty': 20,
    'twenty one': 21, 'twenty two': 22, 'twenty five': 25, 'thirty': 30, 
    'thirty five': 35, 'forty': 40, 'fifty': 50, 'sixty': 60,
    'ek': 1, 'do': 2, 'teen': 3, 'char': 4, 'paanch': 5,
    'chhe': 6, 'saat': 7, 'aath': 8, 'nau': 9, 'das': 10,
    'gyarah': 11, 'barah': 12, 'terah': 13, 'chaudah': 14, 'pandrah': 15,
    'solah': 16, 'satrah': 17, 'atharah': 18, 'unnees': 19, 'bees': 20,
    'pachees': 25, 'tees': 30, 'chalees': 40, 'pachaas': 50, 'saath': 60,
    'एक': 1, 'दो': 2, 'तीन': 3, 'चार': 4, 'पांच': 5,
    'छह': 6, 'सात': 7, 'आठ': 8, 'नौ': 9, 'दस': 10,
    'ग्यारह': 11, 'बारह': 12, 'तेरह': 13, 'चौदह': 14, 'पंद्रह': 15,
    'सोलह': 16, 'सत्रह': 17, 'अठारह': 18, 'उन्नीस': 19, 'बीस': 20,
    'पच्चीस': 25, 'तीस': 30, 'चालीस': 40, 'पचास': 50, 'साठ': 60
  };
  
  // Check for number words in the text
  const lowerText = cleanText.toLowerCase();
  for (const [word, value] of Object.entries(numberWordMap)) {
    if (lowerText.includes(word)) {
      return value.toString();
    }
  }
  
  return null;
}

function extractAddress(text) {
  // Clean up the text for better pattern matching
  const cleanText = text.trim();

  // Look for key phrases that often indicate an address
  const patterns = [
    /(?:i live at|my address is|address is|i reside at|residing at|stay at|i stay at|i live in)\s+(.+?)(?:\.|$)/i,
    /(?:mera|my)\s+(?:address|pata|ghar)\s+(?:hai|is|at)\s+(.+?)(?:\.|$)/i,
    /(?:^|\s+)(?:address|location|residence)\s*[:,-]?\s+(.+?)(?:\.|$)/i,
    /(?:^|\s+)(?:i am from|i am in|i'm from|i'm in)\s+(.+?)(?:\.|$)/i,
    /(?:rehta|rehti) (?:hu|hun|hoon)\s+(.+?)(?:\.|$)/i
  ];

  // Try the standard patterns first
  for (const pattern of patterns) {
    const match = cleanText.match(pattern);
    if (match && match[1]) {
      const potentialAddress = match[1].trim();
      if (potentialAddress.length > 5) { // Basic validation - addresses are usually not very short
        return potentialAddress;
      }
    }
  }

  // If no matches from patterns, check if the text itself could be an address
  // This is a more aggressive approach but useful after multiple retries

  // Some address indicators - if these words are present, it's likely an address
  const addressIndicators = [
    'street', 'road', 'avenue', 'lane', 'boulevard', 'drive', 'court', 'place',
    'highway', 'circle', 'plaza', 'square', 'apartment', 'apt', 'suite', 'unit',
    'floor', 'building', 'block', 'sector', 'phase', 'district', 'area', 'town',
    'village', 'city', 'state', 'zip', 'postal', 'pincode', 'pin code',
    'colony', 'society', 'nagar', 'chowk', 'gali', 'galli', 'marg'
  ];

  // Check if any address indicators are present in the text
  const lowerText = cleanText.toLowerCase();
  const containsAddressIndicator = addressIndicators.some(indicator =>
    lowerText.includes(indicator)
  );

  // Check for numeric patterns common in addresses
  const hasNumbers = /\d+/.test(cleanText);

  // Look for common address patterns like house numbers followed by text
  const addressPattern = /(?:^|\s)(?:\d+\s*[-,.]?\s*\w|\w\s*[-,.]?\s*\d)/i;
  const matchesAddressPattern = addressPattern.test(cleanText);

  // If it has address indicators or looks like an address and is reasonably long
  if ((containsAddressIndicator || (hasNumbers && matchesAddressPattern)) &&
      cleanText.length > 10 && cleanText.split(/\s+/).length >= 3) {
    return cleanText;
  }

  // Direct address entry - for when we specifically ask user to just state their address
  // This is the last resort when all other patterns fail but we still want to capture the text
  if (cleanText.length > 15 && cleanText.split(/\s+/).length >= 4) {
    // Filter out common non-address responses
    const nonAddressPhrases = [
      'i don\'t know', 'what is', 'what are', 'how to', 'tell me',
      'can you', 'please help', 'i need', 'hello', 'thank you'
    ];
    const isNonAddressPhrase = nonAddressPhrases.some(phrase =>
      lowerText.includes(phrase)
    );

    if (!isNonAddressPhrase) {
      return cleanText;
    }
  }

  return null;
}

function extractPhone(text) {
  // Clean up the text
  const cleanText = text.trim();
  
  // Look for phone number patterns in sentences
  const patterns = [
    /(?:my|phone|mobile|contact|cell)(?:\s+number)?\s+is\s+(\+?\d[\d\s-]{8,})/i,
    /(\+?\d[\d\s-]{8,})(?:\s+is my phone number)/i,
    /mera\s+(?:phone|mobile|number|फोन|मोबाइल|नंबर)\s+(?:hai|is|h|है)\s+(\+?\d[\d\s-]{8,})/i,
    /मेरा\s+(?:फोन|मोबाइल|नंबर)\s+(?:है|ह)\s+(\+?\d[\d\s-]{8,})/i,
    /मेरा\s+(?:फोन|मोबाइल|नंबर)\s+(\+?\d[\d\s-]{8,})/i,
    /(\+?\d[\d\s-]{8,})(?:\s+है मेरा नंबर)/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      // Clean up the phone number - remove spaces, dashes, etc.
      const cleanNumber = match[1].replace(/[\s-]/g, '');
      // Basic validation - should be at least 10 digits
      if (cleanNumber.length >= 10) {
        return cleanNumber;
      }
    }
  }
  
  // Extract any continuous sequence of digits of appropriate length
  // This handles direct input of phone numbers
  const digitPatterns = [
    /\b(\d{10})\b/, // 10-digit number
    /\b(\d{3}[\s-]?\d{3}[\s-]?\d{4})\b/, // Common format: 123-456-7890
    /\b(\+\d{1,3}[\s-]?\d{10})\b/ // With country code: +91 1234567890
  ];
  
  for (const pattern of digitPatterns) {
    const match = cleanText.match(pattern);
    if (match && match[1]) {
      const cleanNumber = match[1].replace(/[\s-]/g, '');
      if (cleanNumber.length >= 10) {
        return cleanNumber;
      }
    }
  }
  
  // For a direct input of digits (if the entire input is just digits)
  // This is the most lenient case, so we keep it as the last check
  if (/^\d+$/.test(cleanText) && cleanText.length >= 10 && cleanText.length <= 15) {
    return cleanText;
  }
  
  return null;
}

function extractWorkExperience(text) {
  // Look for work experience patterns
  const patterns = [
    /(?:i have|with)\s+(\d+)\s+years?\s+(?:of\s+)?(?:work\s+)?experience/i,
    /(\d+)\s+years?\s+(?:of\s+)?(?:work\s+)?experience/i,
    /experience\s+(?:of\s+)?(\d+)\s+years?/i,
    /(?:mera|my)\s+(?:work|job)\s+experience\s+(\d+)\s+(?:saal|years|year)/i,
    /my work experience is of (\d+) years?/i,
    /my work experience is (\d+) years?/i,
    /(?:^|\s+)(\d+)\s+years?(?:\s+|$)/i,           // Direct "2 years" or "2 years..."
    /(?:^|\s+)(\w+)\s+years?(?:\s+|$)/i,           // For "two years", "three years", etc.
    /(?:mera|my)\s+experience\s+(\d+)\s+(?:saal|years|year)/i,
    // Hindi patterns
    /मेरा काम का अनुभव\s+(\d+)\s+(?:साल|वर्ष)/i,  // मेरा काम का अनुभव 5 साल
    /(\d+)\s+(?:साल|वर्ष) का अनुभव/i,            // 5 साल का अनुभव
    /मुझे\s+(\d+)\s+(?:साल|वर्ष) का अनुभव है/i,   // मुझे 5 साल का अनुभव है
    /मेरे पास\s+(\d+)\s+(?:साल|वर्ष) का अनुभव है/i, // मेरे पास 5 साल का अनुभव है
    /अनुभव\s+(\d+)\s+(?:साल|वर्ष)/i              // अनुभव 5 साल
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      // Convert word numbers to digits if needed
      const numWords = {
        'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4',
        'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9',
        'ten': '10', 'eleven': '11', 'twelve': '12', 'thirteen': '13', 'fourteen': '14',
        'fifteen': '15', 'twenty': '20', 'thirty': '30'
      };

      let years;
      if (isNaN(match[1])) {
        const lowerMatch = match[1].toLowerCase();
        years = numWords[lowerMatch] || null;
      } else {
        years = match[1].trim();
      }

      if (years) {
        return years + " years";
      }
    }
  }
  
  // For direct number input (if the input is just a number)
  const directNumberMatch = text.trim().match(/^(\d+)$/);
  if (directNumberMatch && directNumberMatch[1]) {
    const years = parseInt(directNumberMatch[1]);
    if (years >= 0 && years <= 70) { // Reasonable experience range check
      return years.toString() + " years";
    }
  }
  
  return null;
}

function extractSkills(text) {
  // This is a simplified approach - skill extraction can be complex
  // First, clean up the text
  const cleanText = text.trim();
  
  // Check for common phrases indicating skills
  const patterns = [
    /(?:my skills are|i am skilled in|i know how to|i know|i'm good at|i have skills in)\s+(.+?)(?:\.|$)/i,
    /(?:skilled in|expertise in|proficient in|specialization in)\s+(.+?)(?:\.|$)/i,
    /(?:meri|my)\s+skills\s+(?:hai|are|is)\s+(.+?)(?:\.|$)/i,
    /(?:meri|my)\s+skill\s+(?:hai|is)\s+(.+?)(?:\.|$)/i,
    /(?:mera|my)\s+(?:kaushal|kushal|kaushl|skill)\s+(?:hai|is|he|h)\s+(.+?)(?:\.|$)/i,
    /(?:mera|my)\s+(?:kaushal|kushal|kaushl|skill)\s+(.+?)(?:\s+hai|$|\.|,)/i,  // मेरा कौशल ड्राइवर है
    /मेरी स्किल्स\s+(.+?)(?:\s+है|हैं|$|\.|,)/i,  // मेरी स्किल्स ड्राइविंग है
    /मेरी स्किल\s+(.+?)(?:\s+है|$|\.|,)/i,       // मेरी स्किल ड्राइविंग है
    /मुझे\s+(.+?)\s+(?:आता है|आती है|करना आता है)(?:\.|$)/i, // मुझे ड्राइविंग आती है
    /i can\s+(.+?)(?:\s+well|\s+good|\.|$)/i     // I can drive well
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  // For direct skill input (if the input is just a word or short phrase)
  // Common job skills that might be mentioned directly
  const commonSkills = [
    "driving", "cooking", "cleaning", "gardening", "teaching", "programming",
    "ड्राइवर", "ड्राइविंग", "रसोइया", "सफाई", "बागवानी", "शिक्षण", "कंप्यूटर",
    "driver", "cook", "cleaner", "gardener", "teacher", "computer"
  ];
  
  const lowerText = cleanText.toLowerCase();
  
  // Check if the text directly matches a common skill
  for (const skill of commonSkills) {
    if (lowerText.includes(skill.toLowerCase())) {
      return cleanText;
    }
  }
  
  // If the input is very short (likely a direct skill mention) and not a question
  const wordCount = cleanText.split(/\s+/).length;
  const questionWords = ['what', 'who', 'where', 'when', 'why', 'how', 'क्या', 'कौन', 'कहां', 'कब', 'क्यों', 'कैसे'];
  const isQuestion = questionWords.some(word => lowerText.includes(word.toLowerCase()));
  
  if (wordCount <= 3 && !isQuestion && cleanText.length >= 3) {
    return cleanText;
  }
  
  return null;
}

function extractAvailability(text) {
  const cleanText = text.trim();
  const lowerText = cleanText.toLowerCase();

  // Define availability types in English and Hindi
  const availabilityTypes = {
    "Full Time": ["full time", "full-time", "fulltime", "पूर्णकालिक", "पूरा समय", "फुल टाइम"],
    "Part Time": ["part time", "part-time", "parttime", "अंशकालिक", "आधा समय", "पार्ट टाइम"],
    "Weekends": ["weekends", "weekend", "weekend only", "सप्ताहांत", "वीकेंड", "वीकेंड्स"],
    "Day": ["day", "daytime", "morning", "afternoon", "दिन", "दिन में", "सुबह", "दोपहर"],
    "Night": ["night", "night shift", "evening", "रात", "रात में", "शाम"],
    "Flexible": ["flexible", "any time", "anytime", "लचीला", "किसी भी समय"],
    "Freelance/Contract": ["freelance", "contract", "temporary", "फ्रीलांस", "कॉन्ट्रैक्ट", "अस्थायी"]
  };

  // Check if the text directly mentions any availability type
  for (const [availType, keywords] of Object.entries(availabilityTypes)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        return availType;
      }
    }
  }

  // Look for more complex patterns
  const patterns = [
    /available\s+(.+?)(?:\.|$)/i,
    /can work\s+(.+?)(?:\.|$)/i,
    /(?:meri|my)\s+availability\s+(?:hai|is|h)\s+(.+?)(?:\.|$)/i,
    /(?:meri|my)\s+availability\s+(.+?)(?:\.|$)/i,
    /(?:mai|main|me|i)\s+(?:am|hu|hun|hoon)\s+available\s+(.+?)(?:\.|$)/i,
    /(?:mai|main|me|i)\s+(.+?)\s+(?:me|में|mein)\s+(?:kaam|work|job)\s+(?:kar sakta|kar sakti|kar sakte|can do)/i,
    /(?:mai|main|me|i)\s+(.+?)\s+(?:ke liye|for)\s+(?:available|free|uplabdh)/i,
    /(?:meri|my)\s+(?:uplabdhta|उपलब्धता)\s+(.+?)(?:\.|$)/i,
    /मैं\s+(.+?)\s+(?:में|के लिए)\s+(?:उपलब्ध|काम कर सकता|काम कर सकती)/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const availText = match[1].trim().toLowerCase();
      
      // Check if the extracted text contains any of our keywords
      for (const [availType, keywords] of Object.entries(availabilityTypes)) {
        for (const keyword of keywords) {
          if (availText.includes(keyword)) {
            return availType;
          }
        }
      }
      
      return match[1].trim(); // Return as is if no specific type matches
    }
  }

  // Direct single-word answers that are likely to be about availability
  const directAvailabilityWords = ["day", "night", "din", "raat", "दिन", "रात", "morning", "evening", "सुबह", "शाम"];
  
  for (const word of directAvailabilityWords) {
    if (lowerText === word || lowerText.startsWith(word + " ") || lowerText.endsWith(" " + word)) {
      // Convert to standardized format
      if (["day", "din", "दिन", "morning", "afternoon", "सुबह", "दोपहर"].includes(word)) {
        return "Day";
      } else if (["night", "raat", "रात", "evening", "शाम"].includes(word)) {
        return "Night";
      }
      return cleanText;
    }
  }
  
  // If input is very short (likely a direct mention) and not a question
  const wordCount = cleanText.split(/\s+/).length;
  const questionWords = ['what', 'who', 'where', 'when', 'why', 'how', 'क्या', 'कौन', 'कहां', 'कब', 'क्यों', 'कैसे'];
  const isQuestion = questionWords.some(word => lowerText.includes(word));
  
  if (wordCount <= 3 && !isQuestion && cleanText.length >= 2) {
    return cleanText;
  }

  return null;
}

// Process speech input based on the current field
app.post("/process", (req, res) => {
  const { text, lang, currentField, retryCount } = req.body;

  let reply = "";
  let extractedValue = null;
  let success = false;

  // Extract information based on the current field
  switch (currentField) {
    case "name":
      extractedValue = extractName(text);
      if (extractedValue) {
        reply = `Thank you, I've recorded your name as ${extractedValue}.`;
        success = true;
      } else {
        // More helpful prompts for name extraction based on retry count
        if (retryCount === 0) {
          reply = "I couldn't understand your name. Please say your name clearly, starting with 'My name is'.";
        } else if (retryCount === 1) {
          reply = "I still didn't catch that. Could you please tell me your name again? For example, say 'My name is John'.";     
        } else if (retryCount === 2) {
          reply = "Let's try a different approach. Just say your name without any other words.";
        } else {
          reply = "I'm still having trouble. Please just say your first name only, nothing else.";
        }
      }
      break;

    case "gender":
      extractedValue = extractGender(text);
      if (extractedValue) {
        reply = `Thank you, I've recorded your gender as ${extractedValue}.`;
        success = true;
      } else {
        reply = "I couldn't understand your gender. Please say 'male', 'female', or 'other'.";
      }
      break;

    case "age":
      extractedValue = extractAge(text);
      if (extractedValue) {
        reply = `Thank you, I've recorded your age as ${extractedValue}.`;
        success = true;
      } else {
        reply = "I couldn't understand your age. Please say your age in years.";
      }
      break;

    case "address":
      // Try to extract the complete address first
      extractedValue = extractAddress(text);

      // If we have a partial address stored from previous attempts, update it
      const sessionId = req.ip || 'default'; // Simple session tracking

      if (!partialAddresses[sessionId]) {
        partialAddresses[sessionId] = {
          houseNumber: '',
          street: '',
          city: '',
          state: ''
        };
      }

      // Check for specific address parts if complete extraction failed
      if (!extractedValue) {
        // Try to extract house number and street
        const houseAndStreet = extractHouseAndStreet(text);
        if (houseAndStreet && !partialAddresses[sessionId].houseNumber) {
          partialAddresses[sessionId].houseNumber = houseAndStreet;
        }

        // Try to extract city
        const city = extractCity(text);
        if (city && !partialAddresses[sessionId].city) {
          partialAddresses[sessionId].city = city;
        }

        // Try to extract state
        const state = extractState(text);
        if (state && !partialAddresses[sessionId].state) {
          partialAddresses[sessionId].state = state;
        }

        // Check if we have enough partial information to construct an address
        const partialAddress = partialAddresses[sessionId];
        const hasEnoughInfo = partialAddress.houseNumber ||
                             (partialAddress.city && partialAddress.state);

        if (hasEnoughInfo) {
          // Construct address from parts
          const addressParts = [];
          if (partialAddress.houseNumber) addressParts.push(partialAddress.houseNumber);
          if (partialAddress.street) addressParts.push(partialAddress.street);
          if (partialAddress.city) addressParts.push(partialAddress.city);
          if (partialAddress.state) addressParts.push(partialAddress.state);

          extractedValue = addressParts.join(', ');
        }
      }

      if (extractedValue) {
        reply = `Thank you, I've recorded your address.`;
        success = true;
        // Clear the partial address
        delete partialAddresses[sessionId];
      } else {
        if (retryCount === 0) {
          reply = "I couldn't understand your address. Please say your complete address including house number, street, city and state.";
        } else if (retryCount === 1) {
          reply = "I still didn't catch your address. Try saying it in parts, starting with 'My address is'.";
        } else if (retryCount === 2) {
          const missingParts = [];
          const partialAddress = partialAddresses[sessionId];

          if (!partialAddress.houseNumber && !partialAddress.street) {
            missingParts.push("house number and street");
          }
          if (!partialAddress.city) {
            missingParts.push("city");
          }
          if (!partialAddress.state) {
            missingParts.push("state");
          }

          if (missingParts.length > 0) {
            reply = `I need more information. Please tell me your ${missingParts.join(', ')}.`;
          } else {
            reply = "Let's try a different approach. Please say your address in this format: house number, street name, city, state.";
          }
        } else {
          reply = "Please just state your address clearly without any other words.";
        }
      }
      break;

    case "phone":
      extractedValue = extractPhone(text);
      if (extractedValue) {
        reply = `Thank you, I've recorded your phone number.`;
        success = true;
      } else {
        reply = "I couldn't understand your phone number. Please say it again clearly.";
      }
      break;

    case "workExperience":
      extractedValue = extractWorkExperience(text);
      if (extractedValue) {
        reply = `Thank you, I've recorded your work experience as ${extractedValue}.`;
        success = true;
      } else {
        reply = "I couldn't understand your work experience. Please say how many years of experience you have.";
      }
      break;

    case "skills":
      extractedValue = extractSkills(text);
      if (extractedValue) {
        reply = `Thank you, I've recorded your skills.`;
        success = true;
      } else {
        reply = "I couldn't understand your skills. Please list your skills clearly.";
      }
      break;

    case "availability":
      extractedValue = extractAvailability(text);
      if (extractedValue) {
        reply = `Thank you, I've recorded your availability as ${extractedValue}.`;
        success = true;
      } else {
        reply = "I couldn't understand your availability. Please specify when you're available to work.";
      }
      break;

    default:
      reply = "I'm not sure what information you're trying to provide.";
  }

  // Add language-specific customization if needed
  if (lang === "hi-IN") {
    // Hindi-specific responses
    switch (currentField) {
      case "name":
        if (success) {
          reply = `धन्यवाद, मैंने आपका नाम ${extractedValue} के रूप में दर्ज कर लिया है।`;
        }
        break;
      case "gender":
        if (success) {
          reply = `धन्यवाद, मैंने आपका लिंग ${extractedValue} के रूप में दर्ज कर लिया है।`;
        } else {
          reply = "मुझे आपका लिंग समझ नहीं आया। कृपया 'पुरुष', 'महिला', या 'अन्य' कहें।";
        }
        break;
      case "age":
        if (success) {
          reply = `धन्यवाद, मैंने आपकी उम्र ${extractedValue} के रूप में दर्ज कर ली है।`;
        } else {
          reply = "मुझे आपकी उम्र समझ नहीं आई। कृपया अपनी उम्र वर्षों में बताएं।";
        }
        break;
      case "address":
        if (success) {
          reply = `धन्यवाद, मैंने आपका पता दर्ज कर लिया है।`;
        }
        break;
      case "phone":
        if (success) {
          reply = `धन्यवाद, मैंने आपका फोन नंबर दर्ज कर लिया है।`;
        } else {
          reply = "मुझे आपका फोन नंबर समझ नहीं आया। कृपया इसे फिर से स्पष्ट रूप से बताएं।";
        }
        break;
      case "workExperience":
        if (success) {
          reply = `धन्यवाद, मैंने आपका कार्य अनुभव ${extractedValue} के रूप में दर्ज कर लिया है।`;
        } else {
          reply = "मुझे आपका कार्य अनुभव समझ नहीं आया। कृपया बताएं कि आपके पास कितने साल का अनुभव है।";
        }
        break;
      case "skills":
        if (success) {
          reply = `धन्यवाद, मैंने आपके कौशल दर्ज कर लिए हैं।`;
        } else {
          reply = "मुझे आपके कौशल समझ नहीं आए। कृपया अपने कौशल स्पष्ट रूप से बताएं।";
        }
        break;
      case "availability":
        if (success) {
          reply = `धन्यवाद, मैंने आपकी उपलब्धता ${extractedValue} के रूप में दर्ज कर ली है।`;
        } else {
          reply = "मुझे आपकी उपलब्धता समझ नहीं आई। कृपया बताएं कि आप कब काम करने के लिए उपलब्ध हैं।";
        }
        break;
    }
  }

  res.json({
    reply,
    extractedValue,
    success
  });
});

// Add a new endpoint to save the user profile
app.post("/saveProfile", async (req, res) => {
  try {
    const userData = req.body;
    
    // Convert age to number if it's a string
    if (userData.age && typeof userData.age === 'string') {
      userData.age = parseInt(userData.age);
    }
    
    const user = new User(userData);
    await user.save();
    
    res.status(201).json({ 
      success: true, 
      message: "Profile saved successfully", 
      user: user 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: "Failed to save profile", 
      error: error.message 
    });
  }
});

// Add an endpoint to get a specific user profile
app.get("/profile/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, user: user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Add an endpoint to populate the job listings
app.post("/populateJobs", async (req, res) => {
  try {
    // First, delete all existing jobs
    await Job.deleteMany({});
    
    // Then insert the new jobs
    const jobsData = req.body;
    const result = await Job.insertMany(jobsData);
    
    res.status(201).json({ 
      success: true, 
      message: "Jobs populated successfully", 
      count: result.length 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: "Failed to populate jobs", 
      error: error.message 
    });
  }
});

// Add an endpoint to get all job listings
app.get("/jobs", async (req, res) => {
  try {
    const jobs = await Job.find();
    res.status(200).json({ success: true, jobs: jobs });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.listen(5000, () => console.log("Server running on http://localhost:5000"));
