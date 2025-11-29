# Offline STT Setup - Complete Guide

## ✅ What You Have Installed

1. **Python Whisper** - `openai-whisper` package (installed)
2. **Coqui TTS** - Text-to-speech library (installed)
3. **PyTorch** - Required for both Whisper and TTS (installed)
4. **Ollama** - Running with Qwen2.5:7b model
5. **Backend Scripts** - `transcribe.py` and `synthesize.py`

---

## 📁 Files Created

### Backend Files:
- `backend/transcribe.py` - Whisper STT script
- `backend/synthesize.py` - Coqui TTS script
- `backend/app.js` - Updated with Python-based STT/TTS endpoints

---

## 🚀 How to Run

### Step 1: Start Backend Server

Open terminal in `backend` folder:

```bash
cd C:\Users\Prath\Dev\KaamkhojCopy\backend
node app.js
```

You should see:
```
Connected to MongoDB
Ollama service is available. Available models: [ 'qwen2.5:7b', ... ]
Server is running on port 5000
```

### Step 2: Start Frontend

Open another terminal in `frontend` folder:

```bash
cd C:\Users\Prath\Dev\KaamkhojCopy\frontend
npm run dev
```

You should see:
```
VITE v... ready in ... ms
➜  Local:   http://localhost:5173/
```

### Step 3: Test the Application

1. Open browser: `http://localhost:5173`
2. Navigate to AI Assistant page
3. Click the large **"Tap to Speak"** button 🎤
4. Speak for 5 seconds
5. System will transcribe and respond

---

## 🔧 How It Works

### Speech-to-Text (STT) Flow:

```
User speaks → Frontend records 5 seconds
     ↓
Audio uploaded to /stt endpoint
     ↓
Backend saves WebM file to uploads/
     ↓
Runs: python transcribe.py --file audio.webm --model base
     ↓
Whisper transcribes and detects language
     ↓
Returns: { text: "...", lang: "en" }
     ↓
Frontend displays and sends to /process
```

### Text-to-Speech (TTS) Flow:

```
Backend needs to speak text
     ↓
Frontend calls: POST /tts { text: "Hello", lang: "en" }
     ↓
Runs: python synthesize.py --text "Hello" --out output.wav --lang en
     ↓
Coqui TTS generates WAV file
     ↓
Streams WAV back to frontend
     ↓
Browser plays audio
```

---

## 🎯 First-Time Model Downloads

### Whisper Models (Automatic Download)

When you first use STT, Whisper will download the model:

- **tiny** - 39 MB (fastest, least accurate)
- **base** - 74 MB (good balance) ← **YOU'RE USING THIS**
- **small** - 244 MB (better accuracy)
- **medium** - 769 MB (very good)
- **large** - 1550 MB (best accuracy)

Models are cached in: `C:\Users\Prath\.cache\whisper\`

### TTS Model (Automatic Download)

When you first use TTS, Coqui will download:

- **XTTS v2** - ~2 GB (multilingual, high quality)

Cached in: `C:\Users\Prath\.local\share\tts\`

**Note:** First STT/TTS request will take 1-2 minutes for download. Subsequent requests will be fast.

---

## 🧪 Testing Individual Components

### Test STT Only:

```bash
cd backend

# Activate virtual environment
source .venv/Scripts/activate  # Git Bash
# OR
.venv\Scripts\activate  # CMD

# Record a test audio or use any audio file
python transcribe.py --file test.wav --model base
```

Expected output:
```json
{"text": "hello this is a test", "language": "en", "success": true}
```

### Test TTS Only:

```bash
python synthesize.py --text "Hello, this is a test" --out test_output.wav --lang en
```

Expected: Creates `test_output.wav` file. Play it to verify.

---

## 📊 Performance Expectations

### STT (Whisper Base Model):
- **5 seconds audio** → 3-5 seconds processing
- **10 seconds audio** → 5-8 seconds processing
- Uses CPU by default (GPU faster if available)

### TTS (Coqui XTTS):
- **Short sentence** (10 words) → 1-2 seconds
- **Long sentence** (30 words) → 3-5 seconds
- First request slower (model loading)

### Ollama (Qwen2.5:7b):
- **Entity extraction** → 1-3 seconds
- Keeps model in memory after first use

---

## 🐛 Troubleshooting

### Problem: "Transcribe script not found"

**Solution:**
```bash
cd backend
ls transcribe.py  # Should exist
```

If missing, create it again or check file path.

### Problem: "Python not found" or "Module not found"

**Solution:**
```bash
# Verify virtual environment
cd backend
source .venv/Scripts/activate

