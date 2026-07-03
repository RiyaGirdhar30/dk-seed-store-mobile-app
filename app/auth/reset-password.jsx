import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// const BASE_URL = "http://172.21.112.206:5000";
const BASE_URL = "https://dk-seed-store-backend-1.onrender.com";

export default function ResetPassword() {
  const { token } = useLocalSearchParams();
  const router = useRouter();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleReset = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert("All fields required");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Passwords do not match");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Error", data.message || "Something went wrong");
        return;
      }

      Alert.alert("Success", "Password reset successfully");
      router.replace("/auth/signin");
    } catch (err) {
      Alert.alert("Error", "Server error");
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Reset Password</Text>

        <TextInput
          style={styles.input}
          placeholder="New Password"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />

        <TextInput
          style={styles.input}
          placeholder="Confirm New Password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity style={styles.btn} onPress={handleReset}>
          <Text style={styles.btnText}>Reset Password</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#eafbe7" },
  container: { padding: 20, flex: 1, justifyContent: "center" },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
  },
  btn: {
    backgroundColor: "#1b4332",
    padding: 14,
    borderRadius: 30,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "700" },
});
