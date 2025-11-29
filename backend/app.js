const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();

// Import models
const User = require('./models/user');
const Job = require('./models/job');
const AuthUser = require('./models/authUser');

// Import address helper functions
const { extractHouseAndStreet, extractCity, extractState, partialAddresses } = require('./addressHelper');

// Import the Ollama service and language detection service
const OllamaService = require('./services/OllamaService');
const LanguageDetectionService = require('./services/LanguageDetectionService');

// Initialize services
const ollamaService = new OllamaService('http://localhost:11434'); 
const languageDetectionService = new LanguageDetectionService();

// Track if Ollama service is available
let ollamaAvailable = false;

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

// Import routes
const authRoutes = require('./routes/authRoutes');

// Use routes
app.use('/api/auth', authRoutes);

// Natural language processing functions for extracting information
function extractName(text) {
  console.log('Attempting to extract name from:', text);
  
  // Match patterns like "My name is John", "I am John", "John is my name", etc.
  const patterns = [
    /my name is\s+([A-Za-z\s\.]+)(?:\s+and|\s+but|\s+or|$|\.|,)/i,
    /i am\s+([A-Za-z\s\.]+)(?:\s+and|\s+but|\s+or|$|\.|,)/i,
    /(?:call me|i'm|i'm called)\s+([A-Za-z\s\.]+)(?:\s+and|\s+but|\s+or|$|\.|,)/i,
    /([A-Za-z\s\.]+)\s+(?:is my name)(?:\s+and|\s+but|\s+or|$|\.|,)/i,
    /mera naam\s+([A-Za-z\s\.]+)(?:\s+hai|\s+h|\s+he|$|\.|,)/i,
    /mera name\s+([A-Za-z\s\.]+)(?:\s+hai|\s+h|\s+he|$|\.|,)/i,
    /naam\s+([A-Za-z\s\.]+)(?:\s+hai|\s+h|\s+he|$|\.|,)/i,
    /(?:^|\s+)([A-Za-z\s\.]+)(?:\s+hai mera naam)/i,
    /name[\s:]+([A-Za-z\s\.]+)(?:$|\.|,)/i,
    /myself\s+([A-Za-z\s\.]+)(?:\s+and|\s+but|\s+or|$|\.|,)/i,
    /this is\s+([A-Za-z\s\.]+)(?:\s+and|\s+but|\s+or|$|\.|,)/i,
    /(?:^|my name)[\s:]+([A-Za-z\s\.]+)(?:$|\.|,)/i,
    // Simplified pattern - just match first 2-3 words if they look like a name
    /^([A-Za-z][A-Za-z\s\.]{1,29})(?:\s|$|\.|,)/i,
    // Just name without context (when asked to just say your name)
    /^([A-Za-z][A-Za-z\s\.]{1,29})$/i
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

  // Check if the text could be a direct name (1-5 words, not too short, not too long)
  if (wordCount <= 5 && directNameText.length >= 2 && directNameText.length <= 50) {
    // Additional validation - check if it contains question words or common dialogue phrases
    const questionWords = ['what', 'who', 'where', 'when', 'why', 'how'];
    const commonPhrases = ['yes', 'no', 'okay', 'thank you', 'thanks', 'please', 'hello', 'hi', 'bye'];
    const stopWords = ['the', 'is', 'am', 'are', 'a', 'an', 'and', 'but', 'or', 'if', 'because', 'as', 'with'];

    const lowerText = directNameText.toLowerCase();
    const containsQuestionWord = questionWords.some(word => lowerText.includes(word));
    const isCommonPhrase = commonPhrases.some(phrase => lowerText === phrase);
    const hasOnlyStopWords = lowerText.split(/\s+/).every(word => stopWords.includes(word));
    
    // Allow a wider range of characters for names, including non-English characters
    const isValidName = /^[\p{L}\s\.\-']+$/u.test(directNameText);
    
    if (!containsQuestionWord && !isCommonPhrase && !hasOnlyStopWords && isValidName) {
      console.log('Extracted name from direct input:', directNameText);
      return directNameText;
    }
    
    // If the text is short, doesn't contain question words, and starts with a capital letter,
    // it might be a name without context
    if (wordCount <= 3 && directNameText.length >= 2 && !containsQuestionWord && 
        /^[A-Z\p{Lu}]/.test(directNameText)) {
      console.log('Extracted name from simple text (probably a name):', directNameText);
      return directNameText;
    }
  }
  
  console.log('Failed to extract name from text:', text);
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

  // Check for Hindi gender words
  if (lowerText.includes("पुरुष") || lowerText.includes("लड़का") || 
      lowerText.includes("आदमी") || lowerText.includes("purush")) {
    return "Male";
  } else if (lowerText.includes("महिला") || lowerText.includes("लड़की") || 
             lowerText.includes("स्त्री") || lowerText.includes("mahila") ||
             lowerText.includes("stree")) {
    return "Female";
  } else if (lowerText.includes("अन्य") || lowerText.includes("थर्ड जेंडर") ||
             lowerText.includes("anya") || lowerText.includes("third gender")) {
    return "Other";
  }

  return null;
}

function extractAge(text) {
  // Match patterns like "I am 25 years old", "25", "25 years", etc.
  const patterns = [
    /i am (\d+)(?:\s+years)?(?:\s+old)?/i,
    /(\d+)(?:\s+years)?(?:\s+old)?/i,
    /age(?:\s+is)?(?:\s+of)?(?:\s+:)?\s+(\d+)/i,
    /meri umr (\d+)(?:\s+saal)?(?:\s+hai)?/i,
    /meri age (\d+)(?:\s+years)?(?:\s+hai)?/i,
    /मेरी उम्र (\d+)(?:\s+साल)?(?:\s+है)?/i,
    /मैं (\d+)(?:\s+साल)?(?:\s+का)?(?:\s+हूँ)?/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const age = parseInt(match[1]);
      if (age >= 15 && age <= 120) {  // Basic validation
        return age;
      }
    }
  }

  // Direct number fallback
  const directMatch = text.trim().match(/^(\d+)$/);
  if (directMatch && directMatch[1]) {
    const age = parseInt(directMatch[1]);
    if (age >= 15 && age <= 120) {
      return age;
    }
  }

  return null;
}

function extractPhone(text) {
  // Remove spaces from text to handle phone numbers with spaces between digits
  const noSpaceText = text.replace(/\s+/g, '');
  
  // Match patterns for 10-digit Indian phone numbers, with or without country code
  const patterns = [
    /(\+?91)?[789]\d{9}/,  // Indian mobile numbers with optional +91
    /(\d{10})/,             // Any 10-digit number
    /(\d{5}[\s-]?\d{5})/    // 10-digit number with optional space or dash in middle
  ];

  for (const pattern of patterns) {
    const match = noSpaceText.match(pattern);
    if (match) {
      // Extract just the last 10 digits to ensure it's a valid phone number
      const fullMatch = match[0];
      const digits = fullMatch.replace(/\D/g, '');
      const last10 = digits.slice(-10);
      
      if (last10.length === 10) {
        return last10;
      }
    }
  }

  return null;
}

function extractAddress(text) {
  // Try to extract house number and street
  const houseAndStreet = extractHouseAndStreet(text);
  
  // Try to extract city
  const city = extractCity(text);
  
  // Try to extract state
  const state = extractState(text);
  
  // If we couldn't extract at least a city or house/street, return null
  if ((!houseAndStreet || houseAndStreet === '') && (!city || city === '')) {
    return null;
  }
  
  // Construct and return the extracted address
  let address = '';
  if (houseAndStreet) address += houseAndStreet;
  if (city) {
    if (address) address += ', ';
    address += city;
  }
  if (state) {
    if (address) address += ', ';
    address += state;
  }
  
  return address;
}

function extractExperience(text) {
  // Match patterns for years of experience
  const patterns = [
    /(\d+)(?:\s+years?)?(?:\s+of)?(?:\s+experience)/i,
    /experience(?:\s+of)?(?:\s+is)?(?:\s+:)?\s+(\d+)(?:\s+years?)?/i,
    /worked(?:\s+for)?\s+(\d+)(?:\s+years?)/i,
    /(\d+)(?:\s+years?)?(?:\s+experience)/i,
    /(\d+)(?:\s+साल)?(?:\s+का)?(?:\s+अनुभव)/i,
    /अनुभव(?:\s+:)?\s+(\d+)(?:\s+साल)?/i,
    /मुझे\s+(\d+)(?:\s+साल)?(?:\s+का)?(?:\s+अनुभव)?/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const years = parseInt(match[1]);
      if (years >= 0 && years <= 50) {  // Basic validation
        return years;
      }
    }
  }

  // Check for "fresher" or "no experience"
  const lowerText = text.toLowerCase();
  if (lowerText.includes("fresher") || 
      lowerText.includes("no experience") ||
      lowerText.includes("0 year") || 
      lowerText.includes("zero year") ||
      lowerText.includes("नौसिखिया") ||
      lowerText.includes("फ्रेशर") ||
      lowerText.includes("कोई अनुभव नहीं")) {
    return 0;
  }

  return null;
}

