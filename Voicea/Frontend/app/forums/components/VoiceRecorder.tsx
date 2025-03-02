"use client";
import { useState, useRef } from "react";
import { Mic, Loader2 } from "lucide-react";

export default function VoiceRecorder({ onTranscription }: { onTranscription: (text: string) => void }) {
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/wav" });
        const transcription = "Sample transcribed text"; // Replace with real speech-to-text logic
        onTranscription(transcription);
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  return (
    <button onClick={recording ? stopRecording : startRecording} className="p-3 bg-purple-600 text-white rounded-lg mt-3">
      {recording ? <Loader2 className="h-6 w-6 animate-spin" /> : <Mic className="h-6 w-6" />}
    </button>
  );
}