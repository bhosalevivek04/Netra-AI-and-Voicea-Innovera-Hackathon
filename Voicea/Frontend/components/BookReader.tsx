"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Play, StopCircle, Loader2 } from "lucide-react";
import { pdfjs } from "react-pdf";
import * as pdfjsLib from "pdfjs-dist";

// Fix PDF worker source
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface ChangeEvent<T = Element> extends React.ChangeEvent<T> {}

export default function BookReader() {
  const [text, setText] = useState<string>("");
  const [isReading, setIsReading] = useState<boolean>(false);
  const [paused, setPaused] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>("");

  const speechQueueRef = useRef<SpeechSynthesisUtterance[]>([]);

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setFileName(file.name);

    if (file.type === "application/pdf") {
      await extractTextFromPDF(file);
    } else if (file.type.startsWith("text/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setText(e.target.result as string);
        }
        setIsLoading(false);
      };
      reader.readAsText(file);
    } else {
      alert(`❌ Unsupported file type: "${file.type}"`);
      setIsLoading(false);
    }
  };

  const extractTextFromPDF = async (file: File) => {
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (!e.target?.result) return;
        const typedArray = new Uint8Array(e.target.result as ArrayBuffer);
        const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
        let extractedText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          extractedText += textContent.items.map((item: any) => item.str).join(" ") + " ";
        }

        setText(extractedText);
        setIsLoading(false);
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("❌ PDF Extraction Error:", error);
      setIsLoading(false);
    }
  };

  const startReading = () => {
    if (!text) {
      alert("No text to read.");
      return;
    }

    speechSynthesis.cancel();
    setIsReading(true);
    setPaused(false);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setIsReading(false);
    speechSynthesis.speak(utterance);
  };

  const stopReading = () => {
    speechSynthesis.cancel();
    setIsReading(false);
    setPaused(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500">
      <div className="bg-white/20 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-96 transition-all hover:scale-105 border border-white/30">
        <h2 className="text-3xl font-bold text-white text-center mb-6 animate-pulse">
          📖 Book Reader
        </h2>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-white mb-2">Upload a File</label>
          <div className="relative">
            <input
              type="file"
              onChange={handleFileUpload}
              className="w-full px-4 py-3 border-2 border-white/40 bg-white/10 rounded-lg text-white placeholder-white focus:outline-none focus:border-white transition-all"
            />
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                <Loader2 className="h-6 w-6 text-white animate-spin" />
              </div>
            )}
          </div>
          {fileName && <p className="text-sm text-white mt-2">📂 {fileName}</p>}
        </div>

        {/* Display Extracted Text */}
        {text && (
          <div className="p-4 bg-white/10 text-white rounded-lg shadow-inner overflow-y-auto max-h-40 mb-6 border border-white/30">
            <p className="text-sm whitespace-pre-line">{text.slice(0, 500)}...</p>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col gap-4">
          <Button
            onClick={startReading}
            className="w-full bg-white/20 hover:bg-white/30 text-white py-3 rounded-lg flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-lg"
          >
            <Play size={18} /> Play
          </Button>
          <Button
            onClick={stopReading}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-lg"
          >
            <StopCircle size={18} /> Stop
          </Button>
        </div>
      </div>
    </div>
  );
}
