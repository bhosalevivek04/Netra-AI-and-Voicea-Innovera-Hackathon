import os
import sys
import wave
import pyaudio
import json
from vosk import Model, KaldiRecognizer

MODEL_PATH = "vosk-model-small-en-us-0.15"

def record_and_recognize():
    # 1) Load model
    if not os.path.exists(MODEL_PATH):
        print("Vosk model not found!")
        sys.exit(1)
    model = Model(MODEL_PATH)

    # 2) Start PyAudio
    pa = pyaudio.PyAudio()
    stream = pa.open(format=pyaudio.paInt16,
                     channels=1,
                     rate=16000,
                     input=True,
                     frames_per_buffer=8192)
    stream.start_stream()

    # 3) Create recognizer
    rec = KaldiRecognizer(model, 16000)
    print("Speak now... (CTRL+C to stop)")

    while True:
        data = stream.read(4096, exception_on_overflow=False)
        if len(data) == 0:
            break
        if rec.AcceptWaveform(data):
            result_json = rec.Result()
            result_dict = json.loads(result_json)
            text = result_dict.get("text", "")
            if text:
                print(f"Recognized: {text}")
                break

    stream.stop_stream()
    stream.close()
    pa.terminate()
    return text

if __name__ == "__main__":
    recognized_text = record_and_recognize()
    print("Final recognized text:", recognized_text)
