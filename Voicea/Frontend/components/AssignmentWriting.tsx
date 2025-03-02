"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, StopCircle, Download, Loader2 } from "lucide-react";
import jsPDF from "jspdf";

export default function AssignmentWriting({ data }: { data: { defaultText: string } }) {
  const [text, setText] = useState<string>(data?.defaultText || "");
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recog = new SpeechRecognition();
        recog.continuous = true;
        recog.interimResults = true;
        recog.lang = "en-US";

        recog.addEventListener("result", (event: SpeechRecognitionEvent) => {
          let transcript = "";
          for (let i = event.results.length - 1; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript + " ";
          }
          setText(transcript.trim());
        });

        recog.addEventListener("audiostart", () => setIsListening(true));
        recog.addEventListener("audioend", () => setIsListening(false));

        setRecognition(recog);
      } else {
        alert("Speech recognition is not supported in this browser.");
      }
    }
  }, []);

  const startListening = () => {
    if (recognition) {
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
    }
  };

  const downloadPDF = () => {
    if (!text) {
      alert("No text to save.");
      return;
    }

    setIsLoading(true);
    const doc = new jsPDF();
    doc.text(text, 10, 10, { maxWidth: 180 });
    doc.save("Assignment.pdf");
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 via-green-500 to-yellow-500">
      <div className="bg-white/20 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-96">
        <h2 className="text-3xl font-bold text-white text-center mb-6">📝 Assignment Writer</h2>
        <div className="p-4 bg-white/10 text-white rounded-lg shadow-inner overflow-y-auto max-h-40 mb-6">
          <p className="text-sm whitespace-pre-line">{text || "Start speaking..."}</p>
        </div>
        <div className="flex flex-col gap-4">
          <Button
            onClick={startListening}
            className="w-full bg-white/20 text-white py-3 rounded-lg flex items-center justify-center gap-2"
            disabled={isListening}
          >
            <Mic size={18} /> {isListening ? "Listening..." : "Start Speaking"}
          </Button>
          <Button
            onClick={stopListening}
            className="w-full bg-red-600 text-white py-3 rounded-lg flex items-center justify-center gap-2"
          >
            <StopCircle size={18} /> Stop
          </Button>
          <Button
            onClick={downloadPDF}
            className="w-full bg-green-600 text-white py-3 rounded-lg flex items-center justify-center gap-2"
            disabled={!text || isLoading}
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download size={18} />} Download PDF
          </Button>
        </div>
      </div>
    </div>
  );
}

// ✅ Server-Side Fetching
export async function getServerSideProps() {
  return { props: { data: { defaultText: "This is a sample assignment text." } } };
}
