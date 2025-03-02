import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";

const ObjectDetection: React.FC = () => {
  const webcamRef = useRef<Webcam | null>(null); // Explicit type
  const [prediction, setPrediction] = useState<string>("");

  const captureAndClassify = async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) return;

      // Load the image
      const img = new Image();
      img.src = imageSrc;
      img.onload = async () => {
        const model = await cocoSsd.load(); // Load the COCO-SSD model
        const predictions = await model.detect(img);

        if (predictions.length > 0) {
          const result = predictions[0].class; // Get the first detected object
          setPrediction(result);
          speak(result);
        } else {
          setPrediction("No object detected");
          speak("No object detected");
        }
      };
    }
  };

  const speak = (text: string) => {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(`Detected object is: ${text}`);
    synth.speak(utterance);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h1 className="text-xl font-bold mb-4">NetraAI - Object Recognition</h1>
      
      <div className="relative w-full max-w-md">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          className="w-full border rounded-lg"
        />
        {prediction && (
          <p className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black text-white px-4 py-2 rounded-lg text-center text-lg font-semibold">
            Detected: {prediction}
          </p>
        )}
      </div>

      <button
        onClick={captureAndClassify}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
      >
        Detect Object
      </button>
    </div>
  );
};

export default ObjectDetection;
