import React, { createContext, useContext, useEffect, useState } from "react";
import { useUser } from "./userContext";

const WishlistContext = createContext();
const BASE_URL = "http://172.21.112.206:5000";

export const WishlistProvider = ({ children }) => {
  const { token } = useUser();
  const [wishlist, setWishlist] = useState([]);

  // LOAD WISHLIST
  const loadWishlist = async () => {
    try {
      if (!token) {
        setWishlist([]);
        return;
      }

      const res = await fetch(`${BASE_URL}/api/wishlist`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      const formatted = (data.products || []).map((product) => ({
        id: product._id,
        productId: product._id,
        name: product.name,
        price: product.price,
        img: { uri: product.image },
      }));

      setWishlist(formatted);
    } catch (err) {
      console.log("Load Wishlist Error:", err);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, [token]);

  // ADD TO WISHLIST
  const addToWishlist = async (item) => {
    try {
      if (!token) return;

      await fetch(`${BASE_URL}/api/wishlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: item.id,
        }),
      });

      loadWishlist();
    } catch (err) {
      console.log("Add Wishlist Error:", err);
    }
  };

  // REMOVE FROM WISHLIST
  const removeFromWishlist = async (productId) => {
    try {
      if (!token) return;

      await fetch(`${BASE_URL}/api/wishlist/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      loadWishlist();
    } catch (err) {
      console.log("Remove Wishlist Error:", err);
    }
  };

  return (
    <WishlistContext.Provider
      value={{ wishlist, addToWishlist, removeFromWishlist, loadWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
