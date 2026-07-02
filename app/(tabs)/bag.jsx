import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useBag } from "../../contexts/bagContext";
import { useFocusEffect } from "@react-navigation/native";

import { ActivityIndicator } from "react-native";

import { Animated } from "react-native";
import { useRef } from "react";


export default function Bag() {
  const router = useRouter();
  const [status, setStatus] = useState("loading"); //B
  const { bag, loadCart, increaseQty, decreaseQty, removeFromBag } = useBag();
  const params = useLocalSearchParams();

  const fadeAnim = useRef(new Animated.Value(0)).current;

  /*LOAD CART ON SCREEN FOCUS*/

  useFocusEffect(
  React.useCallback(() => {
    setStatus("loading");

    Promise.resolve(loadCart()).finally(() => {
      setStatus("success");
    });
  }, [])
); 

useEffect(() => {
  if (status === "success") {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500, 
      useNativeDriver: true,
    }).start();
  }
}, [status]);

  /*SELECTION STATE (SAFE) */
  const [selected, setSelected] = useState({});

  // Initialize selection when bag changes
  useEffect(() => {
    const next = {};
    bag.forEach((item) => {
      next[item.cartItemId] = selected[item.cartItemId] ?? true;
    });
    setSelected(next);
  }, [bag]);

  const toggleSelect = (cartItemId) => {
    setSelected((prev) => ({
      ...prev,
      [cartItemId]: !prev[cartItemId],
    }));
  };

  const selectAll = () => {
    const all = {};
    bag.forEach((item) => {
      all[item.cartItemId] = true;
    });
    setSelected(all);
  };

  const unselectAll = () => {
    const none = {};
    bag.forEach((item) => {
      none[item.cartItemId] = false;
    });
    setSelected(none);
  };

  /*CALCULATIONS */
  const selectedItems = bag.filter(
    (item) => selected[item.cartItemId]
  );

  const subtotal = selectedItems.reduce(
    (sum, item) => sum + item.basePrice*item.multiplier*item.qty,
    0
  );

  const shipping = subtotal > 300 ? 0 : subtotal > 0 ? 40 : 0;
  const discount = subtotal > 500 ? 50 : 0;
  const total = subtotal + shipping - discount;

 if (status === "loading") {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.loaderBox}>
        <ActivityIndicator size="large" color="#22543d" />
        <Text style={styles.loaderText}>Loading your bag…</Text>
      </View>
    </SafeAreaView>
  );
}

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (params.returnTo === "product") {
              router.push({
                pathname: "/productDetails",
                params: {
                  id: params.id,
                  name: params.name,
                  price: params.price,
                  img: params.img,
                },
              });
            } else if (params.returnTo === "profile") {
              router.replace("/(tabs)/profile");
            } else {
              router.push("/(tabs)/home");
            }
          }}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color="#030504ff" />
        </TouchableOpacity>

        <Text style={styles.pageTitle}>Your Bag</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* SELECT CONTROLS */}
      {bag.length > 0 && (
        <View style={styles.selectRow}>
          <TouchableOpacity onPress={selectAll} style={styles.selectAllBtn}>
            <Text style={styles.selectText}>Select All</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={unselectAll} style={styles.unselectAllBtn}>
            <Text style={styles.selectText}>Unselect All</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Products list */}
       <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <ScrollView style={{ marginTop: 10 }}>
        {bag.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>Your bag is empty</Text>
          </View>
        ) : (
          bag.map((item) => (
            <View key={item.cartItemId} style={styles.productCard}>
              {/* Checkbox */}
              <TouchableOpacity
                onPress={() => toggleSelect(item.cartItemId)}
                style={styles.checkbox}
              >
                <Ionicons
                  name={
                    selected[item.cartItemId]
                      ? "checkbox-outline"
                      : "square-outline"
                  }
                  size={24}
                  color="#22543d"
                />
              </TouchableOpacity>

              <Image source={item.img} style={styles.productImg} />

              <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productPrice}>₹{item.basePrice*item.multiplier}</Text>
                <Text style={styles.productSize}>Size: {item.size}</Text>

                <View style={styles.qtyRow}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => decreaseQty(item.id, item.size)}
                  >
                    <Text style={styles.qtyText}>–</Text>
                  </TouchableOpacity>

                  <Text style={styles.qtyNum}>{item.qty}</Text>

                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => increaseQty(item.id, item.size)}
                  >
                    <Text style={styles.qtyText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => removeFromBag(item.id, item.size)}
              >
                <Ionicons name="trash-outline" size={24} color="red" />
              </TouchableOpacity>
            </View>
          ))
        )}

        {/* Price Section */}
        {selectedItems.length > 0 && (
          <View style={styles.priceBox}>
            <Text style={styles.priceTitle}>Price Details</Text>

            <View style={styles.priceRow}>
              <Text>Subtotal</Text>
              <Text>₹{subtotal}</Text>
            </View>

            <View style={styles.priceRow}>
              <Text>Shipping</Text>
              <Text>{shipping === 0 ? "Free" : `₹${shipping}`}</Text>
            </View>

            <View style={styles.priceRow}>
              <Text>Discount</Text>
              <Text>-₹{discount}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.priceRow}>
              <Text style={styles.totalText}>Total</Text>
              <Text style={styles.totalAmount}>₹{total}</Text>
            </View>
          </View>
        )}
      </ScrollView>
      </Animated.View>

      {/* Checkout */}
    
       <View style={styles.checkoutContainer}>
  <TouchableOpacity
    style={[
      styles.checkoutBtn,
      selectedItems.length === 0 && { backgroundColor: "#9ca3af" } 
    ]}
    activeOpacity={selectedItems.length === 0 ? 1 : 0.7}
    onPress={() => {
      if (selectedItems.length === 0) {
        alert("Please select at least one item to continue");
        return;
      }
     router.push({
    pathname: "/checkout",
    params: {
      items: JSON.stringify(selectedItems),
    },
  });
    }}
  >
    <Text style={styles.checkoutTxt}>
      Proceed to Checkout
    </Text>
  </TouchableOpacity>
