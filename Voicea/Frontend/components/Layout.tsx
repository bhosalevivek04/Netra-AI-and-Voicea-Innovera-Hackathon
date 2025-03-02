import { VoiceAssistant } from "@/components/Chatbot";
import { X, Mic } from "lucide-react";
import { useState } from "react";
export default function Layout({ children }: { children: React.ReactNode }) {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  return (
    <div>
      {children}
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