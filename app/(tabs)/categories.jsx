import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useWishlist } from "../../contexts/wishlistContext";
import { useUser } from "../../contexts/userContext";
import { requireLogin } from "../utils/requireLogin";

import { ActivityIndicator } from "react-native";

import Toast from "react-native-toast-message";

import { Animated } from "react-native"; 

const BASE_URL = "http://172.21.112.206:5000";

export default function Categories() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const categoryFromParams = params.category || "all";
  const { focusSearch } = params;
  const inputRef = useRef();

  const { user,token } = useUser();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(categoryFromParams);
  const [searchText, setSearchText] = useState("");
  const [sortOption, setSortOption] = useState("none");

  const[categories,setCategories]=useState([]);

  const [status, setStatus] = useState("loading");
// "loading" | "success" | "error"


const fadeAnim = useRef(new Animated.Value(0)).current;


const fetchCategoriesData = () => {
  setStatus("loading");

  Promise.all([
    fetch(`${BASE_URL}/api/products`).then(res => res.json()),
    fetch(`${BASE_URL}/api/categories`).then(res => res.json()),
  ])
    .then(([productsData, categoriesData]) => {
      setProducts(Array.isArray(productsData) ? productsData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setStatus("success"); //DATA READY
    })
    .catch(err => {
      setStatus("error"); //FAILED
    });
};

  useEffect(() => {
    if (focusSearch === "true" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [focusSearch]);

  useEffect(() => {
    setSelectedCategory(categoryFromParams);
  }, [categoryFromParams]);

 useEffect(() => {
  fetchCategoriesData();
}, []);

//FADE-IN
 useEffect(() => {
    if (status === "success") {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [status]);

  let filteredSeeds =
    selectedCategory === "all"
      ? products
      : products.filter((seed) => seed.category === selectedCategory);

  filteredSeeds = filteredSeeds.filter((seed) =>
    seed.name.toLowerCase().includes(searchText.toLowerCase())
  );

  if (sortOption === "price_low") filteredSeeds.sort((a, b) => a.price - b.price);
  else if (sortOption === "price_high") filteredSeeds.sort((a, b) => b.price - a.price);
  else if (sortOption === "name_az") filteredSeeds.sort((a, b) => a.name.localeCompare(b.name));

  const toggleWishlist = (seed) => {
    if (!requireLogin(user,token)) return;

    const exists = wishlist.some((i) => String(i.id) === String(seed._id));

    if (exists) {
      removeFromWishlist(seed._id);

      Toast.show({
      type: "info",
      text1: `${seed.name} removed from wishlist`,
    });  
    } else {
      addToWishlist({
        id: seed._id,
        name: seed.name,
        price: seed.price,
        img: { uri: seed.image },
      });
  Toast.show({
      type: "success",
      text1: `${seed.name} added to wishlist ❤️`,
    });  
    }
  };

if (status === "loading") {
  return (
    <SafeAreaView style={styles.loaderContainer}>
      <ActivityIndicator size="large" color="#1b4332" />
      <Text style={styles.loaderText}>Loading DK STORE SEEDS…</Text>
    </SafeAreaView>
  );
}

if (status === "error") {
  return (
    <SafeAreaView style={styles.loaderContainer}>
      <Text style={styles.errorText}>Failed to load data</Text>
      <TouchableOpacity
        style={styles.retryBtn}
        onPress={fetchCategoriesData}
      >
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}


//HIGHLIGHT SEARCH TEXT
const highlightText = (text, search) => {
  if (!search) return <Text>{text}</Text>;

  const regex = new RegExp(`(${search})`, "ig");
  const parts = text.split(regex);

  return (
    <Text>
      {parts.map((part, index) =>
        part.toLowerCase() === search.toLowerCase() ? (
          <Text
            key={index}
            style={{ backgroundColor: "#7e7d4e64", fontWeight: "bold" }}
          >
            {part}
          </Text>
        ) : (
          <Text key={index}>{part}</Text>
        )
      )}
    </Text>
  );
};

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#eafbe7" }}>
      <Animated.View style={{flex:1,opacity:fadeAnim}}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.headerRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color="#22543d" />
            <TextInput
              ref={inputRef}
              placeholder="Search seeds..."
              value={searchText}
              placeholderTextColor="#4a7c59"
              style={styles.searchInput}
              onChangeText={setSearchText}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText("")}>
                <Ionicons name="close-circle" size={24} color="#22543d" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            onPress={() =>
              setSortOption(
                sortOption === "none"
                  ? "price_low"
                  : sortOption === "price_low"
                  ? "price_high"
                  : sortOption === "price_high"
                  ? "name_az"
                  : "none"
              )
            }
            style={styles.iconBtn}
          >
            <Ionicons
              name={
                sortOption === "none"
                  ? "filter-outline"
                  : sortOption === "price_low"
                  ? "arrow-down-circle-outline"
                  : sortOption === "price_high"
                  ? "arrow-up-circle-outline"
                  : "text-outline"
              }
              size={24}
              color="#22543d"
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              if (!requireLogin(user,token)) return;
              router.push("/wishlist");
            }}
            style={styles.iconBtn}
          >
            <Ionicons name="heart-outline" size={24} color="#22543d" />
          </TouchableOpacity>
        </View>

        {/* SORT LABEL */}
        <Text style={styles.sortLabel}>
          Sorting:{" "}
          {sortOption === "none"
            ? "None"
            : sortOption === "price_low"
            ? "Price Low → High"
            : sortOption === "price_high"
            ? "Price High → Low"
            : "Name A → Z"}
        </Text>

        {/* CATEGORY CHIPS */}
{categories.length <= 3 ? (
  <View style={styles.categoryRow}>
    {categories.map((cat) => (
      <TouchableOpacity
        key={cat.key}
        style={[
          styles.catButton,
          selectedCategory === cat.key && styles.catButtonActive,
        ]}
        onPress={() => setSelectedCategory(cat.key)}
      >
        <Text
          style={[
            styles.catButtonText,
            selectedCategory === cat.key && styles.catButtonTextActive,
          ]}
        >
          {cat.title}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
) : (
  //SCROLLABLE (ONLY WHEN NEEDED)
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.categoryScrollRow}
  >
    {categories.map((cat) => (
      <TouchableOpacity
        key={cat.key}
        style={[
          styles.catButtonScroll,
          selectedCategory === cat.key && styles.catButtonActive,
        ]}
        onPress={() => setSelectedCategory(cat.key)}
      >
        <Text
          style={[
            styles.catButtonText,
            selectedCategory === cat.key && styles.catButtonTextActive,
          ]}
        >
          {cat.title}
        </Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
)}
        {/* SEED GRID */}
        <Text style={styles.sectionTitle}>Seeds</Text>
        <View style={styles.gridContainer}>
          {filteredSeeds.map((seed) => {
            const saved = wishlist.some(
              (i) => String(i.id) === String(seed._id)
            );

            return (
              <View key={seed._id} style={styles.cardWrapper}>
                <TouchableOpacity
                  style={styles.imageCard}
                  onPress={() =>
                    router.push({
                      pathname: "/productDetails",
                      params: {
                        id: seed._id,
                        name: seed.name,
                        price: seed.price,
                        img: seed.image,
         description: seed.description, 
                      },
                    })
                  }
                >
                  <Image
                    source={{ uri: seed.image }}
                    style={styles.productImage}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.wishlistBtn}
                  onPress={() => toggleWishlist(seed)}
                >
                  <Ionicons
                    name={saved ? "heart" : "heart-outline"}
                    size={20}
                    color={saved ? "red" : "#22543d"}
                  />
                </TouchableOpacity>

                <View style={styles.infoBox}>
                  <Text style={styles.productName}>
             {highlightText(seed.name, searchText)}
                  </Text>
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={16} color="#f5b50a" />
                    <Text style={styles.ratingText}>
                      {seed.rating ?? "4.5"}
                    </Text>
                  </View>
                </View>

                <Text style={styles.price}>₹{seed.price}/kg</Text>

                <TouchableOpacity
                  style={styles.viewBtn}
                  onPress={() =>
                    router.push({
                      pathname: "/productDetails",
                      params: {
                        id: seed._id,
                        name: seed.name,
                        price: seed.price,
                        img: seed.image,
                      },
                    })
                  }
                >
                  <Text style={styles.viewBtnText}>View Details</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#eafbe7", padding: 14 },
  headerRow: { flexDirection: "row", marginBottom: 16 },
  searchBox: {
    flex: 1,
    backgroundColor: "#fff",
    flexDirection: "row",
    padding: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  searchInput: { flex: 1, marginLeft: 6 },
  iconBtn: {
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 10,
    marginLeft: 10,
  },
  sortLabel: { marginBottom: 10, color: "#22543d", fontWeight: "600" },
  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  catButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 50,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  catButtonActive: { backgroundColor: "#4a7c59" },
  catButtonText: { fontWeight: "600", color: "#22543d" },
  catButtonTextActive: { color: "#fff" },
  sectionTitle: { fontSize: 20, fontWeight: "700", marginBottom: 8 },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  cardWrapper: { width: "48%", marginBottom: 22 },
  imageCard: {
    backgroundColor: "#fff",
    width: "100%",
    height: 170,
    borderRadius: 12,
    overflow: "hidden",
  },
  productImage: { width: "100%", height: "100%" },
  wishlistBtn: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "#fff",
    padding: 6,
    borderRadius: 30,
  },
  infoBox: { marginTop: 8, flexDirection: "row", justifyContent: "space-between" },
  productName: { fontWeight: "600", color: "#000" },
  ratingRow: { flexDirection: "row", alignItems: "center" },
  ratingText: { marginLeft: 4, color: "#555" },
  price: { fontWeight: "700", marginTop: 4, color: "#22543d" },
  viewBtn: {
    backgroundColor: "#22543d",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  viewBtnText: { color: "#fff", fontWeight: "600" },
  loaderContainer: {
  flex: 1,
  backgroundColor: "#eafbe7",
  justifyContent: "center",
  alignItems: "center",
},

loaderText: {
  marginTop: 12,
  fontSize: 16,
  fontWeight: "600",
  color: "#22543d",
},

errorText: {
  fontSize: 16,
  color: "red",
  marginBottom: 12,
},

retryBtn: {
  backgroundColor: "#1b4332",
  paddingHorizontal: 20,
  paddingVertical: 10,
  borderRadius: 10,
},

retryText: {
  color: "#fff",
  fontWeight: "700",
},
categoryRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: 16,
},

categoryScrollRow: {
  flexDirection: "row",
  paddingBottom: 12,
},

catButtonScroll: {
  paddingVertical: 10,
  paddingHorizontal: 18,
  borderRadius: 50,
  backgroundColor: "#fff",
  marginRight: 10,
  alignItems: "center",
},

});


