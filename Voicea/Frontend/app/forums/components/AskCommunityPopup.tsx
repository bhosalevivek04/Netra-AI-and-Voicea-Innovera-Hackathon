import React, { useState } from "react";
import VoiceRecorder from "./VoiceRecorder";

export default function AskCommunityPopup({ onClose }: { onClose: () => void }) {
  const [question, setQuestion] = useState("");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg">
        <h2 className="text-xl font-bold mb-4">Ask the Community</h2>
        <textarea
          className="w-full p-2 border rounded-lg"
          placeholder="Type your question or use voice input..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        ></textarea>

        {/* Voice Recording Component */}
        <VoiceRecorder onTranscription={setQuestion} />

        <button onClick={onClose} className="mt-4 p-2 bg-red-600 text-white rounded-lg">
          Close
        </button>
      </div>
    </div>
  );
}