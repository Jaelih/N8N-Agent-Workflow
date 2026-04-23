import subprocess
import os
import torch
import whisper

_model = None

def _get_model():
    global _model
    if _model is None:
        device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"Loading Whisper on: {device}")
        _model = whisper.load_model("base", device=device)
    return _model

def preprocess_audio(input_path: str) -> str:
    base = os.path.splitext(input_path)[0]
    output_path = f"{base}_processed.wav"
    subprocess.run([
        "ffmpeg", "-y",
        "-i", input_path,
        "-ar", "16000",
        "-ac", "1",
        "-c:a", "pcm_s16le",
        output_path
    ], check=True, capture_output=True)
    return output_path

def transcribe_audio(audio_file_path: str) -> str:
    processed_path = preprocess_audio(audio_file_path)
    try:
        result = _get_model().transcribe(
            processed_path,
            language="tl",
            task="transcribe",
            prompt=(
                "PLDT customer service call. Taglish conversation. "
                "Keywords: internet, billing, outage, broadband, WiFi, "
                "load, bill, bayad, account, signal, connection, router, modem"
            )
        )
        return result["text"].strip()
    finally:
        if os.path.exists(processed_path):
            os.remove(processed_path)