#!/usr/bin/env python3

import RPi.GPIO as GPIO
import time
import subprocess

# BCM pin numbers for the buttons
CAPTURE_BUTTON_PIN = 17   # Button A: face_rec capture + train
RECOGNIZE_BUTTON_PIN = 18 # Button B: Toggle face_rec recognize on/off
GEMINI_IMAGE_PIN = 22     # Button C: gemini_image_describer.py
GEMINI_VIDEO_PIN = 23     # Button D: gemini_video_describer.py

recognize_process = None  # Global variable to track the face_rec 'recognize' process

def capture_and_train():
    """
    Run 'python face_rec.py capture' then 'python face_rec.py train'
    """
    print("Button A pressed: Capturing new face samples...")
    subprocess.run(["python", "face_rec.py", "capture"])
    print("Capture done. Now training...")
    subprocess.run(["python", "face_rec.py", "train"])
    print("Training done.")

def toggle_recognize():
    """
    If recognition is not running, start it in the background.
    If it is running, terminate it.
    """
    global recognize_process

    if recognize_process is None:
        # Start real-time recognition in the background
        print("Button B pressed: Starting real-time recognition...")
        recognize_process = subprocess.Popen(["python", "face_rec.py", "recognize"])
    else:
        # Stop the existing recognition process
        print("Button B pressed again: Stopping real-time recognition...")
        recognize_process.terminate()
        recognize_process = None

def gemini_describe_image():
    """
    Run 'python gemini_image_describer.py' to capture an image and describe it via Gemini.
    """
    print("Button C pressed: Capturing image and describing via Gemini...")
    subprocess.run(["python", "gemini_image_describer.py"])
    print("Gemini image description done.")

def gemini_describe_video():
    """
    Run 'python gemini_video_describer.py' to capture a short video and describe it via Gemini.
    """
    print("Button D pressed: Capturing video and describing via Gemini...")
    subprocess.run(["python", "gemini_video_describer.py"])
    print("Gemini video description done.")

def main():
    # Setup GPIO in BCM mode
    GPIO.setmode(GPIO.BCM)
    
    # Configure each button pin as input with an internal pull-up resistor
    GPIO.setup(CAPTURE_BUTTON_PIN, GPIO.IN, pull_up_down=GPIO.PUD_UP)
    GPIO.setup(RECOGNIZE_BUTTON_PIN, GPIO.IN, pull_up_down=GPIO.PUD_UP)
    GPIO.setup(GEMINI_IMAGE_PIN, GPIO.IN, pull_up_down=GPIO.PUD_UP)
    GPIO.setup(GEMINI_VIDEO_PIN, GPIO.IN, pull_up_down=GPIO.PUD_UP)

    print("Waiting for button presses. Press Ctrl+C to exit.")
    try:
        while True:
            # Check if Button A is pressed (pin reads LOW)
            if GPIO.input(CAPTURE_BUTTON_PIN) == GPIO.LOW:
                capture_and_train()
                time.sleep(1)  # Debounce

            # Check if Button B is pressed => toggle face_rec 'recognize'
            if GPIO.input(RECOGNIZE_BUTTON_PIN) == GPIO.LOW:
                toggle_recognize()
                time.sleep(1)  # Debounce

            # Check if Button C is pressed => Gemini image
            if GPIO.input(GEMINI_IMAGE_PIN) == GPIO.LOW:
                gemini_describe_image()
                time.sleep(1)  # Debounce

            # Check if Button D is pressed => Gemini video
            if GPIO.input(GEMINI_VIDEO_PIN) == GPIO.LOW:
                gemini_describe_video()
                time.sleep(1)  # Debounce

            time.sleep(0.1)  # Small delay to reduce CPU usage

    except KeyboardInterrupt:
        pass
    finally:
        # If the recognition process is still running, terminate it
        if recognize_process is not None:
            recognize_process.terminate()

        GPIO.cleanup()
        print("GPIO cleaned up. Exiting.")

if __name__ == "__main__":
    main()
