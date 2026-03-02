import whisper

# Load once when server starts — avoids reloading on every request
model = whisper.load_model("turbo")

def transcribe_audio(audio_file_path: str) -> str:
    """
    Transcribes audio file to text using Whisper.
    Supports Tagalog and Taglish.
    """
    result = model.transcribe(
        audio_file_path,
        language="tl",
        task="transcribe",
        prompt="PLDT customer service, billing, outage, internet, Taglish"
    )
    return result["text"].strip()