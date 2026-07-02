import { Alert } from "react-native";
import { router } from "expo-router";

export const requireLogin = (user, token) => {
  if (!user || !token) {
    Alert.alert(
      "Login Required",
      "Please login or create an account to continue.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Login",
          onPress: () => router.push("/auth/signin"),
        },
      ]
    );
    return false;
  }
  return true;
};
