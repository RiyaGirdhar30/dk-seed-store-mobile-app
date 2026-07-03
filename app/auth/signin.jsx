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
import { useUser } from "../../contexts/userContext";

// const BASE_URL = "http://172.21.112.206:5000";
const BASE_URL = "https://dk-seed-store-backend-1.onrender.com";

export default function SignIn() {
  const router = useRouter();
  const { login } = useUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Please enter all details");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log("LOGIN RESPONSE → ", data);

      if (!res.ok) {
        Alert.alert("Login failed", data.message || "Invalid credentials");
        return;
      }

      // BACKEND RETURNS _id
      const fixedUser = {
        id: data.user.id || data.user._id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role || "user",
      };

      // SAVE TO CONTEXT AND STORAGE
      login(fixedUser, data.token);

      Alert.alert("Login successful!");
      router.replace("/(tabs)/home");
    } catch (err) {
      console.log("LOGIN ERROR:", err);
      Alert.alert("Something went wrong");
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Welcome Back 🌱</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter Email"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Enter Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
          <Text style={styles.btnText}>Sign In</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/auth/forgot-password")}>
          <Text style={styles.linkText}>Forgot Password?</Text>
        </TouchableOpacity>
        {/* //new */}

        <TouchableOpacity onPress={() => router.push("/auth/signup")}>
          <Text style={styles.linkText}>Don’t have an account? Sign Up</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#eafbe7" },
  container: { padding: 20, flex: 1, justifyContent: "center" },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1b4332",
    textAlign: "center",
  },
  subtitle: { textAlign: "center", color: "#40916c", marginBottom: 30 },
  input: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
  },
  loginBtn: {
    backgroundColor: "#1b4332",
    padding: 14,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 10,
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  linkText: {
    textAlign: "center",
    marginTop: 20,
    color: "#1b4332",
    fontWeight: "600",
  },
});
