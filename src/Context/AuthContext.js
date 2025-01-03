import React, { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import api from "../api";
import CryptoJS from "crypto-js";

const AuthContext = createContext();
const SECRET_KEY = "your-secret-key-2024"; // Idealmente, isso deveria vir das variáveis de ambiente

const encryptData = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
};

const decryptData = (encryptedData) => {
  if (!encryptedData) return null;
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch (error) {
    console.error("Error decrypting data:", error);
    return null;
  }
};

export function AuthProvider({ children }) {
  const [authData, setAuthData] = useState(() => {
    const token = Cookies.get("token");
    const encryptedData = Cookies.get("userData");
    const userData = decryptData(encryptedData);

    return {
      token: token || null,
      id: userData?.id || null,
      role: userData?.role || null,
      name: userData?.name || null,
      email: userData?.email || null,
      phone: userData?.phone || null,
      image: userData?.image || null,
      isLoaded: true,
    };
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = Cookies.get("token");
    if (token && (!authData.id || !authData.name)) {
      console.log("Token found but no user data, fetching details...");
      fetchUserDetails(token);
    }
  }, []); // Executa apenas na montagem

  const saveUserData = (userData) => {
    const { token, ...rest } = userData;
    console.log("Saving user data:", { token, userData: rest });
    Cookies.set("token", token, { expires: 1 });
    Cookies.set("userData", encryptData(rest), { expires: 1 });

    setAuthData({
      token,
      id: rest.id || rest._id,
      role: rest.role,
      name: rest.name,
      email: rest.email,
      phone: rest.phone,
      image: rest.image,
      isLoaded: true,
    });
  };

  const clearUserData = () => {
    Cookies.remove("token");
    Cookies.remove("userData");
  };

  const fetchUserDetails = async (token) => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      console.log("Fetching user details with token:", token);
      const response = await api.get("/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("User details response:", response.data);
      const userData = {
        token,
        ...response.data,
        isLoaded: true,
      };
      setAuthData(userData);
      saveUserData(userData);
      return true;
    } catch (error) {
      console.error("Error fetching user details:", error.response || error);
      clearUserData();
      setAuthData({
        token: null,
        id: null,
        role: null,
        name: null,
        email: null,
        phone: null,
        image: null,
        isLoaded: true,
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post("/users/login", { email, password });
      const { token } = response.data;
      const success = await fetchUserDetails(token);
      return success;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await api.post("/users/register", userData);
      const { token } = response.data;
      const success = await fetchUserDetails(token);
      return success;
    } catch (error) {
      console.error("Register error:", error);
      return false;
    }
  };

  const logout = () => {
    clearUserData();
    setAuthData({
      token: null,
      id: null,
      role: null,
      name: null,
      email: null,
      phone: null,
      image: null,
      isLoaded: true,
    });
  };

  return (
    <AuthContext.Provider
      value={{ authData, login, register, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
