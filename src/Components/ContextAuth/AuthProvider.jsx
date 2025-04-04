import React, { createContext, useContext, useState, useEffect } from "react";

// Create context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const checkLoginStatus = () => {
      const loggedIn = localStorage.getItem("isLoggedIn") === "true";
      setIsAuthenticated(loggedIn);
      setIsLoading(false);
    };

    checkLoginStatus();
  }, []);

  // Login function
  const login = (username, password) => {
    return new Promise((resolve, reject) => {
      // Simulate API call
      setTimeout(() => {
        if (username === "AkaayStudio888" && password === "AkaayStudio888") {
          localStorage.setItem("isLoggedIn", "true");
          setIsAuthenticated(true);
          resolve(true);
        } else {
          reject("Invalid username or password");
        }
      }, 800);
    });
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("isLoggedIn");
    setIsAuthenticated(false);
  };

  // Context value
  const value = {
    isAuthenticated,
    isLoading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading ? children : <div>Loading...</div>}
    </AuthContext.Provider>
  );
};

export default AuthProvider;