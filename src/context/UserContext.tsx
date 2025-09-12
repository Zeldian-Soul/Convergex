import React, { createContext, useContext, useState, ReactNode } from "react";

type User = {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  clubs: string[];
};

type UserContextType = {
  user: User | null;
  login: (email: string, password: string) => void;
  logout: () => void;
  toggleClubFollow: (club: string) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, password: string) => {
    const isAdmin = email.includes("admin");
    setUser({
      id: Date.now().toString(),
      name: email.split("@")[0],
      email,
      isAdmin,
      clubs: [],
    });
  };

  const logout = () => setUser(null);

  const toggleClubFollow = (club: string) => {
    if (!user) return;
    setUser({
      ...user,
      clubs: user.clubs.includes(club)
        ? user.clubs.filter((c) => c !== club)
        : [...user.clubs, club],
    });
  };

  return (
    <UserContext.Provider value={{ user, login, logout, toggleClubFollow }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be inside UserProvider");
  return ctx;
}