# Check installations
pip list | grep whisper
pip list | grep TTS
pip list | grep torch
```

Should show:
- `openai-whisper`
- `TTS`
- `torch`, `torchvision`, `torchaudio`

### Problem: STT takes too long

**Solution:** Use smaller model:

In `backend/app.js`, change:
```javascript
const args = [transcribeScript, '--file', inputPath, '--model', 'tiny'];
```

Or in `transcribe.py`, change default:
```python
parser.add_argument("--model", type=str, default="tiny", ...)
```

### Problem: TTS sounds robotic

**Solution:** XTTS v2 is high quality. If it sounds bad:
1. Check language code is correct ('en' or 'hi')
2. Ensure text is clean (no special characters)
3. Try shorter sentences

### Problem: "Ollama not available"

**Check:**
```bash
curl http://localhost:11434/api/tags
```

Should return list of models including `qwen2.5:7b`.

If not running:
```bash
ollama serve
```

---

## ⚙️ Configuration Options

### Change Whisper Model Size

Edit `backend/app.js` line ~817:
```javascript
const args = [transcribeScript, '--file', inputPath, '--model', 'small'];
```

Options: `tiny`, `base`, `small`, `medium`, `large`

### Change Audio Recording Duration

Edit `frontend/src/pages/AiAssistantPage.jsx` line ~785:
```javascript
setTimeout(() => {
  if (mr.state === "recording") {
    mr.stop();
    stream.getTracks().forEach((t) => t.stop());
  }
}, 8000); // Change from 5000 to 8000 for 8 seconds
```

### Enable GPU Acceleration (if you have NVIDIA GPU)

1. Install CUDA-enabled PyTorch:
```bash
pip uninstall torch torchvision torchaudio
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

2. Edit `transcribe.py`:
```python
result = model.transcribe(audio_file, fp16=True)  # Enable GPU
```

3. Edit `synthesize.py`:
```python
tts = TTS(MODEL_NAME, gpu=True)  # Enable GPU
```

---

## 📝 Quick Reference

### Backend Endpoints:

| Endpoint | Method | Input | Output |
|----------|--------|-------|--------|
| `/stt` | POST | Audio file (multipart) | `{ text, lang }` |
| `/process` | POST | `{ text, lang, currentField }` | `{ reply, extractedValue, success }` |
| `/tts` | POST | `{ text, lang }` | Audio WAV stream |
| `/saveProfile` | POST | User profile data | Saved user object |

### File Locations:

| File | Purpose |
|------|---------|
| `backend/transcribe.py` | Whisper STT script |
| `backend/synthesize.py` | Coqui TTS script |
| `backend/app.js` | Main server with endpoints |
| `backend/uploads/` | Temporary audio files |
| `frontend/src/pages/AiAssistantPage.jsx` | Voice UI |

---

## ✅ Final Checklist

Before testing, ensure:

- [ ] MongoDB is running
- [ ] Ollama is running (`ollama serve` or already running)
- [ ] Backend started (`node app.js`)
- [ ] Frontend started (`npm run dev`)
- [ ] Virtual environment has all packages
- [ ] `uploads/` folder exists in backend
- [ ] You're in a quiet environment for voice testing

---

## 🎉 Success Indicators

When everything works:

1. Backend console shows:
   ```
   Server is running on port 5000
   Ollama service is available
   ```

2. First STT request shows:
   ```
   Loading Whisper model: base...
   Transcribing audio file...
   Transcription successful: [your text]
   ```

3. First TTS request shows:
   ```
   Generating TTS for: Hello...
   TTS stdout: Successfully saved audio...
   ```

4. Frontend shows:
   - Pulsing red button when recording
   - Your spoken text appears in chat
   - Assistant response appears
   - Audio plays automatically

---

**Your offline voice assistant is now ready! 🚀**

All processing happens locally:
- ✅ No internet required
- ✅ No API keys needed
- ✅ Complete privacy
- ✅ Works in Hindi & English
