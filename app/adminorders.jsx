import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "../contexts/userContext";

// const BASE_URL = "http://172.21.112.206:5000";
const BASE_URL = "https://dk-seed-store-backend-1.onrender.com";

export default function AdminOrders() {
  const router = useRouter();
  const { user, token } = useUser();
  const isAdmin = user?.role === "admin" || user?.email === "admin@gmail.com";

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAdminTools, setShowAdminTools] = useState(false);

  const fetchOrders = async () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${BASE_URL}/api/orders`, { headers });
      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Error", data.message || "Failed to load orders");
        setOrders([]);
      } else {
        const arr = Array.isArray(data) ? data : data.orders ? data.orders : [];
        setOrders(arr);
      }
    } catch (err) {
      Alert.alert("Error", "Could not fetch orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [isAdmin, token]),
  );

  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={{ fontSize: 18, color: "red" }}>
          Access Denied — Admin Only
        </Text>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#22543d" />
          <Text style={styles.loadingText}>Loading orders…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#22543d" />
        </TouchableOpacity>

        <Text style={styles.title}>Admin Panel — Orders</Text>
      </View>

      {/*COLLAPSIBLE ADMIN MANAGEMENT */}
      <TouchableOpacity
        style={styles.sectionToggle}
        onPress={() => setShowAdminTools((prev) => !prev)}
      >
        <Text style={styles.sectionToggleText}>
          {showAdminTools ? "▼ Admin Management" : "▶ Admin Management"}
        </Text>
      </TouchableOpacity>

      {showAdminTools && (
        <View style={styles.adminToolsBox}>
          <TouchableOpacity
            style={styles.manageBtn}
            onPress={() => router.push("/adminproducts")}
          >
            <Text style={styles.manageText}>Manage Products</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.manageBtn}
            onPress={() => router.push("/adminfaqs")}
          >
            <Text style={styles.manageText}>Manage FAQs</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.manageBtn}
            onPress={() => router.push("/adminbanners")}
          >
            <Text style={styles.manageText}>Manage Banners</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.manageBtn}
            onPress={() => router.push("/adminsizes")}
          >
            <Text style={styles.manageText}>Manage Sizes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.manageBtn}
            onPress={() => router.push("/admincategorysections")}
          >
            <Text style={styles.manageText}>Manage Category Sections</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.manageBtn}
            onPress={() => router.push("/admincategories")}
          >
            <Text style={styles.manageText}>Manage Categories</Text>
          </TouchableOpacity>
        </View>
      )}
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {orders.length === 0 ? (
          <View style={styles.centerBox}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptySub}>
              Orders will appear here once users start buying
            </Text>
          </View>
        ) : (
          orders.map((order) => (
            <View key={order._id} style={styles.orderCard}>
              <Text style={styles.bold}>Order ID: {order._id.slice(-6)}</Text>
              <Text>Status: {order.status}</Text>
              <Text>Total: ₹{order.totalAmount}</Text>

              {/*ORDER ITEMS */}
              <View style={{ marginTop: 6 }}>
                <Text style={{ fontWeight: "700", color: "#22543d" }}>
                  Items ({order.products?.length}):
                </Text>

                {order.products?.map((item) => (
                  <Text key={item._id} style={{ fontSize: 13 }}>
                    • {item.product?.name} ({item.size}) × {item.quantity}
                  </Text>
                ))}
              </View>

              <TouchableOpacity
                style={styles.btn}
                onPress={() =>
                  router.push({
                    pathname: "/adminorderdetails",
                    params: { id: order._id },
                  })
                }
              >
                <Text style={styles.btnText}>Manage Order</Text>
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
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { paddingBottom: 10 },
  title: { fontSize: 22, fontWeight: "700", color: "#22543d" },
  orderCard: {
    backgroundColor: "#fff",
    marginVertical: 10,
    padding: 15,
    borderRadius: 12,
  },
  bold: { fontWeight: "700" },
  btn: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#22543d",
    borderRadius: 10,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "700" },

  manageProductsBtn: {
    backgroundColor: "#1b4332",
    padding: 14,
    borderRadius: 12,
    marginVertical: 12,
    alignItems: "center",
  },

  manageProductsText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  centerBox: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
    paddingHorizontal: 20,
  },

  loadingText: {
    marginTop: 10,
    color: "#22543d",
    fontWeight: "600",
  },

  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#22543d",
    marginBottom: 6,
  },

  emptySub: {
    fontSize: 14,
    color: "#40916c",
    textAlign: "center",
  },
  manageBtn: {
    backgroundColor: "#1b4332",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginVertical: 12,
    marginBottom: 12,
  },

  manageText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 5,
    paddingVertical: 12,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#22543d",
  },

  sectionToggle: {
    backgroundColor: "#d8f3dc",
    padding: 14,
    borderRadius: 12,
    marginVertical: 12,
  },

  sectionToggleText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#22543d",
  },

  adminToolsBox: {
    backgroundColor: "#f1faee",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
});
