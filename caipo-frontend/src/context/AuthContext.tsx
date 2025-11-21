import React, { createContext, useContext, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { loginUser, registerUser, checkAuth, logout, setAuthLoading } from "../store/slices/authSlice";
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
  const user = useAppSelector((state) => state.auth.user);
  const loading = useAppSelector((state) => state.auth.loading);

  // Check if user is already logged in (token exists) on mount
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      dispatch(checkAuth());
    } else {
      // If no token, set loading to false without making API call
      dispatch(setAuthLoading(false));
    }
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
