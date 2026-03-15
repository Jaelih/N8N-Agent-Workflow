import subprocess
import os
import torch
import whisper

# Lazy-loaded — only downloaded/loaded on first transcription request
_model = None

def _get_model():
    global _model
    if _model is None:
        device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"Loading Whisper on: {device}")
        _model = whisper.load_model("base", device=device)
    return _model

def preprocess_audio(input_path: str) -> str:
    """Convert audio to 16kHz mono WAV — optimal format for Whisper"""
    base = os.path.splitext(input_path)[0]   # strip any extension
    output_path = f"{base}_processed.wav"    # always a different filename

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
    """
    Transcribes audio file to text using Whisper.
    Supports Tagalog and Taglish.
    """
    processed_path = preprocess_audio(audio_file_path)
    try:
        result = _get_model().transcribe(
            processed_path,
            language="tl",
            task="transcribe",
            prompt=(
                "PLDT customer service call. Taglish conversation. "
                "Keywords: internet, billing, outage, broadband, DSL, Fibr, WiFi, "
                "load, bill, bayad, account, signal, connection, router, modem, "
                "Meralco, Globe, Smart, prepaid, postpaid, plan, upgrade, dito, "
                "saan, kailan, magkano, hindi, wala, gusto, kailangan, tulong, "
                "network, load, account, signal, connection, router, modem, outage"
                "Manila, Cebu, Davao, Quezon City, Makati, Pasig, Taguig, Caloocan, Las Piñas, Zambales, Batangas, Laguna, Cavite, Rizal, Pampanga, Bulacan, Bataan, Tarlac, Nueva Ecija, Pangasinan, Ilocos, Visayas, Mindanao, Luzon, Boracay, Palawan, Bohol, Siargao, Camiguin, Marinduque, Romblon, Catanduanes, Masbate, Sorsogon, Albay, Samar, Leyte, Biliran, Dinagat Islands, Siquijor, Guimaras, Marawi, Cotabato, General Santos, Zamboanga, Iligan, Cagayan de Oro, Tagum, Butuan, Koronadal"
            )
        )
        return result["text"].strip()
    finally:
        # always clean up the processed file
        if os.path.exists(processed_path):
            os.remove(processed_path)