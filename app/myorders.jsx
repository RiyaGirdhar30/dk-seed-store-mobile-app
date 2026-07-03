import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "../contexts/userContext";

export default function MyOrders() {
  const router = useRouter();
  const { user } = useUser();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const USER_ID = user?._id || user?.id || "693318d1e100ef27146bebc4";
  // const BASE_URL = "http://172.21.112.206:5000";
  const BASE_URL = "https://dk-seed-store-backend-1.onrender.com";

  // Load Orders from backend
  const fetchOrders = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/orders/user/${USER_ID}`);
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.log("Orders fetch error:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#1b4332" />
          <Text style={styles.loadingText}>Loading Orders...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#22543d" />
        </TouchableOpacity>
        <Text style={styles.title}>My Orders</Text>
      </View>

      <ScrollView style={{ marginTop: 10 }}>
        {orders.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No orders yet</Text>
          </View>
        ) : (
          orders.map((order) => (
            <View key={order._id} style={styles.orderCard}>
              <View style={styles.row}>
                <Text style={styles.orderId}>Order ID:</Text>
                <Text style={styles.bold}>{order._id.slice(-6)}</Text>
              </View>

              <View style={styles.row}>
                <Text>Status:</Text>
                <Text style={styles.bold}>{order.status}</Text>
              </View>

              <View style={styles.row}>
                <Text>Total Amount:</Text>
                <Text style={styles.bold}>₹{order.totalAmount}</Text>
              </View>

              <View style={styles.row}>
                <Text>Items:</Text>
                <Text style={styles.bold}>{order.products.length}</Text>
              </View>

              <TouchableOpacity
                style={styles.detailsBtn}
                onPress={() =>
                  router.push({
                    pathname: "/orderdetails",
                    params: { id: order._id },
                  })
                }
              >
                <Text style={styles.detailsTxt}>View Details</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
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
    padding: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#22543d",
    marginLeft: 10,
  },
  orderCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 14,
    marginBottom: 12,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  bold: {
    fontWeight: "700",
    color: "#1b4332",
  },
  orderId: {
    fontWeight: "700",
    color: "#333",
  },
  detailsBtn: {
    marginTop: 10,
    backgroundColor: "#1b4332",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  detailsTxt: {
    color: "#fff",
    fontWeight: "700",
  },
  emptyBox: {
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: "#22543d",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "600",
    color: "#22543d",
  },
});
