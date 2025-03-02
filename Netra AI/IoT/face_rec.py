#!/usr/bin/env python3

import cv2
import os
import sys
import numpy as np
import time
import speech_recognition as sr
from gtts import gTTS

##################################
# CONFIGURABLE PARAMETERS
##################################
HAAR_CASCADE_PATH = "haarcascade_frontalface_default.xml"  # Haar cascade for face detection
DATASET_DIR = "dataset"         # Where face images are stored
MODEL_PATH = "face_model.xml"   # LBPH model output
NUM_SAMPLES = 20                # How many face images to capture

##################################
# GOOGLE TTS (Text-to-Speech)
##################################
def speak_google(text):
    """
    Use Google TTS to speak 'text' (requires internet).
    We'll use 'mpg123' for playback to keep it simple on Raspberry Pi.
    """
    if not text:
        return
    tts = gTTS(text, lang='en')
    filename = "temp_tts.mp3"
    tts.save(filename)
    # Use mpg123 to play
    os.system(f"mpg123 -q {filename}")
    os.remove(filename)

##################################
# GOOGLE STT (Speech-to-Text)
##################################
def record_name_from_mic_google():
    """
    Capture audio from the microphone using Google STT (online).
    Returns recognized text or None if unsuccessful.
    """
    r = sr.Recognizer()
    # If you have multiple microphones, specify device_index here
    # mic = sr.Microphone(device_index=2)
    mic = sr.Microphone()

    # Prompt the user (optional)
    speak_google("Please say your name after the beep.")
    time.sleep(1)

    with mic as source:
        r.adjust_for_ambient_noise(source, duration=1)
        print("Listening for your name via Google STT...")
        audio_data = r.listen(source, phrase_time_limit=5)

    try:
        text = r.recognize_google(audio_data)
        text = text.strip()
        print(f"Google recognized: '{text}'")
        return text
    except sr.UnknownValueError:
        print("Could not understand your speech.")
    except sr.RequestError:
        print("Google STT service unavailable. Check internet.")

    return None

##################################
# FACE DETECTION
##################################
def detect_faces(gray_img):
    face_cascade = cv2.CascadeClassifier(HAAR_CASCADE_PATH)
    faces = face_cascade.detectMultiScale(gray_img, scaleFactor=1.3, minNeighbors=5)
    return faces

##################################
# CAPTURE SAMPLES
##################################
def capture_samples(person_name, num_samples=NUM_SAMPLES):
    """
    Capture face samples from the camera and store them in dataset/<person_name>.
    Each face is cropped to grayscale and saved as .jpg.
    """
    person_folder = os.path.join(DATASET_DIR, person_name)
    os.makedirs(person_folder, exist_ok=True)

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Could not open camera.")
        return

    count = 0
    while count < num_samples:
        ret, frame = cap.read()
        if not ret:
            continue

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = detect_faces(gray)
        for (x, y, w, h) in faces:
            roi_gray = gray[y:y+h, x:x+w]
            save_path = os.path.join(person_folder, f"{person_name}_{count}.jpg")
            cv2.imwrite(save_path, roi_gray)
            count += 1
            print(f"Captured {count}/{num_samples} face samples for {person_name}")
            time.sleep(0.2)
            if count >= num_samples:
                break

        cv2.imshow("Capture Samples", frame)
        if cv2.waitKey(1) & 0xFF == 27:  # ESC
            break

    cap.release()
    cv2.destroyAllWindows()
    print(f"Done capturing {num_samples} samples for {person_name}.")

##################################
# TRAIN LBPH MODEL
##################################
def train_model():
    """
    Train an LBPH face recognizer on images in dataset/<person_name>.
    Saves the model to MODEL_PATH and label_map.txt
    """
    recognizer = cv2.face.LBPHFaceRecognizer_create()
    faces = []
    labels = []
    label_map = {}
    current_label = 0

    for person_name in os.listdir(DATASET_DIR):
        person_folder = os.path.join(DATASET_DIR, person_name)
        if not os.path.isdir(person_folder):
            continue
        label_map[person_name] = current_label
        for filename in os.listdir(person_folder):
            if filename.endswith(".jpg"):
                path = os.path.join(person_folder, filename)
                img = cv2.imread(path, cv2.IMREAD_GRAYSCALE)
                if img is not None:
                    faces.append(img)
                    labels.append(current_label)
        current_label += 1

    if len(faces) < 2:
        print("Not enough images to train. Please capture more samples for at least 2 people.")
        return

    recognizer.train(faces, np.array(labels))
    recognizer.write(MODEL_PATH)
    print("LBPH model trained and saved to", MODEL_PATH)
    print("Label map:", label_map)

    # Save label map
    with open("label_map.txt", "w") as f:
        for pname, lid in label_map.items():
            f.write(f"{lid}:{pname}\n")

##################################
# LOAD LABEL MAP
##################################
def load_label_map():
    label_map = {}
    if not os.path.exists("label_map.txt"):
        return label_map
    with open("label_map.txt", "r") as f:
        for line in f:
            line = line.strip()
            if line:
                parts = line.split(":")
                label_id = int(parts[0])
                name = parts[1]
                label_map[label_id] = name
    return label_map

##################################
# RECOGNIZE LOOP
##################################
def recognize_loop():
    """
    Real-time recognition using LBPH. Speaks recognized name via Google TTS.
    Press ESC to quit.
    """
    if not os.path.exists(MODEL_PATH):
        print("No trained model found. Please run 'train' first.")
        return

    recognizer = cv2.face.LBPHFaceRecognizer_create()
    recognizer.read(MODEL_PATH)
    label_map = load_label_map()

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Could not open camera.")
        return

    speak_google("Recognition started. Press escape to stop.")

    while True:
        ret, frame = cap.read()
        if not ret:
            continue

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = detect_faces(gray)
        for (x, y, w, h) in faces:
            roi_gray = gray[y:y+h, x:x+w]
            label_id, confidence = recognizer.predict(roi_gray)
            name = label_map.get(label_id, "Unknown")

            # Draw bounding box
            cv2.rectangle(frame, (x, y), (x+w, y+h), (0,255,0), 2)
            text = f"{name} ({confidence:.2f})"
            cv2.putText(frame, text, (x, y-10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0,255,0), 2)

            # If confidence is too high => "Unknown"
            if confidence > 80:
                name = "Unknown"

            # Speak recognized name
            speak_google(name)

        cv2.imshow("Recognizing...", frame)
        if cv2.waitKey(1) & 0xFF == 27:  # ESC to exit
            break

    cap.release()
    cv2.destroyAllWindows()
    speak_google("Recognition stopped.")

##################################
# COMMAND LINE INTERFACE
##################################
def print_help():
    print("""
Usage: python face_rec.py [command]

Commands:
  capture  - Use Google STT to get person's name, then capture face images
  train    - Train LBPH model on the dataset
  recognize- Real-time recognition with Google TTS
""")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print_help()
        sys.exit(0)

    command = sys.argv[1].lower()

    if command == "capture":
        # 1) Use Google STT to get name
        recognized_name = record_name_from_mic_google()
        if not recognized_name:
            print("No name recognized. Exiting capture.")
            sys.exit(0)

        # 2) Capture images
        capture_samples(recognized_name, num_samples=NUM_SAMPLES)

    elif command == "train":
        train_model()

    elif command == "recognize":
        recognize_loop()

    else:
        print_help()
