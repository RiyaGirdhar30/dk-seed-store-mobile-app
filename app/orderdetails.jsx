import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
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

export default function OrderDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);

  const { user } = useUser();

  // Fetch single order
  const fetchOrderDetails = async () => {
    try {
      const res = await fetch(`http://172.21.112.206:5000/api/orders/${id}`);

      const data = await res.json();

      if (!res.ok) {
        console.log("ORDER ERROR:", data);
        setOrder(null);
      } else {
        setOrder(data);
      }
      setLoading(false);
    } catch (err) {
      console.log("Order Details Error:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#1b4332" />
          <Text style={styles.loadingText}>Loading Order...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={{ fontSize: 18 }}>Order not found</Text>
      </SafeAreaView>
    );
  }

  // CANCEL ORDER
  const cancelThisOrder = async () => {
    if (!order) return;

    if (["Shipped", "Out for Delivery", "Delivered"].includes(order.status)) {
      Alert.alert("Cannot Cancel", "This order can no longer be cancelled.");
      return;
    }

    setCancelLoading(true);

    try {
      const res = await fetch(
        `http://172.21.112.206:5000/api/orders/cancel/${order._id}`,
        { method: "PUT" },
      );

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Error", data.message || "Cancellation failed.");
      } else {
        Alert.alert("Success", "Order cancelled successfully!");
        fetchOrderDetails();
      }
    } catch (err) {
      console.log("Cancel error:", err);
    }

    setCancelLoading(false);
  };

  const isCancelled = order.status === "Cancelled"; //NEW

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={24} color="#22543d" />
          </TouchableOpacity>
          <Text style={styles.title}>Order Details</Text>
        </View>

        {/* ORDER BOX */}
        <View style={styles.card}>
          <Text style={styles.bold}>Order ID: {order._id}</Text>
          <Text>Status: {order.status}</Text>
          <Text>Total Amount: ₹{order.totalAmount}</Text>
          <Text>Payment: {order.paymentMethod}</Text>

          <View style={{ marginTop: 6 }}>
            <Text style={styles.bold}>Delivery Address</Text>
            <Text>{order.address.name}</Text>
            <Text>{order.address.address}</Text>
            <Text>
              {order.address.city} - {order.address.pincode}
            </Text>
            <Text>📞 {order.address.phone}</Text>
          </View>
          {/* new */}

          <Text>Placed On: {new Date(order.createdAt).toDateString()}</Text>
        </View>

        {/*CANCELLATION INFO (NEW) */}
        {order.status === "Cancelled" && (
          <View style={styles.cancelInfoBox}>
            <Text style={styles.cancelledTitle}>❌ Order Cancelled</Text>

            <Text style={styles.cancelledText}>
              Cancelled by: {order.cancelledBy === "admin" ? "Seller" : "You"}
            </Text>

            {order.cancelledAt && (
              <Text style={styles.cancelledText}>
                Cancelled on: {new Date(order.cancelledAt).toDateString()}
              </Text>
            )}
          </View>
        )}

        {/* CANCEL BUTTON */}
        {!["Shipped", "Out for Delivery", "Delivered", "Cancelled"].includes(
          order.status,
        ) && (
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={cancelThisOrder}
            disabled={cancelLoading}
          >
            <Text style={styles.cancelTxt}>
              {cancelLoading ? "Cancelling..." : "Cancel Order"}
            </Text>
          </TouchableOpacity>
        )}

        {/* NEW AMAZON-STYLE TRACKING UI */}
        {!isCancelled && (
          <View style={styles.trackContainer}>
            {/* ORDER PLACED */}
            <View style={styles.stepRow}>
              <View
                style={[
                  styles.stepDot,
                  order.status !== "Pending" && styles.activeDot,
                ]}
              />
              <Text style={styles.stepText}>Order Placed</Text>
            </View>

            <View
              style={[
                styles.stepLine,
                order.status !== "Pending" && styles.activeLine,
              ]}
            />

            {/* SHIPPED */}
            <View style={styles.stepRow}>
              <View
                style={[
                  styles.stepDot,
                  ["Shipped", "Out for Delivery", "Delivered"].includes(
                    order.status,
                  ) && styles.activeDot,
                ]}
              />
              <Text style={styles.stepText}>Shipped</Text>
            </View>

            <View
              style={[
                styles.stepLine,
                ["Shipped", "Out for Delivery", "Delivered"].includes(
                  order.status,
                ) && styles.activeLine,
              ]}
            />

            {/* OUT FOR DELIVERY */}
            <View style={styles.stepRow}>
              <View
                style={[
                  styles.stepDot,
                  ["Out for Delivery", "Delivered"].includes(order.status) &&
                    styles.activeDot,
                ]}
              />
              <Text style={styles.stepText}>Out for Delivery</Text>
            </View>

            <View
              style={[
                styles.stepLine,
                order.status === "Delivered" && styles.activeLine,
              ]}
            />

            {/* DELIVERED */}
            <View style={styles.stepRow}>
              <View
                style={[
                  styles.stepDot,
                  order.status === "Delivered" && styles.activeDot,
                ]}
              />
              <Text style={styles.stepText}>Delivered</Text>
            </View>
          </View>
        )}

        {/* PRODUCTS LIST */}
        <Text style={styles.section}>Items in this order</Text>

        {order.products.map((item) => (
          <View key={item._id} style={styles.productRow}>
            <Image
              source={{ uri: item.product?.image }}
              style={styles.productImg}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.productName}>{item.product?.name}</Text>
              <Text>Size: {item.size}</Text>
              <Text>Qty: {item.quantity}</Text>
            </View>
            <Text style={styles.price}>
              ₹{item.product?.price * (item.size === "Half KG" ? 0.5 : 1)}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#eafbe7",
  },

  container: {
    padding: 14,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  backBtn: {
    padding: 10,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#22543d",
    marginLeft: 10,
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    elevation: 2,
    marginBottom: 15,
  },

  bold: {
    fontWeight: "700",
    marginBottom: 4,
  },

  section: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    color: "#1b4332",
  },

  productRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
    alignItems: "center",
  },

  productImg: {
    width: 60,
    height: 60,
    marginRight: 10,
    borderRadius: 8,
  },

  productName: {
    fontWeight: "700",
    fontSize: 16,
  },

  price: {
    fontWeight: "700",
    fontSize: 16,
    color: "#1b4332",
  },

  cancelBtn: {
    backgroundColor: "#ff4d4d",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },

  cancelTxt: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  /* ⭐ AMAZON TRACKING UI STYLES */
  trackContainer: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 12,
    elevation: 2,
    marginBottom: 18,
  },

  stepRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  stepDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#ccc",
  },

  activeDot: {
    backgroundColor: "#1b4332",
  },

  stepText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: "600",
    color: "#22543d",
  },

  stepLine: {
    width: 3,
    height: 28,
    backgroundColor: "#ccc",
    marginLeft: 7,
    marginVertical: 2,
  },

  activeLine: {
    backgroundColor: "#1b4332",
  },

  cancelledBox: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 15,
  },

  cancelledTitle: {
    color: "#d00000",
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 4,
  },

  cancelledText: {
    color: "#555",
    fontSize: 14,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "600",
    color: "#22543d",
  },
  cancelInfoBox: {
    marginTop: 10,
    padding: 12,
    backgroundColor: "#fdecea",
    borderRadius: 10,
  },

  cancelledTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#b00020",
    marginBottom: 4,
  },

  cancelledText: {
    fontSize: 14,
    color: "#333",
  },
});
