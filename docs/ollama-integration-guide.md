# Ollama Integration Guide for Kaamkhoj

This guide explains how to set up and integrate Ollama with the Kaamkhoj application for local LLM-powered entity extraction.

## What is Ollama?

Ollama is an open-source project that allows you to run large language models (LLMs) locally on your own hardware. It provides a simple API for interacting with these models, making it easy to integrate them into your applications.

## Why Use Local LLMs?

1. **Privacy**: All data processing happens locally, without sending sensitive user information to third-party services.
2. **Cost-effective**: No API usage fees or rate limits.
3. **Offline capability**: Works without an internet connection.
4. **Customization**: Ability to fine-tune models for your specific use case.

## Installation Steps

### 1. Install Ollama

Visit [ollama.com/download](https://ollama.com/download) and follow the instructions for your operating system:

**Windows**:
- Download and run the installer
- Follow the on-screen instructions

**macOS**:
- Download and install the macOS application
- Move to Applications folder when prompted

**Linux**:
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### 2. Pull a Model

After installing Ollama, pull a model that works well with instruction-following and structured outputs:

```bash
# Pull llama3 (recommended for general-purpose tasks)
ollama pull llama3

# For smaller/faster models:
ollama pull mistral
ollama pull llama2

# For more powerful models (requires more RAM/GPU):
ollama pull llama3:70b
```

### 3. Start the Ollama Service

Make sure the Ollama service is running:

```bash
ollama serve
```

By default, this will start the Ollama API server at `http://localhost:11434`.

## Integration with Kaamkhoj

The Kaamkhoj application is already configured to integrate with Ollama. The backend will:

1. Check if Ollama is available at startup
2. List available models and select an appropriate one
3. Use Ollama for entity extraction when processing user input
4. Fall back to rule-based methods if Ollama is not available

### Configuration

You can modify the Ollama service configuration in `backend/services/OllamaService.js`:

```javascript
// Change the base URL if your Ollama server runs on a different address
const ollamaService = new OllamaService('http://localhost:11434');

// Change the default model
ollamaService.setModel('llama3');
```

## Troubleshooting

### Ollama Service Not Available

If the backend reports that the Ollama service is not available:

1. Check if the Ollama service is running with `ollama serve`
2. Verify the URL in the OllamaService configuration
3. Check if there are any firewall issues blocking the connection

### Models Not Loading

If you see errors related to model loading:

1. Check available models with `ollama list`
2. Pull the required model with `ollama pull <model-name>`

### High Latency

If the entity extraction is slow:

1. Consider using a smaller model (e.g., `mistral` instead of `llama3`)
2. Increase system resources (RAM, GPU)
3. Optimize the prompts in the OllamaService

## Performance Considerations

- Models like llama3 and mistral can run on most modern computers, but larger models (70B parameters) require significant resources
- For production use, consider a computer with at least 16GB RAM and a dedicated GPU

## Advanced Usage

### Customizing Prompts

You can modify the prompts used for entity extraction in the `OllamaService.js` file. Better prompts can improve extraction accuracy.

### Model Fine-tuning

For advanced users, Ollama supports creating custom models with specific instructions:

```bash
# Create a custom model from a Modelfile
ollama create custom-extractor -f ./Modelfile
```

Example Modelfile:
```
FROM llama3
SYSTEM You are an expert entity extraction assistant. Your job is to extract structured information from text.
```

## Additional Resources

- [Ollama GitHub Repository](https://github.com/ollama/ollama)
- [Ollama Documentation](https://ollama.com/docs)
- [Model Library](https://ollama.com/library)