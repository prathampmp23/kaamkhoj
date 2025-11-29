# KaamKhoj - Voice-Enabled Job Portal for Blue-Collar Workers

KaamKhoj is a **voice-assisted job portal** developed to address the employment challenges faced by unskilled, illiterate, and semi-literate individuals in India. Unlike traditional job platforms that primarily cater to educated users, KaamKhoj focuses on empowering daily wage earners, migrant laborers, and blue-collar workers by providing an **AI-powered, voice-driven interface** accessible in Hindi and other regional languages.

## 🎯 Problem Statement

A large segment of India’s workforce — including domestic workers, daily wage earners, and migrant laborers — struggles to access employment opportunities due to:
- **Language barriers** (most job portals are English-only)
- **Literacy limitations** (workers unable to create resumes or fill digital forms)
- **Digital illiteracy** (difficulty using complex apps/websites)
- **Lack of job visibility** for short-term, local, and daily wage work

## 💡 Solution

KaamKhoj bridges this gap with an **inclusive, voice-first platform** that enables workers to:
1. **Register with Voice**: Speak in Hindi or regional languages to create a job profile (no typing or resumes required)  
2. **AI-Powered Job Matching**: NLP-driven matching of workers to suitable jobs based on trade skills, location, and availability  
3. **Voice-Based Job Search**: Search and apply for jobs through simple voice commands  
4. **SMS Notifications**: Get job alerts via SMS for users without smartphones or constant internet access  
5. **Employer-Friendly Portal**: Employers can post jobs directly and connect with verified workers quickly  

## 🛠️ Tech Stack

### Frontend
- **React + Vite**: Fast, responsive UI  
- **React Router**: Seamless navigation  
- **TailwindCSS**: Utility-first responsive design  
- **Axios**: API communication  
- **LocalStorage**: Language & session preferences  

### Backend
- **Node.js + Express.js**: API framework  
- **MongoDB + Mongoose**: Worker & job data storage  
- **Speech Recognition & NLP**: Extract skills, experience, and location from voice input  
- **CORS**: Secure cross-origin access  

## 🌟 Key Features

### For Workers
- **Voice Registration & Profile Creation**  
- **Job Search via Voice** (Hindi + regional languages)  
- **Location & Skill-Based Matching**  
- **Simple Visual Interface with Icons**  
- **SMS Job Alerts**  

### For Employers
- **Post Jobs Easily** (no intermediaries)  
- **Search Local Talent by Skills & Location**  
- **Direct Contact with Workers**  
- **Emergency Staffing Options**  
- **Verified Worker Profiles**  

## 🔍 Use Cases

- **Daily Wage Workers**: Construction laborers, loaders, cleaners  
- **Skilled Tradespeople**: Plumbers, electricians, carpenters, painters, drivers  
- **Domestic Workers**: Maids, cooks, gardeners, security guards  
- **Small Businesses**: Restaurants, shops, workshops, service providers  
- **Contractors & Builders**: Quick staffing for projects  
- **Migrant Workers**: Easy job discovery in new cities  

## 🚀 Setup & Installation

### Prerequisites
- Node.js (v14+)  
- MongoDB (v4.4+)  
- **FFmpeg** (required for voice transcription)
- Python 3.13+ with virtual environment

### Installing FFmpeg
FFmpeg is required for the Whisper speech-to-text functionality:

**Windows:**
```bash
# Using winget (recommended)
winget install ffmpeg

# Or download from: https://ffmpeg.org/download.html
# Add to System PATH: C:\Program Files\ffmpeg\bin
```

**For Git Bash users:** After installing, add to current session:
```bash
export PATH="$PATH:/c/Program Files/ffmpeg/bin"
```

### Backend Setup
```bash
cd backend

# Install Node.js dependencies
npm install

# Python virtual environment is already set up with required packages:
# - openai-whisper (for speech-to-text)
# - gTTS (for text-to-speech)
# - pyttsx3 (offline TTS fallback)

# Start the backend server (with FFmpeg in PATH)
# On Windows CMD/PowerShell:
start-backend.bat

# On Git Bash/Linux:
bash start-backend.sh

# Or manually:
export PATH="$PATH:/c/Program Files/ffmpeg/bin"
nodemon ./app.js
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Runs at http://localhost:5173
```

### Environment Configuration
Create `.env` file in backend directory:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/kaamkhoj
```

### Testing Voice Assistant
1. Start MongoDB: `mongod`
2. Start Ollama: Ensure Ollama is running with qwen2.5:7b model
3. Start backend: `bash start-backend.sh` (includes FFmpeg in PATH)
4. Start frontend: `npm run dev`
5. Navigate to: `http://localhost:5173/assistant`

## 🔮 Future Enhancements

- Support for more **regional languages**  
- **Skill certification & verification**  
- **Video-based training modules**  
- **Aadhaar-based ID verification**  
- **Micro-payment & financial services integration**  
- **Commute & transport assistance**  

## 👥 Contributing

Contributions are welcome!  
1. Fork the repo  
2. Create a branch (`git checkout -b feature/myFeature`)  
3. Commit changes (`git commit -m "Add myFeature"`)  
4. Push & Open a PR  

## 🙏 Acknowledgements

- Inspired by the need for **inclusive digital solutions** for underserved workers  
- Thanks to contributors and testers for supporting this mission  
