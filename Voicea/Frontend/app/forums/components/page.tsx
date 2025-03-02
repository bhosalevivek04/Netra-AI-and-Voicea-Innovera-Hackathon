"use client";

import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Mic, StopCircle, Send } from "lucide-react";
import { VoiceAssistant } from "@/components/Chatbot";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function ForumsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isAskCommunityOpen, setIsAskCommunityOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // ✅ Mock forum data (Replace with real API later)
  const forums = [
    { title: "Best AI tools for visually impaired?", author: "John Doe", link: "/forums/ai-tools" },
    { title: "How to use the Book Reader effectively?", author: "Jane Smith", link: "/forums/book-reader-tips" },
    { title: "Object detection not working properly?", author: "Alex Brown", link: "/forums/object-detection-issues" },
  ];

  // Start recording audio
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioURL(audioUrl);
    };

    mediaRecorder.start();
    setIsRecording(true);
  };

  // Stop recording audio
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1f2c]">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-4">Discussions</h1>
        <p className="text-blue-300">Join the Digital Community</p>

        {/* Search Bar */}
        <div className="mt-6 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search discussions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/10 border-0 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* ✅ Forum Discussion List (No API, No 404 Error) */}
        <div className="mt-8 bg-white/10 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-white mb-4">Latest Discussions</h2>
          <ul>
            {forums.map((forum, index) => (
              <li key={index} className="mb-4">
                <a href={forum.link} className="text-blue-400 hover:underline">
                  {forum.title}
                </a>
                <p className="text-gray-400 text-sm">By {forum.author}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Ask the Community Button */}
        <Button className="mt-6 bg-blue-500 text-white" onClick={() => setIsAskCommunityOpen(true)}>
          Ask the Community
        </Button>
      </div>

      {/* Ask the Community Modal */}
      <Dialog open={isAskCommunityOpen} onOpenChange={setIsAskCommunityOpen}>
        <DialogContent className="bg-[#1a1f2c] text-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Ask the Community</DialogTitle>
          </DialogHeader>
          <div className="mt-2 flex flex-col items-center gap-4">
            <p>Use your voice to ask the community your question.</p>

            {!isRecording ? (
              <Button onClick={startRecording} className="bg-green-500 text-white flex items-center gap-2">
                <Mic className="h-5 w-5" /> Start Recording
              </Button>
            ) : (
              <Button onClick={stopRecording} className="bg-red-500 text-white flex items-center gap-2">
                <StopCircle className="h-5 w-5" /> Stop Recording
              </Button>
            )}

            {audioURL && (
              <div className="w-full text-center">
                <p className="text-sm text-gray-400">Playback your recording:</p>
                <audio controls src={audioURL} className="mt-2 w-full" />
              </div>
            )}

            {audioURL && (
              <Button className="bg-blue-500 text-white flex items-center gap-2">
                <Send className="h-5 w-5" /> Submit Question
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Voice Assistant */}
      {isAssistantOpen && <VoiceAssistant onClose={() => setIsAssistantOpen(false)} />}
      <button
        onClick={() => setIsAssistantOpen(true)}
        className="fixed bottom-4 right-4 p-4 bg-purple-600 text-white rounded-full shadow-lg"
      >
        <Mic className="h-6 w-6" />
      </button>
    </div>
  );
}
