import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "../contexts/userContext";

const BASE_URL = "http://172.21.112.206:5000";

export default function Notifications() {
  const router = useRouter();
  const { token } = useUser();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  //FETCH NOTIFICATIONS
  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      console.log("Fetch notifications error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleNotificationPress = async (id) => {
    try {
      await fetch(`${BASE_URL}/api/notifications/${id}/read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      //UPDATE UI STATE (THIS IS THE FIX)
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
      );
    } catch (err) {
      console.log("Mark as read failed:", err);
    }
  };

  const markAllRead = async () => {
    try {
      await fetch(`${BASE_URL}/api/notifications/read-all`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      //Update UI instantly
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.log("Mark all read failed:", err);
    }
  };

  const clearAll = async () => {
    try {
      await fetch(`${BASE_URL}/api/notifications/clear`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNotifications([]);
    } catch (err) {
      console.log("Clear notifications error:", err);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.leftGroup}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#22543d" />
            </TouchableOpacity>
            <Text style={styles.title}>Notifications</Text>
          </View>

          {notifications.length > 0 && (
            <TouchableOpacity onPress={clearAll}>
              <Text style={styles.clearAll}>Clear all</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* EMPTY STATE */}
        {!loading && notifications.length === 0 ? (
          <View style={styles.centerBox}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyTitle}>No notifications yet</Text>
            <Text style={styles.emptySub}>
              You’ll see updates about your orders here
            </Text>
          </View>
        ) : (
          notifications.map((item) => (
            <TouchableOpacity
              key={item._id}
              onPress={() => handleNotificationPress(item._id)}
              activeOpacity={0.7}
            >
              <View style={[styles.card, !item.isRead && styles.unreadCard]}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  {!item.isRead && <View style={styles.unreadDot} />}
                </View>

                <Text style={styles.cardMsg}>{item.message}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#eafbe7",
  },
  container: {
    padding: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 10,
    // marginBottom: 20,
  },
  leftGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10, // spacing between arrow & title
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#22543d",
    //marginLeft: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1b4332",
    marginBottom: 8,
    marginTop: 10,
  },
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#22543d",
  },
  cardMsg: {
    marginTop: 4,
    color: "#555",
  },
  time: {
    marginTop: 6,
    fontSize: 12,
    color: "#999",
  },
  centerBox: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 80,
    paddingHorizontal: 20,
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

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2d6a4f",
  },

  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#2d6a4f",
  },
  markAll: {
    color: "#22543d",
    fontWeight: "700",
    fontSize: 15,
  },
  clearAll: {
    color: "#b00020",
    fontWeight: "700",
    fontSize: 15,
  },
});
