import { createContext, useContext, useEffect, useState } from "react";

export type Role = "ADMIN" | "STAFF" | "STUDENT";

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
  isStaff: boolean;
  isStudent: boolean;
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
  const isStaff = user?.role === "STAFF";
  const isStudent = user?.role === "STUDENT";

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, isStaff, isStudent }}>
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
