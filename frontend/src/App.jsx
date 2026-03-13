import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// To be built
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import VoiceInsights from './pages/VoiceInsights';
import TypingAssessment from './pages/TypingAssessment';
import MusicMood from './pages/MusicMood';
import CheckIn from './pages/CheckIn';
import Signals from './pages/Signals';
import Settings from './pages/Settings';
import ClinicianPanel from './pages/ClinicianPanel';

import ProtectedRoute from './components/ProtectedRoute';
import AlertModal from './components/AlertModal';
import ErrorBoundary from './components/ErrorBoundary';
import CustomCursor from './components/CustomCursor';
import { AnimatePresence } from 'framer-motion';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen text-white text-sm">
        <CustomCursor />
        <Toaster position="top-right" />
        <AlertModal />
        
        <ErrorBoundary>
          <AnimatePresence mode="wait">
            <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/onboarding" element={
              <ProtectedRoute requireAuth={true}>
                <Onboarding />
              </ProtectedRoute>
            } />

            <Route path="/dashboard" element={
              <ProtectedRoute requireAuth={true} requireRole="user">
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/voice" element={
              <ProtectedRoute requireAuth={true} requireRole="user">
                <VoiceInsights />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/typing" element={
              <ProtectedRoute requireAuth={true} requireRole="user">
                <TypingAssessment />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/music" element={
              <ProtectedRoute requireAuth={true} requireRole="user">
                <MusicMood />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/checkin" element={
              <ProtectedRoute requireAuth={true} requireRole="user">
                <CheckIn />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/signals" element={
              <ProtectedRoute requireAuth={true} requireRole="user">
                <Signals />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/settings" element={
              <ProtectedRoute requireAuth={true}>
                <Settings />
              </ProtectedRoute>
            } />

            <Route path="/clinician" element={
              <ProtectedRoute requireAuth={true} requireRole="clinician">
                <ClinicianPanel />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </AnimatePresence>
        </ErrorBoundary>
      </div>
    </BrowserRouter>
  );
}

export default App;
