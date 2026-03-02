import sounddevice as sd
import soundfile as sf
import numpy as np

DURATION = 5        # seconds
SAMPLE_RATE = 16000 # required by Whisper

print("Recording in 3...")
import time
time.sleep(1)
print("Recording in 2...")
time.sleep(1)
print("Recording in 1...")
time.sleep(1)
print("🎙️ Speak now!")

audio = sd.rec(
    int(DURATION * SAMPLE_RATE),
    samplerate=SAMPLE_RATE,
    channels=1,
    dtype="float32"
)
sd.wait()
print("✅ Done recording!")

sf.write("test_audio.wav", audio, SAMPLE_RATE)
print("Saved as test_audio.wav")