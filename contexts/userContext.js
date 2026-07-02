import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext();

const USER_KEY = "DK_USER";
const TOKEN_KEY = "DK_TOKEN";

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load saved user on app start
  useEffect(() => {
    (async () => {
      try {
        const rawUser = await AsyncStorage.getItem(USER_KEY);
        const rawToken = await AsyncStorage.getItem(TOKEN_KEY);

        if (rawUser) setUser(JSON.parse(rawUser));
        if (rawToken) setToken(rawToken);
      } catch (e) {
        console.log("User load error:", e);
      }
      setLoading(false);
    })();
  }, []);

  // REFRESH USER FROM BACKEND
  useEffect(() => {
    const refreshUser = async () => {
      if (!token) return;

      try {
        const res = await fetch("http://172.21.112.206:5000/api/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const freshUser = await res.json();

        setUser(freshUser);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(freshUser));
      } catch (e) {
        console.log("User refresh failed:", e);
      }
    };

    refreshUser();
  }, [token]);

  // Save user/token whenever they change
  useEffect(() => {
    (async () => {
      try {
        if (user) await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
        else await AsyncStorage.removeItem(USER_KEY);

        if (token) await AsyncStorage.setItem(TOKEN_KEY, token);
        else await AsyncStorage.removeItem(TOKEN_KEY);
      } catch (e) {
        console.log("User save error:", e);
      }
    })();
  }, [user, token]);

  // LOGIN
  const login = async (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);

    await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
    await AsyncStorage.setItem(TOKEN_KEY, jwtToken);
  };

  // LOGOUT
  const logout = async () => {
    setUser(null);
    setToken(null);

    await AsyncStorage.removeItem("DK_USER"); //USER_KEY
    await AsyncStorage.removeItem("DK_TOKEN"); //TOKEN_KEY
  };

  //UPDATE PROFILE(used by Edit Profile screen)
  const updateProfile = async (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);

    await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
  };

  //UPDATE PROFILE PHOTO IN CONTEXT
  const updateProfilePhoto = async (imageUrl) => {
    const updatedUser = { ...user, profileImage: imageUrl };
    setUser(updatedUser);
    await AsyncStorage.setItem("DK_USER", JSON.stringify(updatedUser));
  };

  return (
    <UserContext.Provider
      value={{
        user,
        token,
        setUser,
        login,
        logout,
        updateProfile,
        updateProfilePhoto,
        loading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
