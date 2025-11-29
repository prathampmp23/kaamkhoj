const axios = require("axios");

/**
 * Service to interact with a local Ollama instance
 */
class OllamaService {
  constructor(baseUrl = "http://localhost:11434") {
    this.baseUrl = baseUrl;
    this.model = "qwen2.5:7b"; // Using qwen2.5:7b for better multilingual support
  }

  /**
   * Extract entities from text using a local LLM through Ollama
   * @param {string} text - The text to process
   * @param {string} field - The type of entity to extract (name, address, etc)
   * @param {string} language - The language code (en-IN, hi-IN, etc)
   * @returns {Promise<{success: boolean, extracted: object|null, raw: string}>}
   */
  async extractEntity(text, field, language = "en-IN") {
    const isHindi = language.startsWith("hi");

    // Define the appropriate prompt based on field and language
    let prompt;

    // Create field-specific prompts in English and Hindi
    switch (field) {
      case "name":
        prompt = isHindi
          ? `निम्नलिखित वाक्य से व्यक्ति का नाम निकालें और केवल JSON प्रारूप {"name":"<नाम>"} में वापस करें।
      यदि नाम नहीं मिलता है, तो {"name":null} वापस करें।
      केवल JSON प्रारूप में जवाब दें। अतिरिक्त टेक्स्ट न जोड़ें।

      प्रारूप के उदाहरण:
      {"name":"राम सिंह"}
      {"name":"अमिता पटेल"}
      {"name":null}

      इनपुट: "${text}"`
                : `Extract the person's name from the following sentence and return ONLY in JSON format {"name":"<the name>"}. 
      If no name is found, return {"name":null}.
      Reply ONLY with the JSON format and nothing else. Do not add explanations.

      Format examples:
      {"name":"John Smith"}
      {"name":"Maria Rodriguez"}
      {"name":null}

      Input: "${text}"`;
              break;

            case "gender":
              prompt = isHindi
                ? `निम्नलिखित वाक्य से व्यक्ति का लिंग निकालें और केवल JSON प्रारूप {"gender":"<लिंग>"} में वापस करें।
      यदि लिंग नहीं मिलता है, तो {"gender":null} वापस करें।
      लिंग केवल "पुरुष", "महिला", या "अन्य" हो सकता है।
      इनपुट: "${text}"`
                : `Extract the person's gender from the following sentence and return only in JSON format {"gender":"<gender>"}.
      If no gender is found, return {"gender":null}.
      Gender should be only "Male", "Female", or "Other".
      Input: "${text}"`;
              break;

            case "age":
              prompt = isHindi
                ? `निम्नलिखित वाक्य से व्यक्ति की उम्र निकालें और केवल JSON प्रारूप {"age":"<उम्र>"} में वापस करें।
      यदि उम्र नहीं मिलती है, तो {"age":null} वापस करें।
      इनपुट: "${text}"`
                : `Extract the person's age from the following sentence and return only in JSON format {"age":"<age>"}.
      If no age is found, return {"age":null}.
      Input: "${text}"`;
              break;

            case "address":
              prompt = isHindi
                ? `निम्नलिखित वाक्य से व्यक्ति का पता निकालें और केवल JSON प्रारूप {"address":"<पूरा पता>"} में वापस करें।
      यदि पता नहीं मिलता है, तो {"address":null} वापस करें।
      इनपुट: "${text}"`
                : `Extract the person's address from the following sentence and return only in JSON format {"address":"<complete address>"}.
      If no address is found, return {"address":null}.
      Input: "${text}"`;
              break;

            case "phone":
              prompt = isHindi
                ? `निम्नलिखित वाक्य से व्यक्ति का फोन नंबर निकालें और केवल JSON प्रारूप {"phone":"<फोन नंबर>"} में वापस करें।
      यदि फोन नंबर नहीं मिलता है, तो {"phone":null} वापस करें।
      इनपुट: "${text}"`
                : `Extract the person's phone number from the following sentence and return only in JSON format {"phone":"<phone number>"}.
      If no phone number is found, return {"phone":null}.
      Input: "${text}"`;
              break;

            case "workExperience":
              prompt = isHindi
                ? `निम्नलिखित वाक्य से व्यक्ति का कार्य अनुभव निकालें और केवल JSON प्रारूप {"workExperience":"<कार्य अनुभव>"} में वापस करें।
      यदि कार्य अनुभव नहीं मिलता है, तो {"workExperience":null} वापस करें।
      इनपुट: "${text}"`
                : `Extract the person's work experience from the following sentence and return only in JSON format {"workExperience":"<work experience>"}.
      If no work experience is found, return {"workExperience":null}.
      Input: "${text}"`;
              break;

            case "skills":
              prompt = isHindi
                ? `निम्नलिखित वाक्य से व्यक्ति के कौशल निकालें और केवल JSON प्रारूप {"skills":"<कौशल की सूची>"} में वापस करें।
      यदि कोई कौशल नहीं मिलता है, तो {"skills":null} वापस करें।
      इनपुट: "${text}"`
                : `Extract the person's skills from the following sentence and return only in JSON format {"skills":"<list of skills>"}.
      If no skills are found, return {"skills":null}.
      Input: "${text}"`;
              break;

            case "availability":
              prompt = isHindi
                ? `निम्नलिखित वाक्य से व्यक्ति की उपलब्धता निकालें और केवल JSON प्रारूप {"availability":"<उपलब्धता>"} में वापस करें।
      यदि उपलब्धता नहीं मिलती है, तो {"availability":null} वापस करें।
      इनपुट: "${text}"`
                : `Extract the person's availability from the following sentence and return only in JSON format {"availability":"<availability>"}.
      If no availability is found, return {"availability":null}.
      Input: "${text}"`;
              break;

            default:
              prompt = isHindi
                ? `निम्नलिखित वाक्य से प्रासंगिक जानकारी निकालें और JSON प्रारूप {"value":"<निकाली गई जानकारी>"} में वापस करें। 
      यदि कोई प्रासंगिक जानकारी नहीं मिलती है, तो {"value":null} वापस करें।
      इनपुट: "${text}"`
                : `Extract relevant information from the following sentence and return in JSON format {"value":"<extracted information>"}.
      If no relevant information is found, return {"value":null}.
      Input: "${text}"`;
    }

    try {
      // Call the Ollama API
      const response = await axios.post(`${this.baseUrl}/api/generate`, {
        model: this.model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.1, // Low temperature for more deterministic extraction
        },
      });

      // Extract the response text
      const output = response.data.response;
      console.log(`Ollama raw response for ${field}:`, output);

      // Try to parse JSON from the response
      try {
        // Extract JSON from the response (handling potential prefixes/suffixes)
        const jsonMatch = output.match(/\{[\s\S]*?\}/g);
        if (jsonMatch && jsonMatch.length > 0) {
          // Try each JSON object found in the response
          for (const potentialJson of jsonMatch) {
            try {
              const parsed = JSON.parse(potentialJson);

              // Get the field value
              const fieldValue = parsed[field];

              console.log(`Successfully parsed JSON for ${field}:`, parsed);

              if (fieldValue !== undefined) {
                return {
                  success: fieldValue !== null,
                  extracted: parsed,
                  raw: output,
                };
              }
            } catch (innerError) {
              console.log(`Failed to parse potential JSON: ${potentialJson}`);
              // Continue to the next potential JSON match
            }
          }
        }

        // If we got here, no valid JSON was found containing our field
        console.error(`No valid JSON found for ${field} in LLM response`);

        // As a fallback, try to extract the information using regex patterns
        const fallbackValue = this.extractWithRegex(output, field);
        if (fallbackValue) {
          console.log(
            `Extracted ${field} using regex fallback:`,
            fallbackValue
          );
          const result = {};
          result[field] = fallbackValue;
          return {
            success: true,
            extracted: result,
            raw: output,
          };
        }
      } catch (jsonError) {
        console.error("Error parsing JSON from LLM:", jsonError);
      }

      return {
        success: false,
        extracted: null,
        raw: output,
      };
    } catch (error) {
      console.error("Error calling Ollama API:", error.message);
      return {
        success: false,
        extracted: null,
        raw: null,
        error: error.message,
      };
    }
  }

  /**
   * Check if the Ollama service is available
   * @returns {Promise<boolean>}
   */
  async isAvailable() {
    try {
      await axios.get(`${this.baseUrl}/api/version`);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * List available models in the local Ollama instance
   * @returns {Promise<Array<string>>}
   */
  async listModels() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/tags`);
      return response.data.models.map((model) => model.name);
    } catch (error) {
      console.error("Error listing Ollama models:", error.message);
      return [];
    }
  }

  /**
   * Set the model to use for extractions
   * @param {string} modelName
   */
  setModel(modelName) {
    this.model = modelName;
  }

  /**
   * Fallback method to extract information using regex patterns when JSON parsing fails
   * @param {string} text - The LLM response text
   * @param {string} field - The field to extract
   * @returns {string|null} - The extracted value or null
   */
  extractWithRegex(text, field) {
    // Remove markdown formatting that might be in the LLM response
    const cleanedText = text.replace(/```json|```/g, "").trim();

    // Field-specific patterns
    const patterns = {
      name: [
        /(?:name|名前|नाम)[:\s]+["']?([A-Za-z\s\.]+)["']?/i,
        /"name"\s*:\s*"([^"]+)"/i,
        /'name'\s*:\s*'([^']+)'/i,
      ],
      gender: [
        /(?:gender|性別|लिंग)[:\s]+["']?(Male|Female|Other|पुरुष|महिला|अन्य)["']?/i,
        /"gender"\s*:\s*"([^"]+)"/i,
        /'gender'\s*:\s*'([^']+)'/i,
      ],
      age: [
        /(?:age|年齢|उम्र)[:\s]+["']?(\d+)["']?/i,
        /"age"\s*:\s*"?(\d+)"?/i,
        /'age'\s*:\s*'?(\d+)'?/i,
      ],
      phone: [
        /(?:phone|電話|फोन)[:\s]+["']?([\d\s\+\-]+)["']?/i,
        /"phone"\s*:\s*"([^"]+)"/i,
        /'phone'\s*:\s*'([^']+)'/i,
      ],
      address: [
        /(?:address|住所|पता)[:\s]+["']?([^"'\n]+)["']?/i,
        /"address"\s*:\s*"([^"]+)"/i,
        /'address'\s*:\s*'([^']+)'/i,
      ],
      experience: [
        /(?:experience|経験|अनुभव)[:\s]+["']?(\d+)["']?/i,
        /"experience"\s*:\s*"?(\d+)"?/i,
        /'experience'\s*:\s*'?(\d+)'?/i,
      ],
      education: [
        /(?:education|教育|शिक्षा)[:\s]+["']?([^"'\n]+)["']?/i,
        /"education"\s*:\s*"([^"]+)"/i,
        /'education'\s*:\s*'([^']+)'/i,
      ],
      skills: [
        /(?:skills|スキル|कौशल)[:\s]+["']?([^"'\n]+)["']?/i,
        /"skills"\s*:\s*"([^"]+)"/i,
        /'skills'\s*:\s*'([^']+)'/i,
      ],
      availability: [
        /(?:availability|可用性|उपलब्धता)[:\s]+["']?([^"'\n]+)["']?/i,
        /"availability"\s*:\s*"([^"]+)"/i,
        /'availability'\s*:\s*'([^']+)'/i,
      ],
    };

    // If patterns exist for this field, try each pattern
    if (patterns[field]) {
      for (const pattern of patterns[field]) {
        const match = cleanedText.match(pattern);
        if (match && match[1]) {
          return match[1].trim();
        }
      }
    }

    return null;
  }
}

module.exports = OllamaService;