function extractEducation(text) {
  const lowerText = text.toLowerCase();
  
  // Check for standard education levels
  const educationLevels = {
    'primary': ['primary school', 'primary education', 'elementary', 'प्राथमिक शिक्षा', 'प्राइमरी स्कूल'],
    'middle school': ['middle school', 'मिडिल स्कूल'],
    '10th': ['10th', '10th class', 'secondary', 'ssc', 'दसवीं', 'दसवीं कक्षा', 'माध्यमिक', 'हाई स्कूल'],
    '12th': ['12th', '12th class', 'higher secondary', 'hsc', 'intermediate', 'बारहवीं', 'बारहवीं कक्षा', 'उच्च माध्यमिक'],
    'diploma': ['diploma', 'polytechnic', 'डिप्लोमा', 'पॉलिटेक्निक'],
    'bachelor': ['bachelor', 'b.a.', 'b.sc.', 'b.com', 'b.tech', 'be', 'undergraduate', 'graduation', 'bca', 'bba', 's्नातक', 'बी.ए.', 'बी.एससी.', 'बी.कॉम', 'बी.टेक', 'बीसीए', 'बीबीए'],
    'master': ['master', 'm.a.', 'm.sc.', 'm.com', 'm.tech', 'me', 'mca', 'mba', 'post graduation', 'post-graduation', 'postgraduate', 'masters', 'परास्नातक', 'एम.ए.', 'एम.एससी.', 'एम.कॉम', 'एम.टेक', 'एमसीए', 'एमबीए'],
    'doctorate': ['phd', 'doctorate', 'doctoral', 'पीएचडी', 'डॉक्टरेट']
  };
  
  // Find the highest education level mentioned
  let highestLevel = null;
  const levelPriority = ['doctorate', 'master', 'bachelor', 'diploma', '12th', '10th', 'middle school', 'primary'];
  
  for (const level of levelPriority) {
    const keywords = educationLevels[level];
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      highestLevel = level;
      break;
    }
  }
  
  return highestLevel;
}

