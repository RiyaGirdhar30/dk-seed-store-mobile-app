import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";

export default function ScreenLoader({
  text = "Loading DK STORE SEEDS...",
}) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#1b4332" />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eafbe7",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    marginTop: 14,
    fontSize: 16,
    fontWeight: "600",
    color: "#22543d",
    letterSpacing: 0.5,
  },
});
