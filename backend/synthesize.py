#!/usr/bin/env python3
import sys
import argparse
import os

def synthesize_speech(text, output_file, language='en'):
    """
    Synthesizes speech from text using gTTS (Google Text-to-Speech).
    
    Args:
        text: Text to convert to speech
        output_file: Path to save the output WAV file
        language: Language code (en, hi, etc.)
    
    Returns:
        True if successful, False otherwise
    """
    try:
        # Try using gTTS first (requires internet)
        try:
            from gtts import gTTS
            
            # Map language codes
            lang_map = {
                'en': 'en',
                'hi': 'hi',
                'hindi': 'hi',
                'english': 'en'
            }
            
            tts_lang = lang_map.get(language.lower(), 'en')
            
            # Generate speech
            tts = gTTS(text=text, lang=tts_lang, slow=False)
            
            # gTTS outputs MP3, but we'll save as mp3 and convert or just rename
            # For now, save as the requested format
            temp_file = output_file.replace('.wav', '.mp3')
            tts.save(temp_file)
            
            # If WAV is required, rename for now (browser can play MP3)
            # In production, use pydub to convert: AudioSegment.from_mp3(temp).export(output_file, format="wav")
            if temp_file != output_file and output_file.endswith('.wav'):
                # Try to convert with pydub if available
                try:
                    from pydub import AudioSegment
                    audio = AudioSegment.from_mp3(temp_file)
                    audio.export(output_file, format="wav")
                    os.remove(temp_file)
                except ImportError:
                    # If pydub not available, just rename (most browsers support mp3)
                    import shutil
                    shutil.move(temp_file, output_file)
            
            return True
            
        except ImportError:
            # Fallback to pyttsx3 (offline, but lower quality)
            import pyttsx3
            
            engine = pyttsx3.init()
            
            # Set properties
            rate = engine.getProperty('rate')
            engine.setProperty('rate', rate - 20)  # Slightly slower
            
            # Map language codes (pyttsx3 uses voice names, not language codes)
            # This is basic - may need adjustment based on available voices
            voices = engine.getProperty('voices')
            
            if language.lower() in ['hi', 'hindi']:
                # Try to find Hindi voice
                for voice in voices:
                    if 'hindi' in voice.name.lower() or 'hi' in voice.languages:
                        engine.setProperty('voice', voice.id)
                        break
            
            # Save to file
            engine.save_to_file(text, output_file)
            engine.runAndWait()
            
            return True
        
    except Exception as e:
        print(f"Error during speech synthesis: {str(e)}", file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)
        return False

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Synthesize speech from text")
    parser.add_argument("--text", type=str, required=True, help="Text to synthesize")
    parser.add_argument("--out", type=str, required=True, help="Output WAV file path")
    parser.add_argument("--lang", type=str, default="en", help="Language code (en, hi)")
    
    args = parser.parse_args()
    
    success = synthesize_speech(args.text, args.out, args.lang)
    sys.exit(0 if success else 1)
