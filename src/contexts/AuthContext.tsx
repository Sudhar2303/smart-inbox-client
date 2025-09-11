import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import authService from "../services/authService";

type AuthContextType = {
  isAuthenticated: boolean;
  setUserAuthenticated: (auth: boolean) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
      const verifyAuth = async () => {
      try {
        const result = await authService.checkAuthStatus();
        setIsAuthenticated(!!result?.data?.authenticated);
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false); 
      }
    };

    verifyAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setUserAuthenticated: setIsAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
