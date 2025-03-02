"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Link from "next/link";
import { motion } from "framer-motion";
import { VoiceAssistant } from "@/components/Chatbot";
import { Mic } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("student");
  const [isAssistantOpen, setIsAssistantOpen] = useState(false); // Correctly define state for the assistant

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
          <p className="text-gray-600 mt-2">Sign in to continue learning</p>
        </div>

        <form className="space-y-6">
          <div className="space-y-2">
            <Label>I am a:</Label>
            <RadioGroup defaultValue="student" onValueChange={(value) => setUserType(value)} className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="student" id="student" />
                <Label htmlFor="student">Student</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="teacher" id="teacher" />
                <Label htmlFor="teacher">Teacher</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full"
            />
          </div>

          <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">Sign In</Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-gray-600">Don't have an account?</span>{" "}
          <Link href="/signup" className="text-purple-600 hover:text-purple-700 font-medium">
            Sign up
          </Link>
        </div>
      </motion.div>

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