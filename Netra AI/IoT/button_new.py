#!/usr/bin/env python3

import RPi.GPIO as GPIO
import time
import subprocess
import requests

# BCM pin numbers for the buttons
CAPTURE_BUTTON_PIN = 17   # Button A: face_rec capture + train
RECOGNIZE_BUTTON_PIN = 18 # Button B: Toggle face_rec recognize on/off
GEMINI_IMAGE_PIN = 22     # Button C: gemini_image_describer.py
GEMINI_VIDEO_PIN = 23     # Button D: gemini_video_describer.py (long press for emergency)

# Emergency SMS configuration
EMERGENCY_ENDPOINT = "https://emergency-alert-system.onrender.com/data"
DEBOUNCE_TIME = 1  # Seconds to wait after button press

recognize_process = None  # Track face_rec 'recognize' process
button_d_pressed = False  # Track Button D press state
button_d_start_time = 0   # Track Button D press start time

def capture_and_train():
    """Run face recognition capture and training"""
    print("Button A pressed: Capturing new face samples...")
    subprocess.run(["python", "face_rec.py", "capture"])
    print("Capture done. Now training...")
    subprocess.run(["python", "face_rec.py", "train"])
    print("Training done.")

def toggle_recognize():
    """Toggle face recognition on/off"""
    global recognize_process
    if recognize_process is None:
        print("Button B pressed: Starting real-time recognition...")
        recognize_process = subprocess.Popen(["python", "face_rec.py", "recognize"])
    else:
        print("Button B pressed again: Stopping real-time recognition...")
        recognize_process.terminate()
        recognize_process = None

def gemini_describe_image():
    """Describe image using Gemini"""
    print("Button C pressed: Capturing image and describing via Gemini...")
    subprocess.run(["python", "gemini_image_describer.py"])
    print("Gemini image description done.")

def gemini_describe_video():
    """Describe video using Gemini"""
    print("Short press: Capturing video and describing via Gemini...")
    subprocess.run(["python", "gemini_video_describer.py"])
    print("Gemini video description done.")

def send_emergency_sms():
    """Trigger emergency SMS via web server"""
    print("Long press detected: Sending emergency SMS...")
    try:
        response = requests.post(EMERGENCY_ENDPOINT)
        if response.status_code == 200:
            print("Emergency SMS sent successfully.")
        else:
            print(f"Failed to send SMS. Status code: {response.status_code}")
    except Exception as e:
        print(f"Error sending emergency SMS: {e}")

def main():
    GPIO.setmode(GPIO.BCM)
    GPIO.setup(CAPTURE_BUTTON_PIN, GPIO.IN, pull_up_down=GPIO.PUD_UP)
    GPIO.setup(RECOGNIZE_BUTTON_PIN, GPIO.IN, pull_up_down=GPIO.PUD_UP)
    GPIO.setup(GEMINI_IMAGE_PIN, GPIO.IN, pull_up_down=GPIO.PUD_UP)
    GPIO.setup(GEMINI_VIDEO_PIN, GPIO.IN, pull_up_down=GPIO.PUD_UP)

    print("Waiting for button presses. Press Ctrl+C to exit.")
    try:
        while True:
            # Handle Button A
            if GPIO.input(CAPTURE_BUTTON_PIN) == GPIO.LOW:
                capture_and_train()
                time.sleep(DEBOUNCE_TIME)

            # Handle Button B
            if GPIO.input(RECOGNIZE_BUTTON_PIN) == GPIO.LOW:
                toggle_recognize()
                time.sleep(DEBOUNCE_TIME)

            # Handle Button C
            if GPIO.input(GEMINI_IMAGE_PIN) == GPIO.LOW:
                gemini_describe_image()
                time.sleep(DEBOUNCE_TIME)

            # Handle Button D
            current_state_d = GPIO.input(GEMINI_VIDEO_PIN)
            global button_d_pressed, button_d_start_time
            
            if current_state_d == GPIO.LOW:
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

            time.sleep(0.1)  # Main loop delay

    except KeyboardInterrupt:
        pass
    finally:
        if recognize_process:
            recognize_process.terminate()
        GPIO.cleanup()
        print("GPIO cleaned up. Exiting.")

if __name__ == "__main__":
    main()