function extractSkills(text) {
  // Define common job skills categories
  const skillCategories = {
    'technical': [
      'programming', 'coding', 'software', 'hardware', 'computer', 'technology', 'development', 'it',
      'web', 'application', 'mobile', 'database', 'coding', 'network', 'system', 'admin', 'security',
      'python', 'java', 'javascript', 'html', 'css', 'react', 'angular', 'vue', 'node', 'express', 'php',
      'laravel', 'django', 'flask', 'ruby', 'rails', 'c++', 'c#', '.net', 'sql', 'nosql', 'mongodb',
      'mysql', 'postgresql', 'oracle', 'aws', 'azure', 'cloud', 'devops', 'docker', 'kubernetes',
      'linux', 'windows', 'unix', 'git', 'github', 'gitlab', 'bitbucket', 'api', 'rest', 'soap',
      'frontend', 'backend', 'full stack', 'fullstack', 'tester', 'qa', 'quality', 'seo', 'excel',
      'word', 'powerpoint', 'office', 'microsoft', 'adobe', 'photoshop', 'illustrator', 'indesign',
      'प्रोग्रामिंग', 'कोडिंग', 'सॉफ्टवेयर', 'हार्डवेयर', 'कंप्यूटर', 'तकनीक', 'डेवलपमेंट', 'आईटी',
      'वेब', 'एप्लिकेशन', 'मोबाइल', 'डेटाबेस', 'नेटवर्क', 'सिस्टम', 'एडमिन', 'सिक्योरिटी'
    ],
    'construction': [
      'construction', 'building', 'masonry', 'carpentry', 'plumbing', 'electrical', 'welding', 'painting',
      'flooring', 'roofing', 'tiling', 'concrete', 'cement', 'brick', 'stone', 'wood', 'metal', 
      'निर्माण', 'बिल्डिंग', 'राजमिस्त्री', 'बढ़ई', 'प्लंबिंग', 'इलेक्ट्रिकल', 'वेल्डिंग', 'पेंटिंग', 'फर्श',
      'छत', 'टाइलिंग', 'कंक्रीट', 'सीमेंट', 'ईंट', 'पत्थर', 'लकड़ी', 'धातु'
    ],
    'agriculture': [
      'farming', 'agriculture', 'crops', 'livestock', 'irrigation', 'harvesting', 'planting', 'fertilizing',
      'tractor', 'खेती', 'कृषि', 'फसल', 'पशुपालन', 'सिंचाई', 'कटाई', 'रोपण', 'उर्वरक', 'ट्रैक्टर'
    ],
    'hospitality': [
      'cooking', 'chef', 'waiter', 'waitress', 'hotel', 'restaurant', 'housekeeping', 'front desk', 'reception',
      'bartender', 'catering', 'food', 'beverage', 'customer service', 'रसोई', 'शेफ', 'वेटर', 'वेट्रेस', 'होटल',
      'रेस्तरां', 'हाउसकीपिंग', 'रिसेप्शन', 'बारटेंडर', 'खानपान', 'खाद्य', 'पेय', 'ग्राहक सेवा'
    ],
    'healthcare': [
      'medical', 'nursing', 'doctor', 'nurse', 'patient care', 'pharmacy', 'pharmacist', 'therapist', 
      'therapy', 'physiotherapy', 'dental', 'dentist', 'surgeon', 'surgery', 'चिकित्सा', 'नर्सिंग', 'डॉक्टर', 
      'नर्स', 'रोगी देखभाल', 'फार्मेसी', 'फार्मासिस्ट', 'थेरेपिस्ट', 'थेरेपी', 'फिजियोथेरेपी', 'दंत', 'दंत चिकित्सक',
      'सर्जन', 'सर्जरी'
    ],
    'transportation': [
      'driver', 'driving', 'chauffeur', 'truck', 'bus', 'taxi', 'delivery', 'transport', 'logistics', 'shipping',
      'warehouse', 'inventory', 'ड्राइवर', 'ड्राइविंग', 'शोफर', 'ट्रक', 'बस', 'टैक्सी', 'डिलीवरी', 'परिवहन', 'लॉजिस्टिक्स',
      'शिपिंग', 'वेयरहाउस', 'इन्वेंटरी'
    ],
    'cleaning': [
      'cleaner', 'cleaning', 'janitor', 'housekeeping', 'maid', 'सफाई', 'क्लीनर', 'जनरल', 'हाउसकीपिंग', 'नौकरानी'
    ],
    'security': [
      'guard', 'security', 'surveillance', 'patrol', 'watchman', 'गार्ड', 'सुरक्षा', 'निगरानी', 'पेट्रोल', 'चौकीदार'
    ],
    'sales': [
      'sales', 'marketing', 'retail', 'cashier', 'customer service', 'store', 'shop', 'बिक्री', 'मार्केटिंग', 
      'रिटेल', 'कैशियर', 'ग्राहक सेवा', 'स्टोर', 'दुकान'
    ],
    'teaching': [
      'teaching', 'teacher', 'education', 'tutor', 'professor', 'instructor', 'शिक्षण', 'शिक्षक', 'शिक्षा', 'ट्यूटर',
      'प्रोफेसर', 'प्रशिक्षक'
    ],
    'management': [
      'management', 'manager', 'supervisor', 'leader', 'administration', 'executive', 'director',
      'प्रबंधन', 'प्रबंधक', 'सुपरवाइजर', 'लीडर', 'प्रशासन', 'एक्जीक्यूटिव', 'निदेशक'
    ]
  };

  const lowerText = text.toLowerCase();
  const extractedSkills = [];

  // Check for skill categories
  for (const [category, keywords] of Object.entries(skillCategories)) {
    if (keywords.some(keyword => lowerText.includes(keyword.toLowerCase()))) {
      extractedSkills.push(category);
    }
  }
  
  // If multiple skills are found, join them with commas
  if (extractedSkills.length > 0) {
    return extractedSkills.join(', ');
  }
  
  // If no specific skill categories are found, check if the text could be a direct list of skills
  const wordCount = lowerText.split(/\s+/).length;
  if (wordCount <= 10 && !lowerText.includes('?') && !lowerText.includes('please') && 
      !lowerText.includes('thank') && !lowerText.includes('hello') && !lowerText.includes('hi')) {
    return text;  // Return the original text as skills
  }
  
  return null;
}

