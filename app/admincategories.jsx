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

export default function AdminCategories() {
  const router = useRouter();
  const { token } = useUser();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  //FETCH CATEGORIES
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/categories/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log("Fetch categories error:", err);
      Alert.alert("Error", "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchCategories = async () => {
        try {
          setLoading(true);
          const res = await fetch(`${BASE_URL}/api/categories/admin`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();

          if (isActive) {
            setCategories(Array.isArray(data) ? data : []);
          }
        } catch (err) {
          console.log("Fetch categories error:", err);
          Alert.alert("Error", "Failed to load categories");
        } finally {
          if (isActive) setLoading(false);
        }
      };

      fetchCategories();

      return () => {
        isActive = false;
      };
    }, [token]),
  );

  const toggleCategory = async (category) => {
    //ACTIVE → INACTIVE → CONFIRM
    if (category.active) {
      Alert.alert(
        "Deactivate Category",
        "This will hide the category from users. You can activate it again later.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Deactivate",
            style: "destructive",
            onPress: async () => {
              try {
                const res = await fetch(
                  `${BASE_URL}/api/categories/toggle/${category._id}`,
                  {
                    method: "PUT",
                    headers: { Authorization: `Bearer ${token}` },
                  },
                );

                if (!res.ok) {
                  return Alert.alert("Error", "Failed to toggle category");
                }

                fetchCategories();
              } catch (err) {
                Alert.alert("Error", "Something went wrong");
              }
            },
          },
        ],
      );

      return;
    }

    // INACTIVE → ACTIVE → NO CONFIRM
    try {
      const res = await fetch(
        `${BASE_URL}/api/categories/toggle/${category._id}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!res.ok) {
        return Alert.alert("Error", "Failed to toggle category");
      }

      fetchCategories();
    } catch (err) {
      Alert.alert("Error", "Something went wrong");
    }
  };

  //DELETE CATEGORY
  const deleteCategory = (category) => {
    Alert.alert(
      "Delete Category",
      "Are you sure you want to delete this category?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await fetch(
                `${BASE_URL}/api/categories/${category._id}`,
                {
                  method: "DELETE",
                  headers: { Authorization: `Bearer ${token}` },
                },
              );

              const data = await res.json();

              if (!res.ok) {
                return Alert.alert("Cannot Delete", data.message);
              }

              fetchCategories();
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
      <SafeAreaView style={styles.loaderScreen}>
        <ActivityIndicator size="large" color="#22543d" />
        <Text style={styles.loaderText}>Loading categories…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#22543d" />
          </TouchableOpacity>
          <Text style={styles.title}>Manage Categories</Text>
        </View>

        {/* ADD BUTTON */}
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push("/admincategoryform")}
        >
          <Text style={styles.addBtnText}>+ Add Category</Text>
        </TouchableOpacity>

        {/* LIST */}
        {categories.length === 0 ? (
          <Text style={styles.emptyText}>No categories found</Text>
        ) : (
          categories.map((cat) => (
            <View key={cat._id} style={styles.card}>
              <Text style={styles.cardTitle}>{cat.title}</Text>
              <Text>Key: {cat.key}</Text>
              <Text>Order: {cat.order}</Text>

              {/* TOGGLE */}
              <TouchableOpacity
                style={[
                  styles.toggleBtn,
                  cat.active ? styles.active : styles.inactive,
                ]}
                onPress={() => toggleCategory(cat)}
              >
                <Text style={styles.btnText}>
                  {cat.active ? "ACTIVE" : "INACTIVE"}
                </Text>
              </TouchableOpacity>

              {/* EDIT */}
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() =>
                  router.push({
                    pathname: "/admincategoryform",
                    params: { category: JSON.stringify(cat) },
                  })
                }
              >
                <Text style={styles.btnText}>Edit</Text>
              </TouchableOpacity>

              {/* DELETE */}
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => deleteCategory(cat)}
              >
                <Text style={styles.btnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#eafbe7",
  },

  container: {
    padding: 16,
    paddingBottom: 40,
  },

  loaderScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#eafbe7",
  },

  loaderText: {
    marginTop: 8,
    color: "#22543d",
    fontWeight: "600",
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

  addBtnText: {
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
    fontSize: 16,
    marginBottom: 4,
  },

  toggleBtn: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
  },

  active: {
    backgroundColor: "#38a169",
  },

  inactive: {
    backgroundColor: "#aaa",
  },

  editBtn: {
    marginTop: 8,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#ffd166",
  },

  deleteBtn: {
    marginTop: 8,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#c53030",
  },

  btnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
  },
});
