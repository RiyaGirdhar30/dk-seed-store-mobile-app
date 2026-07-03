import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
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

// const BASE_URL = "http://172.21.112.206:5000";
const BASE_URL = "https://dk-seed-store-backend-1.onrender.com";

export default function AdminBanners() {
  const router = useRouter();
  const { token } = useUser();

  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/banners/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setBanners(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log("Fetch banners error:", err);
      Alert.alert("Error", "Failed to load banners");
    } finally {
      setLoading(false);
    }
  };
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchBanners = async () => {
        try {
          setLoading(true);
          const res = await fetch(`${BASE_URL}/api/banners/admin`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();

          if (isActive) {
            setBanners(Array.isArray(data) ? data : []);
          }
        } catch (err) {
          console.log("Fetch banners error:", err);
          Alert.alert("Error", "Failed to load banners");
        } finally {
          if (isActive) setLoading(false);
        }
      };

      fetchBanners();

      return () => {
        isActive = false;
      };
    }, [token]),
  );

  const toggleBanner = (banner) => {
    //Confirm only when deactivating
    if (banner.active) {
      Alert.alert(
        "Deactivate Banner",
        "This banner will no longer be visible to users. Are you sure?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Deactivate",
            style: "destructive",
            onPress: async () => {
              try {
                const res = await fetch(
                  `${BASE_URL}/api/banners/toggle/${banner._id}`,
                  {
                    method: "PUT",
                    headers: { Authorization: `Bearer ${token}` },
                  },
                );

                if (!res.ok) {
                  return Alert.alert("Error", "Failed to toggle banner");
                }

                fetchBanners();
              } catch (err) {
                Alert.alert("Error", "Something went wrong");
              }
            },
          },
        ],
      );
    } else {
      // Activate directly
      (async () => {
        try {
          const res = await fetch(
            `${BASE_URL}/api/banners/toggle/${banner._id}`,
            {
              method: "PUT",
              headers: { Authorization: `Bearer ${token}` },
            },
          );

          if (!res.ok) {
            return Alert.alert("Error", "Failed to toggle banner");
          }

          fetchBanners();
        } catch (err) {
          Alert.alert("Error", "Something went wrong");
        }
      })();
    }
  };

  //DELETE BANNER
  const deleteBanner = (id) => {
    Alert.alert(
      "Delete Banner",
      "Are you sure you want to delete this banner?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await fetch(`${BASE_URL}/api/banners/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
              });

              if (!res.ok) {
                return Alert.alert("Error", "Delete failed");
              }

              fetchBanners();
            } catch (err) {
              Alert.alert("Error", "Something went wrong");
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#22543d" />
        <Text>Loading banners...</Text>
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
          <Text style={styles.title}>Manage Banners 🖼️</Text>
        </View>

        {/*ADD BANNER BUTTON*/}
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push("/adminbannerform")}
        >
          <Text style={styles.addBtnText}>+ Add Banner</Text>
        </TouchableOpacity>

        {/* BANNERS LIST */}
        {banners.length === 0 ? (
          <Text style={styles.empty}>No banners found</Text>
        ) : (
          banners.map((banner) => (
            <View key={banner._id} style={styles.card}>
              <Image source={{ uri: banner.image }} style={styles.image} />

              <Text style={styles.text}>Category: {banner.category}</Text>
              <Text style={styles.text}>Order: {banner.order}</Text>

              {/* ACTIVE TOGGLE */}
              <TouchableOpacity
                style={[
                  styles.toggleBtn,
                  banner.active ? styles.active : styles.inactive,
                ]}
                onPress={() => toggleBanner(banner)}
              >
                <Text style={styles.toggleText}>
                  {banner.active ? "ACTIVE" : "INACTIVE"}
                </Text>
              </TouchableOpacity>

              {/* ✏️ EDIT BUTTON (ADD THIS) */}
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() =>
                  router.push({
                    pathname: "/adminbannerform",
                    params: { banner: JSON.stringify(banner) },
                  })
                }
              >
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>

              {/* DELETE */}
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => deleteBanner(banner._id)}
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
  safe: { flex: 1, backgroundColor: "#eafbe7" },
  container: { padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  title: { fontSize: 22, fontWeight: "700", marginLeft: 12, color: "#22543d" },
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  image: { height: 160, borderRadius: 10, marginBottom: 8 },
  text: { fontSize: 14, color: "#22543d" },
  toggleBtn: {
    marginTop: 8,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  active: { backgroundColor: "#2d6a4f" },
  inactive: { backgroundColor: "#aaa" },
  toggleText: { color: "#fff", fontWeight: "700" },
  deleteBtn: {
    marginTop: 8,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#e63946",
    alignItems: "center",
  },
  deleteText: { color: "#fff", fontWeight: "700" },
  empty: { textAlign: "center", marginTop: 40 },
  addBtn: {
    backgroundColor: "#1b4332",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 18,
    elevation: 3,
  },

  addBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  editBtn: {
    backgroundColor: "#ffd166",
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 8,
    alignItems: "center",
  },

  editText: {
    fontWeight: "700",
    color: "#000",
  },
});
