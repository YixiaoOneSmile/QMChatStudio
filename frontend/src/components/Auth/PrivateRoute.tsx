import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { currentUser } = useSelector((state: RootState) => state.user);

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}; 