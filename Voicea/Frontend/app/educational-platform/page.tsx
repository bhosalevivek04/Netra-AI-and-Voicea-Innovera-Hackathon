"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { VoiceAssistant } from "@/components/Chatbot";
import { Mic } from "lucide-react";
 // ✅ Import VoiceNoteTaker

export default function EducationalPlatform() {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("features");

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-purple-600 mb-8">Welcome to Voicea</h2>
        <p className="text-center text-gray-600 mb-12">
          NetraAI is your AI-powered assistant designed to enhance accessibility
          and learning for the visually impaired. Explore the features below to get started.
        </p>

        {/* Tabs for Feature Navigation */}
        

          {/* Features Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: "📹", title: "Video Lectures", desc: "Learn through video lectures", link: "/video-lectures" },
                { icon: "📖", title: "Book Reader", desc: "Read and listen to books", link: "/book-reader" },
                { icon: "🧠", title: "Quizzes", desc: "Test your knowledge", link: "/quizzes" },
                { icon: "✍️", title: "Assignment Writing", desc: "Improve writing skills", link: "/assignment" },
                { icon: "👁️", title: "Object Detection", desc: "Explore AI-powered features", link: "/object-detection" },
                { icon: "📝", title: "Note-Taking", desc: "Dictate notes and save them for later reference.", link: "/note-taking" },
              ].map(({ icon, title, desc, link }, index) => (
                <Link key={title} href={link} passHref>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white p-6 rounded-lg shadow-lg text-center cursor-pointer hover:shadow-xl"
                  >
                    <div className="text-5xl mb-4 hover:animate-bounce">{icon}</div>
                    <h3 className="text-2xl font-bold mb-2">{title}</h3>
                    <p className="text-gray-600">{desc}</p>
                  </motion.div>
                </Link>
              ))}
            </div>
        

          {/* Voice Note-Taking Section */}
          
      </div>

      {/* Voice Assistant */}
      {isAssistantOpen && <VoiceAssistant onClose={() => setIsAssistantOpen(false)} />}
      <button
        onClick={() => setIsAssistantOpen(true)}
        className="fixed bottom-4 right-4 p-4 bg-purple-600 text-white rounded-full shadow-lg hover:animate-pulse"
      >
        <Mic className="h-6 w-6" />
      </button>
    </div>
  );
}
