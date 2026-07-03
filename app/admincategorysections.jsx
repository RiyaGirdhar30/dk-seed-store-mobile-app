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

export default function AdminCategorySections() {
  const router = useRouter();
  const { token } = useUser();

  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  //FETCH CATEGORY SECTIONS
  const fetchSections = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/category-sections/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSections(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log("Fetch category sections error:", err);
      Alert.alert("Error", "Failed to load category sections");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchSections = async () => {
        try {
          setLoading(true);
          const res = await fetch(`${BASE_URL}/api/category-sections/admin`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();

          if (isActive) {
            setSections(Array.isArray(data) ? data : []);
          }
        } catch (err) {
          console.log("Fetch category sections error:", err);
          Alert.alert("Error", "Failed to load category sections");
        } finally {
          if (isActive) setLoading(false);
        }
      };

      fetchSections();

      return () => {
        isActive = false;
      };
    }, [token]),
  );

  const toggleSection = (section) => {
    //Confirm only when deactivating
    if (section.active) {
      Alert.alert(
        "Deactivate Section",
        "This section will no longer be visible to users. Are you sure?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Deactivate",
            style: "destructive",
            onPress: async () => {
              try {
                const res = await fetch(
                  `${BASE_URL}/api/category-sections/toggle/${section._id}`,
                  {
                    method: "PUT",
                    headers: { Authorization: `Bearer ${token}` },
                  },
                );

                if (!res.ok) {
                  return Alert.alert("Error", "Failed to toggle section");
                }

                fetchSections();
              } catch (err) {
                Alert.alert("Error", "Something went wrong");
              }
            },
          },
        ],
      );
    } else {
      //Activate directly
      (async () => {
        try {
          const res = await fetch(
            `${BASE_URL}/api/category-sections/toggle/${section._id}`,
            {
              method: "PUT",
              headers: { Authorization: `Bearer ${token}` },
            },
          );

          if (!res.ok) {
            return Alert.alert("Error", "Failed to toggle section");
          }

          fetchSections();
        } catch (err) {
          Alert.alert("Error", "Something went wrong");
        }
      })();
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loaderScreen}>
        <ActivityIndicator size="large" color="#22543d" />
        <Text style={styles.loaderText}>Loading category sections…</Text>
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
          <Text style={styles.title}>Manage Category Sections</Text>
        </View>

        {/* ADD BUTTON */}
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push("/admincategorysectionform")}
        >
          <Text style={styles.addBtnText}>+ Add Category Section</Text>
        </TouchableOpacity>

        {/* LIST */}
        {sections.length === 0 ? (
          <Text style={styles.emptyText}>No category sections found</Text>
        ) : (
          sections.map((section) => (
            <View key={section._id} style={styles.card}>
              <Image source={{ uri: section.image }} style={styles.image} />

              <Text style={styles.cardTitle}>{section.name}</Text>
              <Text>Key: {section.key}</Text>
              <Text>Order: {section.order}</Text>

              {/* TOGGLE */}
              <TouchableOpacity
                style={[
                  styles.toggleBtn,
                  section.active ? styles.active : styles.inactive,
                ]}
                onPress={() => toggleSection(section)}
              >
                <Text style={styles.btnText}>
                  {section.active ? "ACTIVE" : "INACTIVE"}
                </Text>
              </TouchableOpacity>

              {/* EDIT */}
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() =>
                  router.push({
                    pathname: "/admincategorysectionform",
                    params: { section: JSON.stringify(section) },
                  })
                }
              >
                <Text style={styles.btnText}>Edit</Text>
              </TouchableOpacity>

              {/* DELETE */}
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => {
                  Alert.alert(
                    "Delete Category Section",
                    "This will permanently delete the category section. Are you sure?",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Delete",
                        style: "destructive",
                        onPress: async () => {
                          try {
                            const res = await fetch(
                              `${BASE_URL}/api/category-sections/${section._id}`,
                              {
                                method: "DELETE",
                                headers: {
                                  Authorization: `Bearer ${token}`,
                                },
                              },
                            );

                            if (!res.ok) {
                              return Alert.alert("Error", "Delete failed");
                            }

                            fetchSections();
                          } catch (err) {
                            Alert.alert("Error", "Something went wrong");
                          }
                        },
                      },
                    ],
                  );
                }}
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
  },
  loaderScreen: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#eafbe7",
  },
  loaderText: {
    textAlign: "center",
    marginTop: 8,
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
  },
  emptyText: {
    textAlign: "center",
    color: "#777",
  },
  card: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  image: {
    height: 120,
    borderRadius: 10,
  },
  cardTitle: {
    marginTop: 8,
    fontWeight: "700",
    fontSize: 16,
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
  },
});
