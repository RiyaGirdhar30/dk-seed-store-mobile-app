import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
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

const BASE_URL = "http://172.21.112.206:5000";

export default function AdminOrderDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { token } = useUser();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [markingPaid, setMarkingPaid] = useState(false);

  const [selectedStatus, setSelectedStatus] = useState("");

  const statuses = [
    "Pending",
    "Placed",
    "Shipped",
    "Out for Delivery",
    "Delivered",
    "Cancelled",
  ];

  const fetchOrder = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/orders/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (!res.ok) {
        Alert.alert("Error", data.message || "Could not fetch order");
        setOrder(null);
      } else {
        setOrder(data);
        setSelectedStatus(data.status);
      }
    } catch (err) {
      Alert.alert("Error", "Could not fetch order");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, []);

  const updateStatus = async () => {
    try {
      setUpdatingStatus(true);
      const res = await fetch(`${BASE_URL}/api/orders/status/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ status: selectedStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        Alert.alert("Error", data.message || "Failed to update status");
        return;
      }

      Alert.alert("Success", "Order Status Updated!");
      fetchOrder();
    } catch (err) {
      Alert.alert("Error", "Update failed");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const markPaid = async () => {
    try {
      setMarkingPaid(true);
      const res = await fetch(`${BASE_URL}/api/orders/pay/${id}`, {
        method: "PUT",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      const data = await res.json();
      if (!res.ok)
        return Alert.alert("Error", data.message || "Failed to mark paid");
      Alert.alert("Success", "Order marked as paid");
      fetchOrder();
    } catch (err) {
      Alert.alert("Error", "Failed to mark paid");
    } finally {
      setMarkingPaid(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#22543d" />
          <Text style={styles.loadingText}>Loading order...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.center}>
        <Text>Order not found</Text>
      </SafeAreaView>
    );
  }
  const isCancelled = order.status === "Cancelled";

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={24} color="#22543d" />
          </TouchableOpacity>
          <Text style={styles.title}>Manage Order</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.bold}>Order ID: {order._id}</Text>
          <Text>User: {order.user}</Text>
          <Text>Total: ₹{order.totalAmount}</Text>
          <Text>Status: {order.status}</Text>
        </View>

        {/*CANCELLED MESSAGE by ADMIN */}

        {isCancelled && (
          <View style={styles.cancelledBox}>
            <Text style={styles.cancelledTitle}>❌ Order Cancelled</Text>

            <Text style={styles.cancelledText}>
              Cancelled by: {order.cancelledBy === "admin" ? "Admin" : "User"}
            </Text>

            {order.cancelledAt && (
              <Text style={styles.cancelledText}>
                Cancelled on: {new Date(order.cancelledAt).toDateString()}
              </Text>
            )}

            <Text style={styles.cancelledNote}>
              No further action is required.
            </Text>
          </View>
        )}
        {/* ✅ UPDATE STATUS IF NOT CANCELLED*/}
        {!isCancelled && (
          <View style={styles.card}>
            <Text style={styles.bold}>Update Status:</Text>

            {statuses.map((st) => (
              <TouchableOpacity
                key={st}
                style={[
                  styles.statusBtn,
                  selectedStatus === st && styles.activeStatus,
                ]}
                onPress={() => setSelectedStatus(st)}
              >
                <Text
                  style={{
                    color: selectedStatus === st ? "#fff" : "#22543d",
                    fontWeight: "700",
                  }}
                >
                  {st}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.updateBtn}
              onPress={updateStatus}
              disabled={updatingStatus}
            >
              {updatingStatus ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.updateTxt}>Update Status</Text>
              )}
            </TouchableOpacity>

            {!isCancelled && order.paymentMethod === "COD" && !order.isPaid && (
              <TouchableOpacity
                style={[
                  styles.updateBtn,
                  { backgroundColor: "#2d6a4f", marginTop: 8 },
                ]}
                onPress={markPaid}
                disabled={markingPaid}
              >
                {markingPaid ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.updateTxt}>Mark Paid</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#eafbe7", padding: 14 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  backBtn: { padding: 10, marginRight: 10 },
  title: { fontSize: 22, fontWeight: "700", color: "#22543d" },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  bold: { fontWeight: "700", color: "#22543d", marginBottom: 7 },
  statusBtn: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#22543d",
    marginTop: 8,
  },
  activeStatus: { backgroundColor: "#22543d", borderColor: "#22543d" },
  updateBtn: {
    backgroundColor: "#1b4332",
    padding: 12,
    marginTop: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  updateTxt: { color: "#fff", fontSize: 16, fontWeight: "700" },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "600",
    color: "#22543d",
  },
});
