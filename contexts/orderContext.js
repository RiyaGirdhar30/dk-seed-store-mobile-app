import React, { createContext, useContext, useEffect, useState } from "react";
import { useUser } from "./userContext";

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const { user, token, loading: userLoading } = useUser();
  const [orders, setOrders] = useState([]);

  // Fetch orders of logged-in user
  const fetchOrders = async () => {
    if (!user || !user.id) return; // user not loaded yet

    try {
      const res = await fetch(
        `https://dk-seed-store-backend-1.onrender.com/api/orders/user/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();
      setOrders(data.reverse());
    } catch (error) {
      console.log("Order Fetch Error:", error);
    }
  };

  // Load orders when user changes (login/logout)
  useEffect(() => {
    if (!userLoading && user?.id) {
      fetchOrders();
    }
  }, [user, userLoading]);

  return (
    <OrderContext.Provider value={{ orders, fetchOrders }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => useContext(OrderContext);
