"use client";

import { useState, useEffect } from "react";

const questions = [
  {
    question: "What is the capital of France?",
    options: ["Paris", "London", "Berlin", "Madrid"],
    answer: "Paris",
  },
  {
    question: "Which planet is known as the Red Planet?",
    options: ["Earth", "Mars", "Jupiter", "Saturn"],
    answer: "Mars",
  },
  {
    question: "What is the largest mammal in the world?",
    options: ["Elephant", "Blue Whale", "Giraffe", "Shark"],
    answer: "Blue Whale",
  },
];

export default function AudioQuiz() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);
  const [isQuizFinished, setIsQuizFinished] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isQuizStarted, setIsQuizStarted] = useState<boolean>(false);

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  // Speech recognition setup
  const startListening = () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();
    setIsListening(true);

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const spokenAnswer = event.results[0][0].transcript.trim();
      console.log("User said:", spokenAnswer);
      handleAnswerSelection(spokenAnswer);
      setIsListening(false);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      speak("Sorry, I didn't catch that. Please try again.");
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  // Read the current question and options aloud
  useEffect(() => {
    if (isQuizStarted && !isQuizFinished) {
      const currentQuestion = questions[currentQuestionIndex];
      speak(`Question ${currentQuestionIndex + 1}: ${currentQuestion.question}`);

      setTimeout(() => {
        const optionsText = currentQuestion.options
          .map((option, index) => `${index + 1}. ${option}`)
          .join(", ");
        speak(`Options are: ${optionsText}`);
      }, 2000); // Delay to allow the question to be read first
    }
  }, [currentQuestionIndex, isQuizStarted, isQuizFinished]);

  // Handle answer selection
  const handleAnswerSelection = (answer: string) => {
    setSelectedAnswer(answer);
    const currentQuestion = questions[currentQuestionIndex];

    if (answer.toLowerCase() === currentQuestion.answer.toLowerCase()) {
      setScore(score + 1);
      speak("Correct!");
    } else {
      speak(`Incorrect. The correct answer is ${currentQuestion.answer}.`);
    }

    // Move to the next question or finish the quiz
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
      } else {
        setIsQuizFinished(true);
        speak(`Quiz finished. Your score is ${score + (answer.toLowerCase() === currentQuestion.answer.toLowerCase() ? 1 : 0)} out of ${questions.length}.`);
      }
    }, 3000); // Delay to allow feedback to be read
  };

  // Start the quiz
  const startQuiz = () => {
    setIsQuizStarted(true);
    setIsQuizFinished(false);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
  };

  // Stop the quiz
  const stopQuiz = () => {
    setIsQuizStarted(false);
    setIsQuizFinished(true);
    window.speechSynthesis.cancel(); // Stop any ongoing speech
  };

  // Restart the quiz
  const restartQuiz = () => {
    setIsQuizStarted(true);
    setIsQuizFinished(false);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-400 to-purple-500">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-96 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Audio Quiz</h1>

        {!isQuizStarted ? (
          <button
            onClick={startQuiz}
            className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Start Quiz
          </button>
        ) : !isQuizFinished ? (
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Question {currentQuestionIndex + 1} of {questions.length}
            </h2>
            <p className="text-gray-600 mb-6">{questions[currentQuestionIndex].question}</p>

            <div className="flex flex-wrap gap-2 justify-center mb-6">
              {questions[currentQuestionIndex].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelection(option)}
                  className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {index + 1}. {option}
                </button>
              ))}
            </div>

            {/* Audio Answer Button */}
            <button
              onClick={startListening}
              disabled={isListening}
              className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {isListening ? "Listening..." : "Answer with Audio"}
            </button>

            {/* Stop Quiz Button */}
            <button
              onClick={stopQuiz}
              className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 mt-4"
            >
              Stop Quiz
            </button>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Quiz Finished!</h2>
            <p className="text-gray-600 mb-6">
              Your score is {score} out of {questions.length}.
            </p>
            <button
              onClick={restartQuiz}
              className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Restart Quiz
            </button>
          </div>
        )}
      </div>
    </div>
  );
}