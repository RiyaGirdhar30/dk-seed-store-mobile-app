import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useBag } from "../contexts/bagContext";
import { useUser } from "../contexts/userContext";
import { useWishlist } from "../contexts/wishlistContext";
import { requireLogin } from "./utils/requireLogin";

export default function ProductDetail() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const { bag, addToBag } = useBag();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { user, token } = useUser();

  const { id, name, price, img, description } = params ?? {};

  const [selectedSize, setSelectedSize] = useState(null);
  const [sizeError, setSizeError] = useState(false);
  const [sizes, setSizes] = useState([]);

  /*Wishlist Button Loader */
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  /*Price calculation stays SAME */
  const calculatedPrice = selectedSize
    ? Number(price) * selectedSize.multiplier
    : Number(price);

  const isInWishlist = wishlist.some((item) => String(item.id) === String(id));

  /* Wishlist Toggle (WITH BUTTON LOADER) */
  const handleToggleWishlist = async () => {
    if (!requireLogin(user, token)) return;
    if (wishlistLoading) return;

    setWishlistLoading(true);

    try {
      await delay(200);

      if (isInWishlist) {
        removeFromWishlist(id);
        Toast.show({
          type: "info",
          text1: `${name} removed from wishlist 💔`,
        });
      } else {
        addToWishlist({
          id,
          name,
          price,
          img: { uri: img },
        });
        Toast.show({
          type: "success",
          text1: `${name} added to wishlist ❤️`,
        });
      }
    } catch (err) {
      console.log("Wishlist error:", err);
    } finally {
      setWishlistLoading(false);
    }
  };

  /* Add to Bag (UNCHANGED)  */
  const handleAddToBag = () => {
    if (!requireLogin(user, token)) return;

    if (!selectedSize) {
      setSizeError(true);
      Toast.show({
        type: "error",
        text1: "Please select a size",
      });
      return;
    }

    addToBag({
      id,
      name,
      // price: calculatedPrice,
      basePrice: Number(price),
      multiplier: selectedSize.multiplier,
      img: { uri: img },
      qty: 1,
      size: selectedSize.label,
    });

    Toast.show({
      type: "success",
      text1: `${name} added to bag`,
    });
  };

  /* Safety Check*/
  if (!id) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text>Product details not available.</Text>
        </View>
      </SafeAreaView>
    );
  }

  /*Fetch Sizes */
  useEffect(() => {
    fetch("https://dk-seed-store-backend-1.onrender.com/api/sizes")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setSizes(data);
        }
      })
      .catch((err) => console.log("Size fetch error:", err));
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* HEADER */}
        <View style={styles.topRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color="#22543d" />
          </TouchableOpacity>

          <View style={styles.topRightIcons}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => {
                if (!requireLogin(user, token)) return;
                router.push("/wishlist");
              }}
            >
              <Ionicons name="heart-outline" size={26} color="#22543d" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => {
                if (!requireLogin(user, token)) return;
                router.push("/bag");
              }}
            >
              <Ionicons name="bag-outline" size={26} color="#22543d" />
              {bag.length > 0 && (
                <View style={styles.bagBadge}>
                  <Text style={styles.bagBadgeText}>{bag.length}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* PRODUCT IMAGE */}
        <Image source={{ uri: img }} style={styles.productImage} />

        {/* INFO BOX */}
        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.productName}>{name}</Text>
              <Text style={styles.price}>
                ₹{calculatedPrice}/{selectedSize?.label || "kg"}
              </Text>
            </View>

            {/* ❤️ Wishlist Button with Loader */}
            <TouchableOpacity
              onPress={handleToggleWishlist}
              style={styles.infoWishlistBtn}
              disabled={wishlistLoading}
            >
              {wishlistLoading ? (
                <Ionicons name="time-outline" size={22} color="#22543d" />
              ) : (
                <Ionicons
                  name={isInWishlist ? "heart" : "heart-outline"}
                  size={24}
                  color={isInWishlist ? "red" : "#22543d"}
                />
              )}
            </TouchableOpacity>
          </View>

          {/* 🔽 ADD THIS BLOCK HERE */}
          {description ? (
            <View style={styles.descBox}>
              <Text style={styles.descTitle}>Product Description</Text>
              <Text style={styles.descText}>{description}</Text>
            </View>
          ) : null}

          {/* SIZE SELECTOR */}
          <Text style={styles.sizeLabel}>Choose size:</Text>

          <View
            style={[
              styles.sizeRow,
              sizeError && {
                borderWidth: 1,
                borderColor: "red",
                padding: 6,
                borderRadius: 10,
              },
            ]}
          >
            {sizes.map((size) => (
              <TouchableOpacity
                key={size._id}
                style={[
                  styles.sizeBtn,
                  selectedSize?.label === size.label && styles.sizeBtnActive,
                ]}
                onPress={() => {
                  setSelectedSize(size);
                  setSizeError(false);
                }}
              >
                <Text
                  style={[
                    styles.sizeBtnText,
                    selectedSize?.label === size.label &&
                      styles.sizeBtnTextActive,
                  ]}
                >
                  {size.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ADD TO BAG */}
          <TouchableOpacity style={styles.addToBagBtn} onPress={handleAddToBag}>
            <Text style={styles.addToBagText}>Add to Bag</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f2f9f0" },
  scrollContent: { padding: 16 },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  backBtn: {
    padding: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
  },

  topRightIcons: { flexDirection: "row", gap: 12 },

  iconBtn: {
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 12,
  },

  productImage: { width: "100%", height: 260 },

  infoBox: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 14,
  },

  infoRow: { flexDirection: "row", alignItems: "center" },

  productName: { fontSize: 22, fontWeight: "700" },
  price: { fontSize: 18, marginBottom: 6 },

  infoWishlistBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
  },

  sizeLabel: { marginTop: 12 },
  sizeRow: { flexDirection: "row", marginBottom: 16 },
  sizeBtn: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    marginRight: 10,
  },
  sizeBtnActive: { backgroundColor: "#22543d" },
  sizeBtnText: { color: "#22543d" },
  sizeBtnTextActive: { color: "#fff" },

  addToBagBtn: {
    backgroundColor: "#4a7c59",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },

  addToBagText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },

  bagBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#1b4332",
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  bagBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  descBox: {
    marginTop: 16,
    padding: 14,
    backgroundColor: "#f0fdf4",
    borderRadius: 10,
  },

  descTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1b4332",
    marginBottom: 6,
  },

  descText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
});
