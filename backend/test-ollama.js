const axios = require('axios');

/**
 * Simple test script to verify that Ollama is working correctly
 * Usage: node test-ollama.js
 */

const OLLAMA_API_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434';

async function testOllamaConnection() {
  try {
    console.log(`Testing connection to Ollama at ${OLLAMA_API_URL}...`);
    const response = await axios.get(`${OLLAMA_API_URL}/api/version`);
    console.log('✅ Ollama is available!');
    console.log(`Version: ${JSON.stringify(response.data)}`);
    return true;
  } catch (error) {
    console.error('❌ Error connecting to Ollama:', error.message);
    console.log('\nMake sure that Ollama is installed and running:');
    console.log('  1. Install from https://ollama.com/download');
    console.log('  2. Start with "ollama serve"');
    return false;
  }
}

async function listOllamaModels() {
  try {
    console.log('\nListing available models...');
    const response = await axios.get(`${OLLAMA_API_URL}/api/tags`);
    const models = response.data.models || [];
    
    if (models.length === 0) {
      console.log('No models found.');
      console.log('\nTry pulling a model:');
      console.log('  ollama pull llama3');
    } else {
      console.log('Available models:');
      models.forEach(model => {
        console.log(`  - ${model.name}`);
      });
    }
    return models;
  } catch (error) {
    console.error('Error listing models:', error.message);
    return [];
  }
}

async function testEntityExtraction() {
  const models = await listOllamaModels();
  
  if (models.length === 0) {
    return;
  }
  
  // Choose a model (prefer llama3, fallback to others)
  const preferredModels = ['llama3', 'mistral', 'llama2'];
  let modelName = null;
  
  for (const preferred of preferredModels) {
    const found = models.find(m => m.name === preferred || m.name.startsWith(`${preferred}:`));
    if (found) {
      modelName = found.name;
      break;
    }
  }
  
  if (!modelName) {
    modelName = models[0].name;
  }
  
  console.log(`\nTesting entity extraction with model: ${modelName}`);
  
  try {
    // Sample prompt for name extraction
    const prompt = `Extract the person's name from the following sentence and return only in JSON format {"name":"<the name>"}.
If no name is found, return {"name":null}.
Input: "My name is John Smith and I'm looking for a job"`;

    console.log('Sending test prompt to Ollama...');
    
    const response = await axios.post(`${OLLAMA_API_URL}/api/generate`, {
      model: modelName,
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.1
      }
    });
    
    console.log('\n✅ Successfully called Ollama API!');
    console.log('Response:', response.data.response);
    
    // Try to parse JSON from the response
    try {
      // Extract JSON from the response
      const jsonMatch = response.data.response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        const parsed = JSON.parse(jsonStr);
        console.log('\nParsed result:', parsed);
      }
    } catch (jsonError) {
      console.error('Error parsing JSON from response:', jsonError.message);
    }
    
  } catch (error) {
    console.error('❌ Error testing extraction:', error.message);
  }
}

async function main() {
  const isConnected = await testOllamaConnection();
  
  if (isConnected) {
    await testEntityExtraction();
  }
  
  console.log('\nTest completed.');
}

main();