function extractAvailability(text) {
  const lowerText = text.toLowerCase();

  // Define patterns for common availability expressions
  const fullTimePatterns = [
    /full[\s-]?time/i, 
    /फुल[\s-]?टाइम/i,
    /पूर्णकालिक/i
  ];
  
  const partTimePatterns = [
    /part[\s-]?time/i, 
    /पार्ट[\s-]?टाइम/i,
    /आंशिक[\s-]?समय/i
  ];
  
  const weekendPatterns = [
    /weekends?/i, 
    /सप्ताहांत/i,
    /वीकेंड/i
  ];
  
  const weekdayPatterns = [
    /weekdays?/i, 
    /कार्य[\s-]?दिवस/i
  ];
  
  const eveningPatterns = [
    /evenings?/i, 
    /शाम/i,
    /सायंकाल/i
  ];
  
  const morningPatterns = [
    /mornings?/i, 
    /सुबह/i,
    /प्रातः/i
  ];
  
  const nightPatterns = [
    /nights?/i, 
    /रात/i
  ];
  
  const flexiblePatterns = [
    /flexi(ble)?/i, 
    /any[\s-]?time/i,
    /लचीला/i,
    /किसी[\s-]?भी[\s-]?समय/i
  ];

  // Check for each pattern type
  if (flexiblePatterns.some(pattern => lowerText.match(pattern))) {
    return "Flexible";
  } else if (fullTimePatterns.some(pattern => lowerText.match(pattern))) {
    return "Full-time";
  } else if (partTimePatterns.some(pattern => lowerText.match(pattern))) {
    return "Part-time";
  } else if (weekendPatterns.some(pattern => lowerText.match(pattern))) {
    return "Weekends";
  } else if (weekdayPatterns.some(pattern => lowerText.match(pattern))) {
    return "Weekdays";
  } else if (morningPatterns.some(pattern => lowerText.match(pattern))) {
    return "Mornings";
  } else if (eveningPatterns.some(pattern => lowerText.match(pattern))) {
    return "Evenings";
  } else if (nightPatterns.some(pattern => lowerText.match(pattern))) {
    return "Nights";
  }
  
  // Days of the week
  const daysPatterns = {
    'Monday': [/monday/i, /सोमवार/i],
    'Tuesday': [/tuesday/i, /मंगलवार/i],
    'Wednesday': [/wednesday/i, /बुधवार/i],
    'Thursday': [/thursday/i, /गुरुवार/i, /बृहस्पतिवार/i],
    'Friday': [/friday/i, /शुक्रवार/i],
    'Saturday': [/saturday/i, /शनिवार/i],
    'Sunday': [/sunday/i, /रविवार/i]
  };
  
  const foundDays = [];
  for (const [day, patterns] of Object.entries(daysPatterns)) {
    if (patterns.some(pattern => lowerText.match(pattern))) {
      foundDays.push(day);
    }
  }
  
  if (foundDays.length > 0) {
    return foundDays.join(', ');
  }
  
  return null;
}

