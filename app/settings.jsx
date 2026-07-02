//PERFECT
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function Settings() {
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        onPress: () => router.replace("/auth/signin"),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* ✅ BACK ARROW */}
        <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/profile")}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color="#1b4332" />
        </TouchableOpacity>

        <Text style={styles.title}>Settings ⚙️</Text>
        </View>

        {/* ✅ Edit Profile */}
        <TouchableOpacity style={styles.item}
         onPress={() => router.push("/edit-profile")}
        >
          <Ionicons name="person" size={22} color="#1b4332" />
          <Text style={styles.itemText}>Edit Profile</Text>
        </TouchableOpacity>

        {/* ✅ Address */}
        <TouchableOpacity style={styles.item}
        onPress={() => router.push("/address")}
        >
          <Ionicons name="location" size={22} color="#1b4332" />
          <Text style={styles.itemText}>My Address</Text>
        </TouchableOpacity>

        {/* ✅ Logout */}
        <TouchableOpacity style={[styles.item, styles.logout]} onPress={handleLogout}>
          <Ionicons name="log-out" size={22} color="#fff" />
          <Text style={[styles.itemText, { color: "#fff" }]}>Logout</Text>
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
    padding: 16,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24, 
  },

  backBtn: {
    marginRight: 12,
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1b4332",
    marginVertical: 0, 
  },

  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
    elevation: 2,
  },

  itemText: {
    marginLeft: 14,
    fontSize: 16,
    fontWeight: "700",
    color: "#1b4332",
  },

  logout: {
    backgroundColor: "#b00020",
    justifyContent: "center",
  },
});
