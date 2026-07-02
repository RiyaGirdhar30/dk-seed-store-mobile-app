import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function Success() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        <Ionicons name="checkmark-circle" size={120} color="#2d6a4f" />

        <Text style={styles.title}>Account Created!</Text>
        <Text style={styles.subtitle}>
          Your DK Seed Store account has been created successfully 🌱
        </Text>

        <TouchableOpacity
          style={styles.loginBtn}
          onPress={() => router.push("/auth/signin")}
        >
          <Text style={styles.btnText}>Go to Login</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#eafbe7",
  },

  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1b4332",
    marginTop: 20,
  },

  subtitle: {
    textAlign: "center",
    color: "#40916c",
    marginTop: 10,
    fontSize: 14,
    marginBottom: 40,
  },

  loginBtn: {
    backgroundColor: "#2d6a4f",
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 30,
  },

  btnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
