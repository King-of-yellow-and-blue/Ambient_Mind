import React from 'react';
import { Navigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

const ProtectedRoute = ({ children, requireAuth, requireRole }) => {
  // Safe check for token in localStorage from zustand persist
  let token = null;
  try {
    const storage = localStorage.getItem('user-storage');
    if (storage) token = JSON.parse(storage).state?.token;
  } catch (e) {}
  
  const user = useStore((state) => state.user);

  if (requireAuth && (!token || !user)) {
    return <Navigate to="/login" replace />;
  }

  if (requireRole && user?.role && user.role !== requireRole) {
    if (user.role === 'clinician') return <Navigate to="/clinician" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
