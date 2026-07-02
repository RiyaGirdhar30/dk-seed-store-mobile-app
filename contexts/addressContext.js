import React, { createContext, useContext, useEffect, useState } from "react";
import { useUser } from "../contexts/userContext";

const AddressContext = createContext();

const BASE_URL = "http://172.21.112.206:5000";

export const AddressProvider = ({ children }) => {
  const { token } = useUser();

  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(false);

  //FETCH ADDRESS (AUTH BASED)
  const fetchAddress = async () => {
    if (!token) {
      setAddress(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${BASE_URL}/api/address`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setAddress(data.address || null);
    } catch (err) {
      console.log("Fetch address error:", err);
      setAddress(null);
    } finally {
      setLoading(false);
    }
  };

  //SAVE / UPDATE ADDRESS
  const updateAddress = async (addressData) => {
    if (!token) {
      alert("Login required");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/address`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(addressData),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to save address");
        return;
      }

      //ONLY update AddressContext
      setAddress(data.address);
    } catch (err) {
      console.log("Save address error:", err);
      alert("Something went wrong");
    }
  };

  //AUTO FETCH WHEN TOKEN CHANGES
  useEffect(() => {
    fetchAddress();
  }, [token]);

  return (
    <AddressContext.Provider
      value={{
        address,
        updateAddress,
        fetchAddress,
        loading,
      }}
    >
      {children}
    </AddressContext.Provider>
  );
};

export const useAddress = () => useContext(AddressContext);