</View>

    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#eafbe7",
    padding: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  backBtn: {
    width: 40,
    height: 40,
    backgroundColor: "#fff",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    elevation: 3,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#22543d",
    flex: 1,
  },
  selectRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  selectAllBtn: {
    padding: 8,
    backgroundColor: "#d3f2d1",
    borderRadius: 10,
  },
  unselectAllBtn: {
    padding: 8,
    backgroundColor: "#f2d1d1",
    borderRadius: 10,
  },
  selectText: {
    fontWeight: "700",
    color: "#22543d",
  },

  productCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
  },
  checkbox: {
    marginRight: 10,
  },
  productImg: { width: 70, height: 70, borderRadius: 10 },

  productInfo: { flex: 1, marginLeft: 12 },
  productName: { fontSize: 16, fontWeight: "700", color: "#22543d" },
  productPrice: { marginTop: 3, color: "#4a7c59", fontWeight: "600" },
  productSize: { marginTop: 2, fontSize: 13, color: "#444" },

  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 7,
    borderWidth: 1.2,
    borderColor: "#22543d",
    justifyContent: "center",
    alignItems: "center",
  },
  qtyText: { fontSize: 18, fontWeight: "600", color: "#22543d" },
  qtyNum: { marginHorizontal: 10, fontSize: 16, fontWeight: "600" },

  priceBox: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginTop: 15,
    elevation: 2,
  },

  priceTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#22543d",
    marginBottom: 10,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  priceLabel: { color: "#444", fontSize: 15 },
  priceValue: { color: "#22543d", fontSize: 15, fontWeight: "600" },

  divider: {
    height: 1,
    backgroundColor: "#dcdcdc",
    marginVertical: 8,
  },

  totalText: { fontSize: 17, fontWeight: "700", color: "#1b4332" },
  totalAmount: { fontSize: 18, fontWeight: "800", color: "#1b4332" },

  checkoutContainer: {
    position: "absolute",
    bottom: 3,
    left: 14,
    right: 14,
  },
  checkoutBtn: {
    backgroundColor: "#1b4332",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    elevation: 5,
  },
  checkoutTxt: { color: "#fff", fontWeight: "700", fontSize: 16 },

  emptyBox: { alignItems: "center", marginTop: 60 },
  emptyText: { fontSize: 18, color: "#22543d" },
  loaderBox: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
},

loaderText: {
  marginTop: 12,
  fontSize: 16,
  fontWeight: "600",
  color: "#22543d",
},
});
