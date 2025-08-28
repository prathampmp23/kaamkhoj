import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage';
import AiAssistantPage from './AiAssistantPage';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/assistant" element={<AiAssistantPage />} />
    </Routes>
  );
};

export default App;
