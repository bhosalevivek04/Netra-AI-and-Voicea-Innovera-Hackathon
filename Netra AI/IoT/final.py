#!/usr/bin/env python3

import RPi.GPIO as GPIO
import time
import subprocess
import requests
import os
from gtts import gTTS

# BCM pin numbers for buttons
CAPTURE_BUTTON_PIN = 17   # Button A: capture + train
RECOGNIZE_BUTTON_PIN = 18 # Button B: toggle recognize
GEMINI_IMAGE_PIN = 22     # Button C: image describe
GEMINI_VIDEO_PIN = 23     # Button D: video describe (long press emergency)

# Configuration
EMERGENCY_ENDPOINT = "https://emergency-alert-system.onrender.com/data"
DEBOUNCE_TIME = 1
recognize_process = None
button_d_pressed = False
button_d_start_time = 0

def speak_google(text):
    """Text-to-speech using gTTS with Bluetooth output"""
    if not text:
        return
    tts = gTTS(text, lang='en')
    filename = "temp_tts.mp3"
    tts.save(filename)
    os.system(f"mpg123 -q {filename}")  # Uses default audio device
    os.remove(filename)

def capture_and_train():
    """Handle Button A: Capture and train faces"""
    speak_google("Starting face capture and training")
    print("Button A: Capturing...")
    subprocess.run(["python", "face_rec.py", "capture"])
    speak_google("Capture complete. Starting training.")
    subprocess.run(["python", "face_rec.py", "train"])
    speak_google("Training completed successfully")
    time.sleep(DEBOUNCE_TIME)

def toggle_recognize():
    """Handle Button B: Toggle recognition"""
    global recognize_process
    if recognize_process is None:
        speak_google("Starting real time recognition")
        recognize_process = subprocess.Popen(["python", "face_rec.py", "recognize"])
    else:
        speak_google("Recognition ended")
        recognize_process.terminate()
        recognize_process = None
        time.sleep(0.5)  # Cleanup delay
    time.sleep(DEBOUNCE_TIME)

def gemini_describe_image():
    """Handle Button C: Image analysis"""
    speak_google("Capturing image for analysis")
    subprocess.run(["python", "gemini_image_describer.py"])
    speak_google("Image analysis complete")
    time.sleep(DEBOUNCE_TIME)

def gemini_describe_video():
    """Handle Button D short press: Video analysis"""
    speak_google("Recording video for analysis")
    subprocess.run(["python", "gemini_video_describer.py"])
    speak_google("Video analysis finished")
    time.sleep(DEBOUNCE_TIME)

def send_emergency_sms():
    """Handle Button D long press: Emergency SMS"""
    speak_google("Emergency alert triggered")
    try:
        response = requests.post(EMERGENCY_ENDPOINT, timeout=5)
        if response.status_code == 200:
            speak_google("Emergency message sent successfully")
        else:
            speak_google("Failed to send emergency message")
    except Exception as e:
        speak_google("Emergency service unavailable")
        print(f"Error: {str(e)}")

def handle_button_d():
    """Handle Button D press duration"""
    global button_d_pressed, button_d_start_time
    current_state = GPIO.input(GEMINI_VIDEO_PIN)
    
    if current_state == GPIO.LOW:
        if not button_d_pressed:
            button_d_pressed = True
            button_d_start_time = time.time()
    else:
        if button_d_pressed:
            duration = time.time() - button_d_start_time
            button_d_pressed = False
            if duration >= 3:
                send_emergency_sms()
            else:
                gemini_describe_video()
            time.sleep(DEBOUNCE_TIME)

def main():
    GPIO.setmode(GPIO.BCM)
    GPIO.setup(CAPTURE_BUTTON_PIN, GPIO.IN, pull_up_down=GPIO.PUD_UP)
    GPIO.setup(RECOGNIZE_BUTTON_PIN, GPIO.IN, pull_up_down=GPIO.PUD_UP)
    GPIO.setup(GEMINI_IMAGE_PIN, GPIO.IN, pull_up_down=GPIO.PUD_UP)
    GPIO.setup(GEMINI_VIDEO_PIN, GPIO.IN, pull_up_down=GPIO.PUD_UP)

    speak_google("Netra AI system initialized")

    try:
        while True:
            # Button A - Capture + Train
            if GPIO.input(CAPTURE_BUTTON_PIN) == GPIO.LOW:
                capture_and_train()

            # Button B - Recognition Toggle
            if GPIO.input(RECOGNIZE_BUTTON_PIN) == GPIO.LOW:
                toggle_recognize()

            # Button C - Image Analysis
            if GPIO.input(GEMINI_IMAGE_PIN) == GPIO.LOW:
                gemini_describe_image()

            # Button D Handling
            handle_button_d()
            
            time.sleep(0.1)  # Reduce CPU usage

    except KeyboardInterrupt:
        speak_google("System shutting down")
    finally:
        if recognize_process:
            recognize_process.terminate()
        GPIO.cleanup()
        print("System cleaned up")

if __name__ == "__main__":
    main()
