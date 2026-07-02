import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Carousel from "react-native-reanimated-carousel";
import { SafeAreaView } from "react-native-safe-area-context";
import { useWishlist } from "../../contexts/wishlistContext";
import { useUser } from "../../contexts/userContext";
import { requireLogin } from "../utils/requireLogin";
import Toast from "react-native-toast-message";
import BrandLoader from "../components/BrandLoader"; 

import { Animated, Easing } from "react-native";
import { useRef } from "react";

const BASE_URL = "http://172.21.112.206:5000";

export default function Home() {
  const router = useRouter();
  const { user, token } = useUser();
  const { addToWishlist } = useWishlist();
 const hasNotifications=true;  //new
 const [hasShaken, setHasShaken] = useState(false);
 const shakeAnim = useRef(new Animated.Value(0)).current;
 const fadeAnim = useRef(new Animated.Value(0)).current;

  const [banners, setBanners] = useState([]);
  const [featuredSeeds, setFeaturedSeeds] = useState([]);
  const [categories, setCategories] = useState([]);
const [status, setStatus] = useState("loading"); 
// "loading" | "success" | "error"


  /*FALLBACKS (SAFE)*/
  const fallbackBanners = [
    require("../../assets/images/banners/banner1.jpeg"),
    require("../../assets/images/banners/banner2.jpeg"),
    require("../../assets/images/banners/banner3.jpeg"),
  ];

useEffect(() => {
  if (!hasNotifications || hasShaken) return;

  Animated.sequence([
    Animated.timing(shakeAnim, {
      toValue: 1,    
      duration: 180,  
      useNativeDriver: true,
    }),
    Animated.timing(shakeAnim, {
      toValue: -1,
      duration: 180,  
      useNativeDriver: true,
    }),
    Animated.timing(shakeAnim, {
      toValue: 0,
      duration: 80,
      useNativeDriver: true,
    }),
  ]).start(() => {
    setHasShaken(true);
  });
}, [hasNotifications]);


const fetchHomeData = () => {
  setStatus("loading");

  Promise.all([
    fetch(`${BASE_URL}/api/products/featured`).then(res => res.json()),
    fetch(`${BASE_URL}/api/banners`).then(res => res.json()),
    fetch(`${BASE_URL}/api/category-sections`).then(res => res.json()),
  ])
    .then(([featuredData, bannerData, categoryData]) => {
      if (Array.isArray(featuredData)) setFeaturedSeeds(featuredData);

      if (Array.isArray(bannerData) && bannerData.length > 0) {
        setBanners(bannerData);
      } else {
        setBanners(fallbackBanners);
      }

      if (Array.isArray(categoryData)) setCategories(categoryData);

      setStatus("success"); 
    })
    .catch(err => {
      setStatus("error");
    });
};
useEffect(() => {
  fetchHomeData();
}, []);

useEffect(() => {
  if (status === "success") {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,   
      useNativeDriver: true,
    }).start();
  }
}, [status]);


  /*HANDLERS */
  const goToProducts = (category = "all") => {
    router.push(`/(tabs)/categories?category=${category}`);
  };

  const handleAddToWishlist = (item) => {
    if (!requireLogin(user, token)) return;

    addToWishlist({
      id:  item._id,
    });

    Toast.show({
      type: "success",
      text1: `${item.name} added to wishlist ❤️`,
    });
  };
if (status === "loading") {
  return <BrandLoader status="loading" />;
}

if (status === "error") {
  return <BrandLoader status="error" onRetry={fetchHomeData} />;
}

const safeFeaturedSeeds = featuredSeeds.filter(
  (s) => s && s.product && s.product.image
);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View style={{flex:1,opacity:fadeAnim}}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/categories?focusSearch=true")}
            style={styles.searchBox}
          >
            <Ionicons name="search" size={20} color="#22543d" />
            <TextInput
              editable={false}
              placeholder="Search seeds..."
              placeholderTextColor="#4a7c59"
              style={styles.searchInput}
            />
          </TouchableOpacity>
<Animated.View
  style={{
    transform: [
      {
        translateX: shakeAnim.interpolate({
          inputRange: [-1, 1],
          outputRange: [-6, 6],
        }),
      },
    ],
  }}
>
  <TouchableOpacity
    style={styles.iconBtn}
    onPress={() => router.push("/notifications")}
  >
    <Ionicons name="notifications-outline" size={24} color="#22543d" />
  </TouchableOpacity>
</Animated.View>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => {
              if (!requireLogin(user, token)) return;
              router.push("/wishlist");
            }}
          >
            <Ionicons name="heart-outline" size={24} color="#22543d" />
          </TouchableOpacity>
        </View>

        {/* 🔥 BANNERS */}
<View style={{ marginBottom: 20 }}>
  <Carousel
    width={Dimensions.get("window").width - 30}
    height={200}
    autoPlay
    loop
    autoPlayInterval={2500}
    data={banners}
    renderItem={({ item }) => (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() =>
          router.push({
            pathname: "/(tabs)/categories",
            params: {
              category: item.category || "all", // 🔥 MAGIC LINE
            },
          })
        }
      >
        <Image
          source={{ uri: item.image }}
          style={{ width: "100%", height: 200, borderRadius: 14 }}
        />
      </TouchableOpacity>
    )}
  />