// Initialize Ollama service availability check
(async function checkOllamaAvailability() {
  try {
    ollamaAvailable = await ollamaService.isAvailable();
    if (ollamaAvailable) {
      const models = await ollamaService.listModels();
      console.log('Ollama service is available. Available models:', models);
    } else {
      console.log('Ollama service is not available. Using fallback extraction methods.');
    }
  } catch (err) {
    console.error('Error checking Ollama service:', err.message);
  }
})();

// Process speech input based on the current field
app.post("/process", async (req, res) => {
  const { text, lang, currentField, retryCount } = req.body;
  
  console.log(`\n----- PROCESSING REQUEST -----`);
  console.log(`Field: ${currentField}, Text: "${text}", Language: ${lang}, Retry Count: ${retryCount}`);

  let reply = "";
  let extractedValue = null;
  let success = false;
  
  // Auto-detect language if not provided
  const language = lang || languageDetectionService.detectLanguage(text);
  const isHindi = language.startsWith('hi');
  console.log(`Detected Language: ${language}, Is Hindi: ${isHindi}`);
  
  // Try using Ollama for extraction if available
  if (ollamaAvailable) {
    try {
      console.log(`Using Ollama for ${currentField} extraction`);
      const result = await ollamaService.extractEntity(text, currentField, language);
      
      if (result.success && result.extracted) {
        extractedValue = result.extracted[currentField];
        success = true;
      } else {
        console.log('Ollama extraction failed, falling back to rule-based extraction');
      }
    } catch (error) {
      console.error('Ollama extraction error:', error.message);
    }
  }
  
  // If Ollama failed or isn't available, use rule-based extraction
  if (!success) {
    console.log(`Using rule-based extraction for ${currentField}`);
    
    switch (currentField) {
      case "name":
        extractedValue = extractName(text);
        success = !!extractedValue;
        break;
      case "gender":
        extractedValue = extractGender(text);
        success = !!extractedValue;
        break;
      case "age":
        extractedValue = extractAge(text);
        success = !!extractedValue;
        break;
      case "phone":
        extractedValue = extractPhone(text);
        success = !!extractedValue;
        break;
      case "address":
        extractedValue = extractAddress(text);
        success = !!extractedValue;
        break;
      case "experience":
        extractedValue = extractExperience(text);
        success = extractedValue !== null;
        break;
      case "education":
        extractedValue = extractEducation(text);
        success = !!extractedValue;
        break;
      case "skills":
        extractedValue = extractSkills(text);
        success = !!extractedValue;
        break;
      case "availability":
        extractedValue = extractAvailability(text);
        success = !!extractedValue;
        break;
    }
  }
  
  // Prepare the response message based on extraction success
  if (!isHindi) {
    // English responses
    switch (currentField) {
      case "name":
        if (success) {
          reply = `Thank you, I've recorded your name as ${extractedValue}.`;
        } else {
          reply = "I couldn't understand your name. Please say your name clearly.";
        }
        break;
      case "gender":
        if (success) {
          reply = `Thank you, I've recorded your gender as ${extractedValue}.`;
        } else {
          reply = "I couldn't understand your gender. Please specify Male, Female, or Other.";
        }
        break;
      case "age":
        if (success) {
          reply = `Thank you, I've recorded your age as ${extractedValue}.`;
        } else {
          reply = "I couldn't understand your age. Please say your age in years.";
        }
        break;
      case "phone":
        if (success) {
          reply = `Thank you, I've recorded your phone number as ${extractedValue}.`;
        } else {
          reply = "I couldn't understand your phone number. Please say a valid 10-digit number.";
        }
        break;
      case "address":
        if (success) {
          reply = `Thank you, I've recorded your address as ${extractedValue}.`;
        } else {
          reply = "I couldn't understand your address. Please provide your address with city and state.";
        }
        break;
      case "experience":
        if (success) {
          if (extractedValue === 0) {
            reply = "Thank you, I've recorded that you're a fresher with no prior experience.";
          } else {
            reply = `Thank you, I've recorded your experience as ${extractedValue} years.`;
          }
        } else {
          reply = "I couldn't understand your experience. Please specify how many years of experience you have.";
        }
        break;
      case "education":
        if (success) {
          reply = `Thank you, I've recorded your education as ${extractedValue}.`;
        } else {
          reply = "I couldn't understand your education. Please specify your highest education level.";
        }
        break;
      case "skills":
        if (success) {
          reply = `Thank you, I've recorded your skills.`;
        } else {
          reply = "I couldn't understand your skills. Please clearly state the skills you possess.";
        }
        break;
      case "availability":
        if (success) {
          reply = `Thank you, I've recorded your availability as ${extractedValue}.`;
        } else {
          reply = "I couldn't understand when you're available to work. Please specify (e.g., full-time, weekends, etc.).";
        }
        break;
    }
  } else {
    // Hindi responses
    switch (currentField) {
      case "name":
        if (success) {
          reply = `धन्यवाद, मैंने आपका नाम ${extractedValue} दर्ज कर लिया है।`;
        } else {
          reply = "मुझे आपका नाम समझ नहीं आया। कृपया अपना नाम स्पष्ट रूप से बताएं।";
        }
        break;
      case "gender":
        if (success) {
          reply = `धन्यवाद, मैंने आपका लिंग ${extractedValue} के रूप में दर्ज कर लिया है।`;
        } else {
          reply = "मुझे आपका लिंग समझ नहीं आया। कृपया पुरुष, महिला या अन्य बताएं।";
        }
        break;
      case "age":
        if (success) {
          reply = `धन्यवाद, मैंने आपकी उम्र ${extractedValue} साल दर्ज कर ली है।`;
        } else {
          reply = "मुझे आपकी उम्र समझ नहीं आई। कृपया अपनी उम्र वर्षों में बताएं।";
        }
        break;
      case "phone":
        if (success) {
          reply = `धन्यवाद, मैंने आपका फोन नंबर ${extractedValue} दर्ज कर लिया है।`;
        } else {
          reply = "मुझे आपका फोन नंबर समझ नहीं आया। कृपया एक वैध 10-अंक का नंबर बताएं।";
        }
        break;
      case "address":
        if (success) {
          reply = `धन्यवाद, मैंने आपका पता ${extractedValue} दर्ज कर लिया है।`;
        } else {
          reply = "मुझे आपका पता समझ नहीं आया। कृपया अपना पता शहर और राज्य के साथ बताएं।";
        }
        break;
      case "experience":
        if (success) {
          if (extractedValue === 0) {
            reply = "धन्यवाद, मैंने दर्ज किया है कि आप बिना किसी पूर्व अनुभव के एक फ्रेशर हैं।";
          } else {
            reply = `धन्यवाद, मैंने आपका अनुभव ${extractedValue} वर्ष दर्ज कर लिया है।`;
          }
        } else {
          reply = "मुझे आपका अनुभव समझ नहीं आया। कृपया बताएं कि आपके पास कितने साल का अनुभव है।";
        }
        break;
      case "education":
        if (success) {
          reply = `धन्यवाद, मैंने आपकी शिक्षा ${extractedValue} दर्ज कर ली है।`;
        } else {
          reply = "मुझे आपकी शिक्षा समझ नहीं आई। कृपया अपनी उच्चतम शिक्षा का स्तर बताएं।";
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

  // Log the exact response object for debugging
  console.log(`Extraction Result - Field: ${currentField}, Success: ${success}, Value: ${JSON.stringify(extractedValue)}`);
  console.log(`----- REQUEST COMPLETED -----\n`);
  
  // Make sure we're not sending undefined values
  const responseObject = {
    reply,
    extractedValue: extractedValue !== undefined ? extractedValue : null,
    success: !!success
  };
  
  console.log('Sending response:', JSON.stringify(responseObject));
  
  res.json(responseObject);
});

// Add a new endpoint to save the user profile
app.post("/saveProfile", async (req, res) => {
  try {
    const userData = req.body;
    const { authUserId } = userData;
    
    // Convert age to number if it's a string
    if (userData.age && typeof userData.age === 'string') {
      userData.age = parseInt(userData.age);
    }
    
    const user = new User(userData);
    await user.save();
    
    // If authUserId is provided, link this profile to the auth user
    if (authUserId) {
      await AuthUser.findByIdAndUpdate(
        authUserId,
        {
          profileId: user._id,
          profileCompleted: true
        }
      );
    }
    
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

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});