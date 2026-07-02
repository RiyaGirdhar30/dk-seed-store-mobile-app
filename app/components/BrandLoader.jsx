import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from "react-native";

export default function BrandLoader({
  status = "loading",   // "loading" | "error"
  onRetry,
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.4)).current;

  //Animation ONLY for loading
  useEffect(() => {
    if (status !== "loading") return;

    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1.15,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.4,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  }, [status]);

  return (
    <View style={styles.container}>
      {/* BRAND TEXT */}
      <Animated.Text
        style={[
          styles.text,
          status === "loading" && {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        DK SEED STORE
      </Animated.Text>

      {/* ERROR UI */}
      {status === "error" && (
        <>
          <Text style={styles.errorText}>
            Unable to load seeds 🌾
          </Text>
          <Text style={styles.subText}>
            Check your internet connection
          </Text>

          <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </>
      )}
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
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: "#22543d",
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "600",
    color: "#22543d",
  },
  subText: {
    marginTop: 4,
    fontSize: 14,
    color: "#4a7c59",
  },
  retryBtn: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 26,
    backgroundColor: "#22543d",
    borderRadius: 20,
  },
  retryText: {
    color: "#fff",
    fontWeight: "700",
  },
});
