# Installing FFmpeg for Whisper

FFmpeg is required for Whisper to process audio files.

## Option 1: Using winget (Recommended - Windows 10/11)

Open PowerShell or Command Prompt and run:

```bash
winget install ffmpeg
```

## Option 2: Using Chocolatey

If you have Chocolatey installed:

```bash
choco install ffmpeg
```

## Option 3: Manual Installation

1. Download FFmpeg from: https://www.gyan.dev/ffmpeg/builds/
2. Download the "ffmpeg-release-essentials.zip" file
3. Extract it to `C:\ffmpeg`
4. Add `C:\ffmpeg\bin` to your system PATH:
   - Press `Win + X`, select "System"
   - Click "Advanced system settings"
   - Click "Environment Variables"
   - Under "System variables", find "Path" and click "Edit"
   - Click "New" and add `C:\ffmpeg\bin`
   - Click OK on all dialogs
5. **Restart your terminal** for changes to take effect

## Option 4: Quick Download (Easiest)

Run this in PowerShell as Administrator:

```powershell
# Create directory
New-Item -ItemType Directory -Force -Path C:\ffmpeg

# Download ffmpeg
Invoke-WebRequest -Uri "https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip" -OutFile "C:\ffmpeg\ffmpeg.zip"

# Extract (requires PowerShell 5.0+)
Expand-Archive -Path C:\ffmpeg\ffmpeg.zip -DestinationPath C:\ffmpeg -Force

# Add to PATH (current session only)
$env:Path += ";C:\ffmpeg\ffmpeg-7.1-essentials_build\bin"

# To make permanent, run:
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\ffmpeg\ffmpeg-7.1-essentials_build\bin", [EnvironmentVariableTarget]::Machine)
```

## Verify Installation

After installation, **restart your terminal** and run:

```bash
ffmpeg -version
```

You should see ffmpeg version information.

## Then Restart Backend

After installing ffmpeg:

1. Close and reopen your terminal
2. Restart the backend server: `node app.js`
3. Test the voice assistant again
