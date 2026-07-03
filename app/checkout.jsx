import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "../contexts/userContext";

import { useAddress } from "../contexts/addressContext";

import { useBag } from "../contexts/bagContext";

import { useEffect, useRef } from "react";
import { ActivityIndicator, Animated } from "react-native";

export default function Checkout() {
  const router = useRouter();
  const { user, token } = useUser();
  const { clearBag } = useBag();

  const { address, loading: addressLoading } = useAddress();
  const params = useLocalSearchParams();

  const [status, setStatus] = useState("loading");
  // loading | success | error

  const fadeAnim = useRef(new Animated.Value(0)).current; //B

  const [payLoading, setPayLoading] = useState(false);

  /*RECEIVE SELECTED ITEMS SAFELY */
  const selectedItems = useMemo(() => {
    try {
      return params.items ? JSON.parse(params.items) : [];
    } catch {
      return [];
    }
  }, [params.items]);

  useEffect(() => {
    if (selectedItems.length === 0) {
      router.replace("/(tabs)/bag");
    }
  }, [selectedItems]);

  const [paymentMode, setPaymentMode] = useState(null);

  /* CALCULATIONS BASED ONLY ON SELECTED ITEMS */
  const subtotal = selectedItems.reduce(
    (sum, item) => sum + item.basePrice * item.multiplier * item.qty,
    0,
  );

  const shipping = subtotal > 300 ? 0 : subtotal > 0 ? 40 : 0;
  const discount = subtotal > 500 ? 50 : 0;
  const total = subtotal + shipping - discount;

  useEffect(() => {
    const timer = setTimeout(() => {
      setStatus("success");
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (status === "success") {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [status]);

  const handlePayment = async () => {
    if (payLoading) return;

    if (!user?._id && !user?.id) {
      Alert.alert("Login Required");
      return;
    }

    if (!address) {
      Alert.alert("Address Required");
      return;
    }

    if (!paymentMode) {
      Alert.alert("Select Payment Method");
      return;
    }

    if (selectedItems.length === 0) {
      Alert.alert("No Items");
      return;
    }

    try {
      setPayLoading(true);

      const normalizedAddress = {
        name: address.name || user.name,
        phone: address.phone,
        address: address.address || address.city,
        city: address.city,
        pincode: address.pincode,
      };

      if (paymentMode === "COD") {
        Alert.alert(
          "Confirm Order",
          "You will pay cash when the order is delivered.",
          [
            {
              text: "Cancel",
              style: "cancel",
              onPress: () => setPayLoading(false),
            },
            {
              text: "Place Order",
              onPress: async () => {
                try {
                  const res = await fetch(
                    "https://dk-seed-store-backend-1.onrender.com/api/orders",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({
                        products: selectedItems.map((item) => ({
                          product: item.id,
                          quantity: item.qty,
                          size: item.size,
                        })),
                        totalAmount: Number(total),
                        address: normalizedAddress,
                        paymentMethod: "COD",
                        isPaid: false,
                      }),
                    },
                  );

                  const data = await res.json();

                  if (!res.ok) {
                    Alert.alert("Order Failed");
                    return;
                  }

                  clearBag();

                  router.replace({
                    pathname: "/success",
                    params: { orderId: data._id },
                  });
                } catch (err) {
                  Alert.alert("Error", "Something went wrong");
                }
              },
            },
          ],
        );

        return;
      }

      // ONLINE
      router.replace({
        pathname: "/payment",
        params: {
          total,
          items: JSON.stringify(selectedItems),
          address: JSON.stringify(normalizedAddress),
        },
      });
    } catch (err) {
      Alert.alert("Error", "Something went wrong");
    } finally {
      setPayLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loaderBox}>
          <ActivityIndicator size="large" color="#22543d" />
          <Text style={styles.loaderText}>Preparing checkout…</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Address loading (auth-based fetch)
  if (addressLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color="#22543d" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.replace("/(tabs)/bag")}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color="#22543d" />
        </TouchableOpacity>
        <Text style={styles.title}>Checkout</Text>
      </View>

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* ADDRESS */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Delivery Address</Text>

            {address ? (
              <View style={styles.addressBlock}>
                <Text style={styles.addressName}>{address.name}</Text>

                <Text style={styles.addressText}>
                  {address.address || address.addressLine || address.city}
                </Text>

                <Text style={styles.addressText}>
                  {address.city} - {address.pincode}
                </Text>

                <Text style={styles.addressPhone}>📞 {address.phone}</Text>

                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: "/address",
                      params: { from: "checkout" },
                    })
                  }
                >
                  <Text style={styles.changeAddress}>Change Address</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/address",
                    params: { from: "checkout" },
                  })
                }
              >
                <Text style={styles.addAddress}>+ Add Delivery Address</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* ORDER SUMMARY */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Order Summary</Text>

            {selectedItems.map((item) => (
              <View key={item.cartItemId} style={styles.itemRow}>
                <Image source={item.img} style={styles.itemImg} />
                <View style={{ flex: 1 }}>
                  <Text>{item.name}</Text>
                  <Text>Qty: {item.qty}</Text>
                  <Text>Size: {item.size}</Text>
                </View>
                <Text>₹{item.basePrice * item.multiplier * item.qty}</Text>
              </View>
            ))}
          </View>

          {/* BILL */}
          <View style={styles.card}>
            <Text>Subtotal: ₹{subtotal}</Text>
            <Text>Shipping: ₹{shipping}</Text>
            <Text>Discount: -₹{discount}</Text>
            <Text style={{ fontWeight: "bold", marginTop: 5 }}>
              Total: ₹{total}
            </Text>
          </View>

          {/* PAYMENT OPTIONS */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Select Payment Method</Text>

            {["COD", "ONLINE"].map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.paymentOption,
                  paymentMode === mode && styles.activePayment,
                ]}
                onPress={() => setPaymentMode(mode)}
              >
                <Text
                  style={{
                    color: paymentMode === mode ? "#fff" : "#000",
                    fontWeight: "700",
                  }}
                >
                  {mode}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </Animated.View>

      <TouchableOpacity
        style={[styles.payBtn, payLoading && { backgroundColor: "#9ca3af" }]}
        onPress={handlePayment}
        disabled={payLoading}
      >
        <Text style={styles.payTxt}>
          {payLoading
            ? "Processing..."
            : paymentMode === "COD"
              ? "Place Order"
              : "Proceed to Payment"}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#eafbe7", padding: 14 },

  header: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  backBtn: { padding: 10 },
  title: { fontSize: 22, fontWeight: "700", marginLeft: 10 },

  sectionTitle: { fontWeight: "700", fontSize: 16, marginBottom: 6 },
  addressText: { marginTop: 5, color: "#333" },

  itemRow: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  itemImg: { width: 50, height: 50, marginRight: 10, borderRadius: 8 },

  paymentOption: {
    padding: 14,
    backgroundColor: "#ddd",
    marginTop: 10,
    borderRadius: 12,
    alignItems: "center",
  },

  activePayment: { backgroundColor: "#1b4332" },

  payBtn: {
    backgroundColor: "#1b4332",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 10,
  },

  payTxt: { color: "#fff", fontWeight: "700", fontSize: 16 },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    marginTop: 12,
    marginBottom: 16,
    borderRadius: 16,
    borderLeftWidth: 5,
    borderLeftColor: "#1b4332",
    elevation: 2,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1b4332",
    marginBottom: 8,
  },

  addressBlock: {
    paddingLeft: 4,
  },

  addressName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#000",
  },

  addressText: {
    fontSize: 14,
    color: "#444",
    marginTop: 2,
  },

  addressPhone: {
    fontSize: 14,
    color: "#444",
    marginTop: 6,
  },

  changeAddress: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "700",
    color: "#1b4332",
  },

  addAddress: {
    fontSize: 14,
    fontWeight: "700",
    color: "#b00020",
  },
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
