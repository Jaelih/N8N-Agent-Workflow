import os
import requests
import base64
from dotenv import load_dotenv

load_dotenv()

GOOGLE_TTS_URL = "https://texttospeech.googleapis.com/v1/text:synthesize"

async def speak(text: str, output_path: str = "response.mp3") -> str:
    payload = {
        "input": {"text": text},
        "voice": {
            "languageCode": "en-US",
            "name": "en-US-Chirp3-HD-Aoede",  # best natural female voice
            "ssmlGender": "FEMALE"
        },
        "audioConfig": {
            "audioEncoding": "MP3",
            "speakingRate": 0.95,
            "pitch": 0.0
        }
    }

    response = requests.post(
        GOOGLE_TTS_URL,
        params={"key": os.getenv("GOOGLE_TTS_API_KEY")},
        json=payload
    )

    if response.status_code != 200:
        print(f"Google TTS error: {response.text}")
        raise Exception(f"Google TTS failed: {response.status_code}")

    audio_content = base64.b64decode(response.json()["audioContent"])

    with open(output_path, "wb") as f:
        f.write(audio_content)

    return output_path


def get_remaining_credits():
    return "Using Google Cloud TTS - 1M characters/month free"