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

const BASE_URL = "http://172.21.112.206:5000";

export default function AdminProducts() {
  const router = useRouter();
  const { token } = useUser();
  const [products, setProducts] = useState([]);
  const [featuredIds, setFeaturedIds] = useState([]);

  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchProducts = async () => {
        try {
          setLoading(true);
          const res = await fetch(`${BASE_URL}/api/products`);
          const data = await res.json();
          if (isActive) setProducts(data);
        } catch (err) {
          console.log("Error fetching products:", err);
        } finally {
          if (isActive) setLoading(false);
        }
      };

      const fetchFeatured = async () => {
        try {
          const res = await fetch(`${BASE_URL}/api/products/featured`);
          const data = await res.json();
          if (isActive) {
            setFeaturedIds(data.map((item) => item.product._id));
          }
        } catch (err) {
          console.log("Error fetching featured seeds:", err);
        }
      };

      fetchProducts();
      fetchFeatured();

      return () => {
        isActive = false;
      };
    }, []),
  );

  const handleDelete = (id) => {
    Alert.alert(
      "Delete Product",
      "Are you sure you want to delete this product?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await fetch(`${BASE_URL}/api/products/${id}`, {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              const data = await res.json();

              if (!res.ok) {
                Alert.alert("Error", data.message || "Delete failed");
                return;
              }

              // Remove from UI instantly
              setProducts((prev) =>
                prev.filter((product) => product._id !== id),
              );

              Alert.alert("Deleted ✅", "Product removed successfully");
            } catch (err) {
              Alert.alert("Error", "Something went wrong");
            }
          },
        },
      ],
    );
  };

  const toggleFeatured = (productId, isFeatured) => {
    // Ask confirmation ONLY when adding to featured
    if (!isFeatured) {
      Alert.alert(
        "Add to Featured?",
        "This product will be shown in the featured section.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Yes",
            onPress: () => proceedToggle(productId),
          },
        ],
      );
    } else {
      //Removing featured → instant
      proceedToggle(productId);
    }
  };

  const proceedToggle = async (productId) => {
    try {
      const res = await fetch(
        `${BASE_URL}/api/products/featured/${productId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Error", data.message || "Failed to toggle featured");
        return;
      }

      //Update Product list instantly (ADMIN MEMORY)
      setProducts((prev) =>
        prev.map((p) =>
          p._id === productId ? { ...p, isFeatured: !p.isFeatured } : p,
        ),
      );

      //Keep FeaturedSeeds list in sync (HOME TAB)
      setFeaturedIds((prev) =>
        prev.includes(productId)
          ? prev.filter((id) => id !== productId)
          : [...prev, productId],
      );
    } catch (err) {
      Alert.alert("Error", "Something went wrong");
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Manage Products 🌱</Text>
        </View>

        {/* ADD PRODUCT BUTTON */}
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push("/adminproductform")}
        >
          <Text style={styles.addBtnText}>+ Add Product</Text>
        </TouchableOpacity>

        {/* CONTENT */}
        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#1b4332" />
            <Text style={styles.loadingText}>Loading products…</Text>
          </View>
        ) : products.length === 0 ? (
          <View style={styles.centerBox}>
            <Text style={styles.emptyIcon}>🌱</Text>
            <Text style={styles.emptyTitle}>No products yet</Text>
            <Text style={styles.emptySub}>
              Add your first product to start selling
            </Text>

            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => router.push("/adminproductform")}
            >
              <Text style={styles.emptyBtnText}>+ Add Product</Text>
            </TouchableOpacity>
          </View>
        ) : (
          products.map((product) => (
            <View key={product._id} style={styles.card}>
              <Image
                source={{ uri: product.image }}
                style={styles.image}
                resizeMode="contain"
              />

              <Text style={styles.name}>{product.name}</Text>
              <Text>₹ {product.price}</Text>
              <Text>Stock: {product.stock}</Text>

              <TouchableOpacity
                style={[
                  styles.featureBtn,
                  product.isFeatured && styles.featuredActive,
                ]}
                onPress={() => toggleFeatured(product._id, product.isFeatured)}
              >
                <Ionicons
                  name={product.isFeatured ? "star" : "star-outline"}
                  size={18}
                  color="#fff"
                />
                <Text style={styles.featureText}>
                  {product.isFeatured ? "Featured" : "Add to Featured"}
                </Text>
              </TouchableOpacity>

              {/* EDIT BUTTON */}
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() =>
                  router.push({
                    pathname: "/adminproductform",
                    params: { product: JSON.stringify(product) },
                  })
                }
              >
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>

              {/* DELETE BUTTON */}
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(product._id)}
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
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1b4332",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    paddingVertical: 8,
  },

  backArrow: {
    fontSize: 24,
    marginRight: 10,
    color: "#1b4332",
    paddingTop: 2,
    fontWeight: "700",
  },

  subtitle: {
    fontSize: 14,
    color: "#40916c",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
  },

  image: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: "#f1f5f3",
  },

  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1b4332",
  },

  emptyText: {
    textAlign: "center",
    marginTop: 30,
    color: "#555",
  },
  addBtn: {
    backgroundColor: "#2d6a4f",
    paddingVertical: 14,
    borderRadius: 14, //12
    alignItems: "center",
    marginBottom: 16, //20
    marginTop: 4,
  },

  addBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  deleteBtn: {
    backgroundColor: "#e63946",
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },

  deleteText: {
    color: "#fff",
    fontWeight: "700",
  },
  editBtn: {
    backgroundColor: "#ffd166",
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },

  editText: {
    color: "#fff",
    fontWeight: "700",
  },
  centerBox: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
    paddingHorizontal: 20,
  },

  loadingText: {
    marginTop: 10,
    color: "#40916c",
    fontWeight: "600",
  },

  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1b4332",
    marginBottom: 6,
  },

  emptySub: {
    fontSize: 14,
    color: "#40916c",
    textAlign: "center",
    marginBottom: 20,
  },

  emptyBtn: {
    backgroundColor: "#2d6a4f",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },

  emptyBtnText: {
    color: "#fff",
    fontWeight: "700",
  },

  featureBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#40916c",
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
    gap: 6,
  },

  featuredActive: {
    backgroundColor: "#f4a261",
  },

  featureText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
});
