# Kaamkhoj AI Voice Assistant Implementation Guide

## Overview

This document provides a detailed explanation of the AI voice assistant implementation for Kaamkhoj, which uses a combination of Web Speech API and local LLMs (via Ollama) to create a multilingual voice interface for form completion.

## Technical Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Browser   │     │    Express   │     │    Ollama    │     │   MongoDB    │
│  Frontend   │◄───►│    Backend   │◄───►│  Local LLM   │     │  Database    │
└─────────────┘     └──────┬───────┘     └──────────────┘     └──────────────┘
                           │                                         ▲
                           └─────────────────────────────────────────┘
```

### Key Components:

1. **Frontend (React)**
   - VoiceAssistant component that handles voice capture and UI
   - Web Speech API for speech recognition
   - Language toggle for multilingual support

2. **Backend (Express)**
   - Process endpoint for text extraction
   - OllamaService for LLM-based extraction
   - LanguageDetectionService for automatic language detection
   - Fallback rule-based extraction methods

3. **Ollama**
   - Local LLM server (no data leaves the user's machine)
   - Supports structured JSON outputs
   - Handles multilingual inputs

4. **Database (MongoDB)**
   - Stores user profiles
   - Stores job listings for matching

## Implementation Details

### 1. Voice Capture Flow

```
User speaks → Web Speech API → Text → Backend → Entity Extraction → MongoDB
```

The process works as follows:
1. User clicks the microphone button
2. Browser captures audio and converts to text using Web Speech API
3. Text is sent to backend along with metadata (language, current field)
4. Backend processes text using Ollama and/or rule-based methods
5. Extracted information is returned and stored in the form

### 2. Entity Extraction Methods

We've implemented a hybrid approach:

**LLM-based Extraction (Primary)**
- Uses Ollama to run local LLMs
- Provides structured JSON outputs
- Works across multiple languages
- More flexible with different phrasings

**Rule-based Extraction (Fallback)**
- Uses regex patterns for common phrasings
- Language-specific patterns for Hindi and English
- Falls back to direct text matching for simple inputs
- Used when Ollama is unavailable or fails

### 3. Language Support

The system supports both English and Hindi:
- Language detection based on text content
- Language-specific prompts for LLM
- Language-specific regex patterns for fallback
- UI language switching

### 4. Privacy Considerations

This implementation prioritizes privacy:
- Speech recognition happens in the browser
- LLM processing happens locally via Ollama
- No data is sent to external API services
- All user data is stored in your own MongoDB instance

## Performance Optimization

To ensure responsive performance:

1. **LLM Settings**
   - Using smaller/efficient models (llama3, mistral)
   - Low temperature (0.1) for deterministic outputs
   - Limited max tokens for faster responses

2. **Hybrid Approach**
   - Simple patterns use regex (faster)
   - Complex inputs use LLM (more accurate)
   - Automatic fallback if LLM is unavailable

3. **Browser Optimizations**
   - Speech recognition with appropriate settings
   - UI feedback during processing states

## Testing and Validation

To test the implementation:

1. Run the test script: `node test-ollama.js`
2. Check Ollama connection and model availability
3. Verify entity extraction works correctly

## Future Enhancements

1. **Client-side ASR Fallback**
   - Add option to process audio files directly
   - Use Whisper.cpp/Vosk for offline ASR

2. **Enhanced Entity Extraction**
   - Fine-tune models specifically for entity extraction
   - Add more field types (education, certifications, etc.)

3. **Performance Improvements**
   - Implement caching for common queries
   - Add batch processing capabilities

## Conclusion

This implementation provides a privacy-focused, multilingual voice interface for Kaamkhoj, leveraging local LLMs via Ollama for accurate entity extraction without sending sensitive data to external services.