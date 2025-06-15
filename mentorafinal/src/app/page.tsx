'use client'; // Add this at the very top of the file

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Navbar } from '@/components/Navbar';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { LandingPage } from '@/pages/LandingPage';
import { Dashboard } from '@/pages/Dashboard';
import  MockInterview  from '@/pages/MockInterview';
import RealInterview from '@/pages/RealInterview';
import OnlineIde from '@/pages/OnlineIde';
import DoubtSolving from '@/pages/DoubtSolving';
import { LanguageLearning } from '@/pages/LanguageLearning';
import  FocusMode  from '@/pages/FocusMode';
import  CodePractice  from '@/pages/CodePractice';

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

function App() {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <ThemeProvider>
        <Router>
          <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
            <Navbar />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/mock-interview" 
                element={
                  <ProtectedRoute>
                    <MockInterview />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/real-interview" 
                element={
                  <ProtectedRoute>
                    <RealInterview />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/language-learning" 
                element={
                  <ProtectedRoute>
                    <LanguageLearning />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/online-ide" 
                element={
                  <ProtectedRoute>
                    <OnlineIde />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/doubt-solving" 
                element={
                  <ProtectedRoute>
                    <DoubtSolving />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/focus-mode" 
                element={
                  <ProtectedRoute>
                    <FocusMode />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/code-practice" 
                element={
                  <ProtectedRoute>
                    <CodePractice />
                  </ProtectedRoute>
                } 
              />
              
            </Routes>
          </div>
        </Router>
      </ThemeProvider>
    </ClerkProvider>
  );
}

export default App;