import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("auth_user"))
  );

  const login = (data) => {
    localStorage.setItem("auth_token", data.access_token);
    localStorage.setItem("auth_user", JSON.stringify(data.user));
    setUser(data.user);
    navigate("/dashboard", { replace: true });
  };

  const logout = () => {
    // 🔥 CLEAR AUTH DATA
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");

    setUser(null);

    // 🔁 REDIRECT TO LOGIN
    navigate("/", { replace: true });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
