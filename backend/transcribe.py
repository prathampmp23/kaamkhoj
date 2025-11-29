import whisper
import sys
import argparse
import json
import warnings
import os

# Suppress all warnings and progress bars
warnings.filterwarnings("ignore")
os.environ['TQDM_DISABLE'] = '1'

# Redirect stderr to devnull to suppress all progress output
import io
sys.stderr = open(os.devnull, 'w')

def transcribe_audio(audio_file, model_size="small"):
    """
    Transcribes audio file using OpenAI Whisper with improved multilingual support.
    
    Args:
        audio_file: Path to audio file
        model_size: Whisper model size (tiny, base, small, medium, large)
                   Using 'small' for better Hindi/English recognition
    
    Returns:
        JSON with transcribed text and detected language
    """
    try:
        # Check if file exists
        if not os.path.exists(audio_file):
            raise FileNotFoundError(f"Audio file not found: {audio_file}")
        
        # Load the Whisper model
        # Using 'small' model (~460MB) for significantly better multilingual performance
        # Models are cached in ~/.cache/whisper/
        model = whisper.load_model(model_size)
        
        # Transcribe the audio with improved settings
        # Note: Whisper requires ffmpeg to be installed and in PATH
        result = model.transcribe(
            audio_file, 
            fp16=False, 
            verbose=False,
            language=None,  # Auto-detect language for better accuracy
            task='transcribe',  # Ensure we're transcribing, not translating
            best_of=5,  # Use best of 5 attempts for better accuracy
            beam_size=5,  # Use beam search for better results
            patience=1.0,  # Patience for beam search
            temperature=0.0,  # Deterministic output
            compression_ratio_threshold=2.4,
            logprob_threshold=-1.0,
            no_speech_threshold=0.6,
            condition_on_previous_text=True  # Use context for better accuracy
        )
        
        # Extract text and language
        text = result["text"].strip()
        language = result["language"]
        
        # Return JSON output
        output = {
            "text": text,
            "language": language,
            "success": True
        }
        
        print(json.dumps(output))
        
    except Exception as e:
        error_output = {
            "text": "",
            "language": "unknown",
            "success": False,
            "error": str(e)
        }
        print(json.dumps(error_output))
        sys.exit(1)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Transcribe audio using Whisper")
    parser.add_argument("--file", type=str, required=True, help="Path to audio file")
    parser.add_argument("--model", type=str, default="small", 
    choices=["tiny", "base", "small", "medium", "large"],
    help="Whisper model size (default: small for better multilingual support)")
    
    args = parser.parse_args()
    transcribe_audio(args.file, args.model)
