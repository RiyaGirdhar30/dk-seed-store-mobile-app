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

const BASE_URL = "http://172.21.112.206:5000";

export default function AdminSizes() {
  const router = useRouter();
  const { token } = useUser();

  const [sizes, setSizes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSizes = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/sizes/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSizes(Array.isArray(data) ? data : []);
    } catch (err) {
      Alert.alert("Error", "Failed to load sizes");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchSizes = async () => {
        try {
          setLoading(true);
          const res = await fetch(`${BASE_URL}/api/sizes/admin`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();

          if (isActive) {
            setSizes(Array.isArray(data) ? data : []);
          }
        } catch (err) {
          Alert.alert("Error", "Failed to load sizes");
        } finally {
          if (isActive) setLoading(false);
        }
      };

      fetchSizes();

      return () => {
        isActive = false;
      };
    }, [token]),
  );

  const toggleSize = (size) => {
    //Confirm only when deactivating
    if (size.active) {
      Alert.alert(
        "Deactivate Size",
        "This size will no longer be available for products. Are you sure?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Deactivate",
            style: "destructive",
            onPress: async () => {
              try {
                await fetch(`${BASE_URL}/api/sizes/toggle/${size._id}`, {
                  method: "PUT",
                  headers: { Authorization: `Bearer ${token}` },
                });
                fetchSizes();
              } catch (err) {
                Alert.alert("Error", "Failed to update size status");
              }
            },
          },
        ],
      );
    } else {
      //Activate directly (safe)
      (async () => {
        try {
          await fetch(`${BASE_URL}/api/sizes/toggle/${size._id}`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
          });
          fetchSizes();
        } catch (err) {
          Alert.alert("Error", "Failed to update size status");
        }
      })();
    }
  };

  const deleteSize = (id) => {
    Alert.alert("Delete Size", "Are you sure you want to delete this size?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await fetch(`${BASE_URL}/api/sizes/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          fetchSizes();
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#22543d" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#22543d" />
          </TouchableOpacity>
          <Text style={styles.title}>Manage Sizes</Text>
        </View>

        {/* ADD BUTTON */}
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push("/adminsizeform")}
        >
          <Text style={styles.addText}>+ Add Size</Text>
        </TouchableOpacity>

        {/* LIST */}
        {sizes.length === 0 ? (
          <Text style={styles.emptyText}>No sizes found</Text>
        ) : (
          sizes.map((size) => (
            <View key={size._id} style={styles.card}>
              <Text style={styles.cardTitle}>{size.label}</Text>
              <Text>Multiplier: {size.multiplier}</Text>
              <Text>Order: {size.order}</Text>

              {/* TOGGLE */}
              <TouchableOpacity
                style={[
                  styles.statusBtn,
                  { backgroundColor: size.active ? "#2d6a4f" : "#aaa" },
                ]}
                onPress={() => toggleSize(size)}
              >
                <Text style={styles.statusText}>
                  {size.active ? "ACTIVE" : "INACTIVE"}
                </Text>
              </TouchableOpacity>

              {/* EDIT */}
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() =>
                  router.push({
                    pathname: "/adminsizeform",
                    params: { size: JSON.stringify(size) },
                  })
                }
              >
                <Text style={styles.btnText}>Edit</Text>
              </TouchableOpacity>

              {/* ARCHIVE */}
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => deleteSize(size._id)}
              >
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
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
    padding: 16,
    paddingBottom: 40,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#eafbe7",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    marginLeft: 12,
    color: "#22543d",
  },

  addBtn: {
    backgroundColor: "#22543d",
    padding: 14,
    borderRadius: 10,
    marginBottom: 20,
  },

  addText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 16,
  },

  emptyText: {
    textAlign: "center",
    color: "#777",
    marginTop: 20,
  },

  card: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },

  cardTitle: {
    fontWeight: "700",
    marginBottom: 4,
  },

  statusBtn: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
  },

  statusText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
  },

  editBtn: {
    marginTop: 8,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#ffd166",
    alignItems: "center",
    fontSize: 600,
  },
  btnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15, // or 16 if you want bolder
  },

  deleteBtn: {
    backgroundColor: "#e53e3e",
    padding: 10,
    borderRadius: 6,
    marginTop: 6,
    alignItems: "center",
  },

  deleteText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
  },
});
