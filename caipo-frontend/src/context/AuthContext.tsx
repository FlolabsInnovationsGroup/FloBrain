import React, { createContext, useContext, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { checkAuth, loginUser, registerUser, logout } from "../store/slices/authSlice";
import { User } from "../types/auth";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector((state) => state.auth);

  // Check if user is already logged in (token exists)
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  const login = async (email: string, password: string) => {
    await dispatch(loginUser({ email, password })).unwrap();
  };

  const register = async (email: string, password: string) => {
    await dispatch(registerUser({ email, password })).unwrap();
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
