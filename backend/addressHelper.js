// Helper functions for address extraction

// Extract house number and street
function extractHouseAndStreet(text) {
  const patterns = [
    /(?:house|flat|apartment|apt)(?:\s+number|\s+no\.?|\s+#)?\s+(.+?)(?:,|\.|$)/i,
    /(?:street|road|avenue|lane|boulevard|drive|court|place)\s+(.+?)(?:,|\.|$)/i,
    /(\d+)\s+([A-Za-z\s]+(?:street|road|avenue|lane|boulevard|drive|court|place))(?:,|\.|$)/i,
    /([A-Za-z0-9\s-]+)(?:,|\s+)(?:street|road|avenue|lane|boulevard|drive)(?:,|\.|$)/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }

  // Look for numbers followed by text that could be a street
  const numberStreetPattern = /(\d+[\s-]*[A-Za-z\s]+)(?:,|\.|$)/i;
  const numberStreetMatch = text.match(numberStreetPattern);
  if (numberStreetMatch) {
    return numberStreetMatch[1].trim();
  }

  return null;
}

// Extract city
function extractCity(text) {
  // Common cities in India (this is a very small subset, would need to be expanded)
  const commonCities = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 
    'Ahmedabad', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal',
    'Visakhapatnam', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik',
    'Faridabad', 'Meerut', 'Rajkot', 'Varanasi', 'Srinagar', 'Aurangabad', 'Dhanbad',
    'Amritsar', 'Allahabad', 'Ranchi', 'Coimbatore', 'Jabalpur', 'Gwalior', 'Vijayawada',
    'Jodhpur', 'Madurai', 'Raipur', 'Kota', 'Chandigarh', 'Guwahati', 'Solapur', 'Hubli',
    'Mysore', 'Tiruchirappalli', 'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix',
    'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville',
    'San Francisco', 'Columbus', 'Fort Worth', 'Indianapolis', 'Charlotte', 'Seattle', 'Denver',
    'Washington', 'Boston', 'El Paso', 'Nashville', 'Detroit', 'Portland', 'Las Vegas'
  ];
  
  // Try to match common cities
  for (const city of commonCities) {
    const cityRegex = new RegExp(`\\b${city}\\b`, 'i');
    if (cityRegex.test(text)) {
      return city;
    }
  }
  
  // Try to extract city using patterns
  const patterns = [
    /(?:city|town|village)\s+(?:of\s+)?(.+?)(?:,|\.|$)/i,
    /(?:in|from)\s+(.+?)(?:,|\.|$)/i,
    /(.+?)\s+(?:city|town|village)(?:,|\.|$)/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const potentialCity = match[1].trim();
      
      // Basic validation - cities should be reasonably named
      if (potentialCity.length > 2 && potentialCity.length < 30 && /^[A-Za-z\s]+$/.test(potentialCity)) {
        return potentialCity;
      }
    }
  }

  return null;
}

// Extract state
function extractState(text) {
  // Common states in India and US (this is a subset, would need to be expanded)
  const commonStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 
    'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 
    'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 
    'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Alabama', 'Alaska', 'Arizona', 
    'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 
    'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 
    'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 
    'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 
    'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 
    'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 
    'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 
    'West Virginia', 'Wisconsin', 'Wyoming'
  ];
  
  // Common state abbreviations (US)
  const stateAbbreviations = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 
    'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 
    'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 
    'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];
  
  // Try to match common states
  for (const state of commonStates) {
    const stateRegex = new RegExp(`\\b${state}\\b`, 'i');
    if (stateRegex.test(text)) {
      return state;
    }
  }
  
  // Try to match state abbreviations (with word boundaries to avoid false matches)
  for (const abbr of stateAbbreviations) {
    const abbrRegex = new RegExp(`\\b${abbr}\\b`, 'i');
    if (abbrRegex.test(text)) {
      return abbr.toUpperCase();
    }
  }
  
  // Try to extract state using patterns
  const patterns = [
    /(?:state|province)\s+(?:of\s+)?(.+?)(?:,|\.|$)/i,
    /(.+?)\s+(?:state|province)(?:,|\.|$)/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const potentialState = match[1].trim();
      
      // Basic validation - states should be reasonably named
      if (potentialState.length > 2 && potentialState.length < 30 && /^[A-Za-z\s]+$/.test(potentialState)) {
        return potentialState;
      }
    }
  }

  return null;
}

// Global variable to store partial address information across requests
// In a production environment, this would be stored in a session or database
const partialAddresses = {};

module.exports = {
  extractHouseAndStreet,
  extractCity,
  extractState,
  partialAddresses
};
