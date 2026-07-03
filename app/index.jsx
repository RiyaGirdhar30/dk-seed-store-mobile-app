import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// const BASE_URL = "http://172.21.112.206:5000";
const BASE_URL = "https://dk-seed-store-backend-1.onrender.com";

export default function Splash() {
  const [image, setImage] = useState(null);

  useEffect(() => {
    // fetch splash image
    fetch(`${BASE_URL}/api/splash`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.image) {
          setImage({ uri: data.image });
        }
      })
      .catch(() => {
        setImage(require("../assets/images/DK_Seed_Store_Logo_Design.png"));
      });

    const timer = setTimeout(() => {
      router.replace("/(tabs)/home");
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={
          image || require("../assets/images/DK_Seed_Store_Logo_Design.png")
        }
        style={styles.logo}
        resizeMode="contain"
      />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eafbe7",
    justifyContent: "center",
    alignItems: "center",
    padding: 0,
    margin: 0,
  },
  logo: {
    width: 350,
    height: 350,
  },
});
