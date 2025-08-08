import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import NotificationManager from '../../components/common/notifications/NotificationManager';
import ErrorBoundary from '../../components/common/safety/ErrorBoundary';

export default function PrivateRoute({ children }) {
  const { currentUser } = useAuth();
  
  return currentUser ? (
    <>
      {children}
      <ErrorBoundary componentName="NotificationManager">
        <NotificationManager />
      </ErrorBoundary>
    </>
  ) : (
    <Navigate to="/login" />
  );
}