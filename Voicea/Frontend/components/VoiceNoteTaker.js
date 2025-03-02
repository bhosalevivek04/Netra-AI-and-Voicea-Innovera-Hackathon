"use client";

import React, { useState, useRef, useEffect } from "react";

const VoiceNoteTaker = () => {
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [reminders, setReminders] = useState([]);
  const [reminderText, setReminderText] = useState("");
  const [reminderTime, setReminderTime] = useState("");
  const recognitionRef = useRef(null);

  // Load saved notes and reminders from localStorage
  useEffect(() => {
    const savedNotes = JSON.parse(localStorage.getItem("voiceNotes")) || [];
    const savedReminders = JSON.parse(localStorage.getItem("reminders")) || [];
    setNotes(savedNotes);
    setReminders(savedReminders);
  }, []);

  // Save notes and reminders to localStorage
  useEffect(() => {
    localStorage.setItem("voiceNotes", JSON.stringify(notes));
    localStorage.setItem("reminders", JSON.stringify(reminders));
  }, [notes, reminders]);

  // Check reminders every 30 seconds and play audio notification
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      reminders.forEach((reminder, index) => {
        const reminderTime = new Date(reminder.time);
        if (Math.abs(now - reminderTime) <= 60000) {
          const utterance = new SpeechSynthesisUtterance(`Reminder: ${reminder.text}`);
          window.speechSynthesis.speak(utterance);
          const updatedReminders = reminders.filter((_, i) => i !== index);
          setReminders(updatedReminders);
        }
      });
    };

    const interval = setInterval(checkReminders, 30000);
    return () => clearInterval(interval);
  }, [reminders]);

  // Start speech recognition
  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support speech recognition.");
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = "en-US";

    recognitionRef.current.onstart = () => setIsRecording(true);
    recognitionRef.current.onend = () => setIsRecording(false);

    recognitionRef.current.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript + " ";
      }
      setNote(transcript);
    };

    recognitionRef.current.start();
  };

  // Stop speech recognition
  const stopRecording = () => {
    recognitionRef.current?.stop();
  };

  // Save voice note
  const saveNote = () => {
    if (note.trim()) {
      setNotes([...notes, note]);
      setNote("");
    }
  };

  // Delete a note
  const deleteNote = (index) => {
    const updatedNotes = notes.filter((_, i) => i !== index);
    setNotes(updatedNotes);
  };

  // Play text as speech
  const playAudio = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  // Add a new reminder
  const addReminder = () => {
    if (reminderText.trim() && reminderTime) {
      setReminders([...reminders, { text: reminderText, time: reminderTime }]);
      setReminderText("");
      setReminderTime("");
    }
  };

  // Delete a reminder
  const deleteReminder = (index) => {
    const updatedReminders = reminders.filter((_, i) => i !== index);
    setReminders(updatedReminders);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-indigo-400 to-purple-500 p-6">
      <h2 className="text-3xl font-bold text-white mb-6">Voice-Controlled Notes & Reminders</h2>
      
      {/* Voice Note Section */}
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg text-center">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Take a Voice Note</h3>
        <div className="mb-4 p-4 border rounded bg-gray-100 h-40 overflow-auto text-gray-700">
          {note || "Start speaking to take notes..."}
        </div>
        <button
          className={`px-4 py-2 rounded text-white ${isRecording ? "bg-red-500" : "bg-blue-500"}`}
          onClick={isRecording ? stopRecording : startRecording}
        >
          {isRecording ? "Stop Recording" : "Start Recording"}
        </button>
        <button className="ml-2 px-4 py-2 bg-green-500 text-white rounded" onClick={saveNote} disabled={!note.trim()}>
          Save Note
        </button>
      </div>

      {/* Saved Notes Section */}
      <div className="mt-6 w-full max-w-lg">
        <h3 className="text-xl font-semibold text-white mb-4">Saved Notes</h3>
        <div className="grid gap-4">
          {notes.map((savedNote, index) => (
            <div key={index} className="p-4 bg-white rounded-lg shadow flex justify-between items-center">
              <span className="text-gray-800">{savedNote}</span>
              <div>
                <button className="text-blue-500 mr-2" onClick={() => playAudio(savedNote)}>▶</button>
                <button className="text-red-500" onClick={() => deleteNote(index)}>✖</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reminders Section */}
      <div className="mt-6 w-full max-w-lg bg-white p-6 rounded-lg shadow-xl">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Set a Reminder</h3>
        <input
          type="text"
          className="border p-2 rounded w-full mb-2"
          placeholder="Enter reminder..."
          value={reminderText}
          onChange={(e) => setReminderText(e.target.value)}
        />
        <input
          type="datetime-local"
          className="border p-2 rounded w-full"
          value={reminderTime}
          onChange={(e) => setReminderTime(e.target.value)}
        />
        <button className="mt-2 px-4 py-2 bg-purple-500 text-white rounded w-full" onClick={addReminder} disabled={!reminderText.trim() || !reminderTime}>
          Add Reminder
        </button>
        <div className="mt-4 grid gap-4">
          {reminders.map((reminder, index) => (
            <div key={index} className="p-4 bg-gray-100 rounded-lg shadow flex justify-between items-center">
              <span className="text-gray-800">{reminder.text} at {new Date(reminder.time).toLocaleString()}</span>
              <button className="text-red-500" onClick={() => deleteReminder(index)}>✖</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VoiceNoteTaker;
