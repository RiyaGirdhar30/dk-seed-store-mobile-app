import React, { createContext, useContext, useEffect, useState } from "react";
import { useUser } from "./userContext";

const BagContext = createContext();
// const BASE_URL = "http://172.21.112.206:5000";
const BASE_URL = "https://dk-seed-store-backend-1.onrender.com";

export const BagProvider = ({ children }) => {
  const { token, user } = useUser();
  const [bag, setBag] = useState([]);
  const [sizes, setSizes] = useState([]);

  useEffect(() => {
    fetch(`${BASE_URL}/api/sizes`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setSizes(data);
      })
      .catch((err) => console.log("Size fetch error:", err));
  }, []);

  useEffect(() => {
    if (token && sizes.length > 0) {
      loadCart();
    }
  }, [token, sizes]);

  // LOAD CART
  const loadCart = async () => {
    try {
      if (!token) {
        setBag([]);
        return;
      }

      const res = await fetch(`${BASE_URL}/api/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!data?.products || data.products.length === 0) {
        setBag([]);
        return;
      }

      const formatted = data.products
        .filter((item) => item.product)
        .map((item) => {
          const sizeObj = sizes.find((s) => s.label === item.size);
          const multiplier = sizeObj ? sizeObj.multiplier : 1;

          return {
            cartItemId: item._id,
            id: item.product._id,
            name: item.product.name,
            basePrice: item.product.price,
            multiplier,
            img: { uri: item.product.image },
            qty: item.quantity,
            size: item.size,
          };
        });

      setBag(formatted);
    } catch (err) {
      console.log("Load Cart Error:", err);
    }
  };

  // ADD TO CART
  const addToBag = async (item) => {
    try {
      await fetch(`${BASE_URL}/api/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product: item.id,
          quantity: item.qty || 1,
          size: item.size || "Full KG",
        }),
      });

      await loadCart();
      return true;
    } catch (err) {
      console.log("Add to Cart Error:", err);
      return false;
    }
  };

  // INCREASE QTY
  const increaseQty = async (id, size) => {
    await fetch(`${BASE_URL}/api/cart/increase`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ product: id, size }),
    });
    loadCart();
  };

  // DECREASE QTY
  const decreaseQty = async (id, size) => {
    await fetch(`${BASE_URL}/api/cart/decrease`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ product: id, size }),
    });
    loadCart();
  };

  // REMOVE ITEM
  const removeFromBag = async (id, size) => {
    await fetch(`${BASE_URL}/api/cart/remove`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ product: id, size }),
    });
    loadCart();
  };

  // CLEAR CART
  const clearBag = async () => {
    if (!token) return;

    await fetch(`${BASE_URL}/api/cart`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setBag([]);
  };

  return (
    <BagContext.Provider
      value={{
        bag,
        addToBag,
        removeFromBag,
        increaseQty,
        decreaseQty,
        clearBag,
        loadCart,
      }}
    >
      {children}
    </BagContext.Provider>
  );
};

export const useBag = () => useContext(BagContext);
