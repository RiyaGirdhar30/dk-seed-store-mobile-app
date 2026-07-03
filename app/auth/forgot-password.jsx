import { useRouter } from "expo-router";
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

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert("Please enter your email");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Error", data.message || "Something went wrong");
        return;
      }

      Alert.alert("Success", "Reset password request created");

      //  Navigate to reset screen with token
      router.push({
        pathname: "/auth/reset-password",
        params: { token: data.resetToken },
      });
    } catch (err) {
      Alert.alert("Error", "Server error");
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Forgot Password</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter your registered email"
          value={email}
          onChangeText={setEmail}
        />

        <TouchableOpacity style={styles.btn} onPress={handleForgotPassword}>
          <Text style={styles.btnText}>Send Reset Link</Text>
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
