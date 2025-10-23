import { createContext, useState, useEffect } from "react";
import { getCurrentUser, setCurrentUser } from "@/lib/auth";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => getCurrentUser() || {});

  // Khi auth thay đổi, cập nhật localStorage
  useEffect(() => {
    setCurrentUser(auth && auth.token ? auth : null);
  }, [auth]);

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
