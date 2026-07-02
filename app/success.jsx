import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useBag } from "../contexts/bagContext";

export default function Success() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const scaleAnim = useRef(new Animated.Value(0)).current;

  const { clearBag } = useBag();

  const orderId = params.orderId; 

  // When screen loads
  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      bounciness: 15,
    }).start();

    //CLEAR BAG ONLY
    clearBag();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <View style={styles.circle}>
          <Ionicons name="checkmark" size={60} color="white" />
        </View>
      </Animated.View>

      <Text style={styles.title}>Order Placed Successfully!</Text>

      <Text style={styles.subtitle}>
        Thank you for shopping with DK Seed Store 🌱{"\n"}
        Your items will be delivered soon.
      </Text>

      {orderId && (
        <Text style={styles.orderIdText}>Order ID: {orderId}</Text>
      )}

      <TouchableOpacity
        style={styles.btn}
        onPress={() => router.replace("/(tabs)/home")}
      >
        <Text style={styles.btnText}>Continue Shopping</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.btn, { backgroundColor: "#555" }]}
        onPress={() => router.replace("/myorders")}
      >
        <Text style={styles.btnText}>View My Orders</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eafbe7",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  circle: {
    width: 120,
    height: 120,
    backgroundColor: "#1b4332",
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#22543d",
    marginTop: 20,
  },

  subtitle: {
    textAlign: "center",
    color: "#444",
    marginVertical: 10,
    fontSize: 15,
    lineHeight: 22,
    width: "80%",
  },

  orderIdText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "700",
    color: "#1b4332",
  },

  btn: {
    backgroundColor: "#1b4332",
    paddingVertical: 13,
    borderRadius: 15,
    width: "80%",
    alignItems: "center",
    marginTop: 20,
  },

  btnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});
