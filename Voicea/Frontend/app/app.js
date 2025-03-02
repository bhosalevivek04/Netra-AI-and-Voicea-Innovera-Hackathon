import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import QuizCard from "./components/QuizCard"; // Adjust path if needed

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<QuizCard />} />
      </Routes>
    </Router>
  );
};

export default App;
