import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("chatapp_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = (userData) => {
    localStorage.setItem("chatapp_user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("chatapp_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
