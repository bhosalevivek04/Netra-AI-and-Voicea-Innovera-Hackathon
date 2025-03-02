"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input"; // Import Input component
import { X, Mic } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Add type definitions for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

export function VoiceAssistant({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Array<{ text: string; isBot: boolean }>>([
    { text: "Hi! I'm your voice assistant. How can I help you today?", isBot: true },
  ]);
  const [listening, setListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [inputText, setInputText] = useState(""); // State for typed input

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error("Speech Recognition not supported in this browser.");
      return;
    }

    const recognizer = new SpeechRecognition();
    recognizer.continuous = false;
    recognizer.interimResults = false;
    recognizer.lang = "en-US";
    recognizer.onresult = handleSpeechResult;
    recognizer.onerror = handleSpeechError;
    setRecognition(recognizer);
  }, []);

  const handleSpeechResult = (event: SpeechRecognitionEvent) => {
    const transcript = event.results[0][0].transcript;
    setMessages((prev) => [...prev, { text: transcript, isBot: false }]);
    processCommand(transcript);
  };

  const handleSpeechError = (event: SpeechRecognitionErrorEvent) => {
    console.error("Speech recognition error:", event.error);
    setMessages((prev) => [
      ...prev,
      { text: "Sorry, I couldn't understand that. Please try again.", isBot: true },
    ]);
  };

  const processCommand = (command: string) => {
    let response = "I'm not sure how to help with that.";
    if (command.toLowerCase().includes("go to home")) {
      window.location.href = "/";
      response = "Navigating to the home page.";
    } else if (command.toLowerCase().includes("go to about")) {
      window.location.href = "/about";
      response = "Navigating to the about page.";
    } else if (command.toLowerCase().includes("go to contact")) {
      window.location.href = "/contact";
      response = "Navigating to the contact page.";
    } else if (command.toLowerCase().includes("go to forum")) {
      window.location.href = "/forums";
      response = "Navigating to the forum page.";
    } else if (command.toLowerCase().includes("go to login")) {
      window.location.href = "/login";
      response = "Navigating to the login page.";
    } else if (command.toLowerCase().includes("go to sign up")) {
      window.location.href = "/signup";
      response = "Navigating to the signup page.";
    } else if (command.toLowerCase().includes("go to voicea")) {
      window.location.href = "/voicea";
      response = "Navigating to the Voicea page.";
    } else if (command.toLowerCase().includes("go to netra ai")) {
      window.location.href = "/netra";
      response = "Navigating to the Netra AI page.";
    } else if (command.toLowerCase().includes("go to back") || command.toLowerCase().includes("go back")) {
      window.history.back(); // Navigate to the previous page
      response = "Going back to the previous page.";
    }

    setMessages((prev) => [...prev, { text: response, isBot: true }]);
    speak(response);
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (recognition) {
      if (!listening) {
        recognition.start();
        setListening(true);
      } else {
        recognition.stop();
        setListening(false);
      }
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // Add user message
    setMessages((prev) => [...prev, { text: inputText, isBot: false }]);
    processCommand(inputText);
    setInputText(""); // Clear input field
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="absolute bottom-16 right-0 w-96 bg-white rounded-lg shadow-xl"
      >
        <Card className="border-0">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold">Voice Assistant</h3>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}>
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.isBot ? "bg-gray-100 text-gray-900" : "bg-purple-600 text-white"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t">
            {/* Input field for typing */}
            <form onSubmit={handleTextSubmit} className="mb-4">
              <div className="flex gap-2">
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1"
                />
                <Button type="submit">Send</Button>
              </div>
            </form>

            {/* Microphone button for voice input */}
            <Button
              onClick={toggleListening}
              className="w-full flex items-center justify-center gap-2"
              variant={listening ? "destructive" : "default"}
            >
              <Mic className="h-4 w-4" />
              {listening ? "Stop Listening" : "Start Listening"}
            </Button>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}