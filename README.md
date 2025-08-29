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

### Backend
```bash
cd backend
npm install
# Add .env file:
PORT=3000
MONGODB_URI=mongodb://localhost:27017/kaamkhoj
node app.js
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Runs at http://localhost:5173
```

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
