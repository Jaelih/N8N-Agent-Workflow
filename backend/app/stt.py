import whisper

# Lazy-loaded — only downloaded/loaded on first transcription request
_model = None

def _get_model():
    global _model
    if _model is None:
        _model = whisper.load_model("base")
    return _model

def transcribe_audio(audio_file_path: str) -> str:
    """
    Transcribes audio file to text using Whisper.
    Supports Tagalog and Taglish.
    """
    result = _get_model().transcribe(
        audio_file_path,
        language="tl",
        task="transcribe",
        prompt="PLDT customer service, billing, outage, internet, Taglish"
    )
    return result["text"].strip()