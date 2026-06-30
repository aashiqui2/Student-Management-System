import { createContext, useContext, useEffect, useState } from "react";

export type Role = "USER" | "ADMIN";

export interface User {
  username: string;
  role: Role;
  token: string;
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem("eduTrack_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem("eduTrack_user", JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("eduTrack_user");
  };

  const isAdmin = user?.role === "ADMIN";

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
