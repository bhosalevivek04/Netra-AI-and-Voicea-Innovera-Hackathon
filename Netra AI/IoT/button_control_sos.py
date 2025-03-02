#!/usr/bin/env python3

import RPi.GPIO as GPIO
import time
import subprocess
import requests

# BCM pin numbers for the buttons
CAPTURE_BUTTON_PIN = 17   # Button A: face_rec capture + train
RECOGNIZE_BUTTON_PIN = 18 # Button B: face_rec recognize
GEMINI_IMAGE_PIN = 22     # Button C: gemini_image_describer.py
GEMINI_VIDEO_PIN = 23     # Button D: gemini_video_describer.py (Short press => video, Long press => emergency)

recognize_process = None

def capture_and_train():
    print("Button A pressed: Capturing new face samples...")
    subprocess.run(["python", "face_rec.py", "capture"])
    print("Capture done. Now training...")
    subprocess.run(["python", "face_rec.py", "train"])
    print("Training done.")

def toggle_recognize():
    global recognize_process
    if recognize_process is None:
        print("Button B pressed: Starting real-time recognition...")
        recognize_process = subprocess.Popen(["python", "face_rec.py", "recognize"])
    else:
        print("Button B pressed again: Stopping real-time recognition...")
        recognize_process.terminate()
        recognize_process = None

def gemini_describe_image():
    print("Button C pressed: Capturing image and describing via Gemini...")
    subprocess.run(["python", "gemini_image_describer.py"])
    print("Gemini image description done.")

def gemini_describe_video():
    """
    Capture a short video and describe it via Gemini.
    """
    print("Short press: Capturing video and describing via Gemini...")
    subprocess.run(["python", "gemini_video_describer.py"])
    print("Gemini video description done.")

def call_emergency():
    """
    Send a POST request to the emergency alert system.
    This will trigger an SMS via Twilio to the predefined emergency contact.
    """
    url = "https://emergency-alert-system.onrender.com/data"

    print("Long press detected. Sending emergency SMS request...")

    try:
        response = requests.post(url, timeout=10)  # Send POST request
        
        print(f"HTTP Status Code: {response.status_code}")
        print(f"Response Text: {response.text}")

        if response.ok:
            print("Emergency SMS request was successfully processed.")
        else:
            print("Failed to trigger emergency SMS. Check server logs.")

    except requests.exceptions.Timeout:
        print("Error: Request timed out. The server did not respond.")
    except requests.exceptions.RequestException as e:
        print(f"Error sending emergency request: {str(e)}")


def handle_gemini_button():
    """
    Single button logic:
      - Press/hold the button. 
      - If user holds >= 3 seconds => call_emergency()
      - If user holds < 3 seconds => gemini_describe_video()
    """
    print("Button D pressed. Determining short press or long press...")
    start_time = time.time()
    
    # Wait until user releases the button
    while GPIO.input(GEMINI_VIDEO_PIN) == GPIO.LOW:
        time.sleep(0.01)  # minimal sleep to avoid busy looping

    press_duration = time.time() - start_time
    if press_duration >= 3:
        # Long press => Emergency
        call_emergency()
    else:
        # Short press => Gemini Video
        gemini_describe_video()

def main():
    GPIO.setmode(GPIO.BCM)

    # Setup each button pin as input (with or without internal pull-ups, depending on wiring)
    GPIO.setup(CAPTURE_BUTTON_PIN, GPIO.IN, pull_up_down=GPIO.PUD_UP)
    GPIO.setup(RECOGNIZE_BUTTON_PIN, GPIO.IN, pull_up_down=GPIO.PUD_UP)
    GPIO.setup(GEMINI_IMAGE_PIN, GPIO.IN, pull_up_down=GPIO.PUD_UP)
    GPIO.setup(GEMINI_VIDEO_PIN, GPIO.IN, pull_up_down=GPIO.PUD_UP)

    print("Waiting for button presses. Press Ctrl+C to exit.")
    try:
        while True:
            # Button A: Capture + Train
            if GPIO.input(CAPTURE_BUTTON_PIN) == GPIO.LOW:
                capture_and_train()
                time.sleep(1)

            # Button B: Toggle Recognize
            if GPIO.input(RECOGNIZE_BUTTON_PIN) == GPIO.LOW:
                toggle_recognize()
                time.sleep(1)

            # Button C: Gemini Image
            if GPIO.input(GEMINI_IMAGE_PIN) == GPIO.LOW:
                gemini_describe_image()
                time.sleep(1)

            # Button D: Single button for Gemini Video (short press) or Emergency (long press)
            if GPIO.input(GEMINI_VIDEO_PIN) == GPIO.LOW:
                handle_gemini_button()
                time.sleep(1)

            time.sleep(0.1)

    except KeyboardInterrupt:
        pass
    finally:
        if recognize_process is not None:
            recognize_process.terminate()
        GPIO.cleanup()
        print("GPIO cleaned up. Exiting.")

if __name__ == "__main__":
    main()
