import { message } from "antd";
import { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api";
import { user } from "../types";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: any) => {
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();

  const [user, setUser] = useState<user | null>(null);
  const [token, setToken] = useState<string | null>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshToken();
  }, []);

  async function refreshToken() {
    const token = localStorage.getItem("auth-key");
    try {
      const res = await axios.get("/auth/refresh", {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });

      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem("auth-key", res.data.token);
      setLoading(false);
    } catch (error) {
      setToken(null);
      setLoading(false);
    }
  }

  async function login(username: string, password: string) {
    setLoading(true);
    try {
      const res = await axios.post("/auth/signin", {
        username,
        password,
      });
      localStorage.setItem("auth-key", res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setLoading(false);

      navigate("/");
    } catch (error: any) {
      // console.error(error);
      if (error.response.status === 403) {
        // console.log(error.response.data.message);
        messageApi.open({
          type: "error",
          content: error.response.data.message,
        });
      }
      setLoading(false);
      return false;
    }
  }
  function createUser() {}

  const value: any = {
    user,
    token,
    login,
    loading,
    contextHolder,
    setToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