</View>

        {/* 🔥 CATEGORIES */}
        <Text style={styles.sectionTitle}>Categories</Text>
{categories.length <= 2 ? (
  <View style={styles.categoriesRow}>
    {categories.map(cat => (
      <TouchableOpacity
        key={cat._id}
        style={styles.catBox}
        onPress={() => goToProducts(cat.key)}
      >
        <Image source={{ uri: cat.image }} style={styles.catImg} />
        <Text style={styles.catText}>{cat.name}</Text>
      </TouchableOpacity>
    ))}
  </View>
) : (
  // SCROLL ONLY WHEN MORE THAN 2
        <ScrollView  horizontal
  showsHorizontalScrollIndicator={false}
  contentContainerStyle={styles.categoriesScrollRow}
>
  {categories.map(cat => (
    <TouchableOpacity
      key={cat._id}
      style={styles.catBoxScroll}
      onPress={() => goToProducts(cat.key)}
    >
      <Image source={{ uri: cat.image }} style={styles.catImg} />
      <Text style={styles.catText}>{cat.name}</Text>
    </TouchableOpacity>
  ))}
        </ScrollView>
)}

        {/* 🔥 FEATURED SEEDS */}
        <Text style={styles.sectionTitle}>Featured Seeds</Text>
        <View style={styles.gridContainer}>
        {safeFeaturedSeeds.map(s => (
  <TouchableOpacity key={s._id} style={styles.cardWrapper}
  activeOpacity={0.8}
    onPress={() => {
      router.push({
        pathname: "/(tabs)/categories",
        params: { category: "all" }, //default
      });
    }}
  >
    <View style={styles.imageCard}>
      <Image
        source={{ uri: s.product.image }}
        style={styles.productImage}
      />

      <TouchableOpacity
        style={styles.wishlistBtn}
        onPress={() => handleAddToWishlist(s.product)}
      >
        <Ionicons name="heart-outline" size={20} color="#22543d" />
      </TouchableOpacity>
    </View>

    <View style={styles.infoBox}>
      <Text style={styles.productName}>{s.product.name}</Text>
      <View style={styles.ratingRow}>
        <Ionicons name="star" size={16} color="#f5b50a" />
        <Text style={styles.ratingText}>{s.rating}</Text>
      </View>
    </View>

    <Text style={styles.price}>₹{s.product.price}/kg</Text>
  </TouchableOpacity>
))}
        </View>

        {/* VIEW ALL */}
        <TouchableOpacity
          style={styles.viewAllBtn}
          onPress={() => goToProducts("all")}
        >
          <Text style={styles.viewAllText}>View All Seeds</Text>
        </TouchableOpacity>
      </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#eafbe7" },
  screen: { flex: 1 },
  container: { padding: 14 },
  headerRow: { flexDirection: "row", marginBottom: 16 },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 12,
  },
  searchInput: { flex: 1, marginLeft: 8 },
  iconBtn: {
    backgroundColor: "#fff",
    padding: 8,
    marginLeft: 10,
    borderRadius: 10,
  },
  categoriesRow: {
    flexDirection: "row",
   justifyContent: "center",
   gap:12,
    marginBottom: 16,
  },
  catBox: {
    backgroundColor: "#fff",
    paddingTop: 6,  //10
    paddingHorizontal:6,
    paddingBottom:1,
    width: "48%", //48%
    borderRadius: 14,  //12
    alignItems: "center",
  },
  catImg:
    { 
      width: "100%",
      height: 76,         //70
      marginBottom: 2,    //8
      borderRadius: 10,
  resizeMode: "cover",
    },
  catText:
   { fontWeight: "600",
     color: "#22543d" ,
     fontSize:15,
       paddingTop: 2,   
    },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 6 },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  cardWrapper: { width: "48%", marginBottom: 20 },
  imageCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "100%",
    height: 170,
    overflow: "hidden",
    position: "relative",
  },
  productImage: { width: "100%", height: "100%" },
  wishlistBtn: {
    position: "absolute",
    top: 5,
    right: 5,
    padding: 6,
    backgroundColor: "#fff",
    borderRadius: 30,
  },
  infoBox: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  productName: { fontWeight: "600", fontSize: 15 },
  ratingRow: { flexDirection: "row", alignItems: "center" },
  ratingText: { marginLeft: 4, color: "#555" },
  price: { fontWeight: "700", marginTop: 4, color: "#22543d" },
  viewAllBtn: {
    backgroundColor: "#dff3df",
    padding: 14,
    borderRadius: 12,
    marginTop: 10,
    alignItems: "center",
  },
  viewAllText: { fontWeight: "700", color: "#22543d" },
  categoriesScrollRow: {
  flexDirection: "row",
  paddingBottom: 6,
},

catBoxScroll: {
  backgroundColor: "#fff",
  paddingTop: 6,
  paddingHorizontal: 6,
  paddingBottom: 1,
  width: 160,       // 🔥 KEY FIX
  borderRadius: 14,
  alignItems: "center",
  marginRight: 12,
},
});





