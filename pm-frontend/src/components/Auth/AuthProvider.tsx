import React, { createContext, useContext, useEffect } from "react";

const AuthContext = createContext<null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {

  useEffect(() => {
    // Check if user is already logged in on app start
    // Zustand persist will handle this automatically
  }, []);

  return <AuthContext.Provider value={null}>{children}</AuthContext.Provider>;
};
