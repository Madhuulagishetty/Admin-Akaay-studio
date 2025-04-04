// src/components/Admin/AdminRoute.js
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// This component will protect admin routes
const AdminRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if admin is authenticated
    const adminAuth = JSON.parse(localStorage.getItem('adminAuth'));
    
    if (adminAuth && adminAuth.isAdmin) {
      // Optional: Check if the session is expired (e.g., after 2 hours)
      const sessionExpiry = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
      const isExpired = new Date().getTime() - adminAuth.timestamp > sessionExpiry;
      
      if (isExpired) {
        localStorage.removeItem('adminAuth');
        setIsAuthenticated(false);
        toast.error('Admin session expired. Please login again.');
      } else {
        setIsAuthenticated(true);
      }
    }
    
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loader">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default AdminRoute;