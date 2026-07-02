import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "../contexts/userContext";

const BASE_URL = "http://172.21.112.206:5000";

export default function AdminSizeForm() {
  const router = useRouter();
  const { token } = useUser();
  const [saving, setSaving] = useState(false);

  const params = useLocalSearchParams();

  const editingSize = params.size ? JSON.parse(params.size) : null;

  const [label, setLabel] = useState(editingSize?.label || "");
  const [multiplier, setMultiplier] = useState(
    editingSize ? String(editingSize.multiplier) : "",
  );
  const [order, setOrder] = useState(
    editingSize ? String(editingSize.order) : "1",
  );

  const handleSave = async () => {
    if (!label || !multiplier) {
      Alert.alert("Error", "Label and multiplier are required");
      return;
    }

    const isEdit = !!editingSize;

    const url = isEdit
      ? `${BASE_URL}/api/sizes/${editingSize._id}`
      : `${BASE_URL}/api/sizes`;

    const method = isEdit ? "PUT" : "POST";

    try {
      setSaving(true); //start spinner
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          label,
          multiplier: Number(multiplier),
          order: Number(order),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Error", data.message || "Operation failed");
        return;
      }

      Alert.alert(
        "Success ✅",
        isEdit ? "Size updated successfully" : "Size added successfully",
      );

      router.replace("/adminsizes");
    } catch (err) {
      console.log("SAVE SIZE ERROR:", err);
      Alert.alert("Error", "Something went wrong");
    } finally {
      setSaving(false); //stop spinner
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace("/adminsizes")}>
            <Ionicons name="arrow-back" size={24} color="#22543d" />
          </TouchableOpacity>

          <Text style={styles.title}>
            {editingSize ? "Edit Size" : "Add Size"}
          </Text>
        </View>

        {/* LABEL */}
        <Text style={styles.label}>Size Label</Text>
        <TextInput
          placeholder="e.g. Half KG, 500 g"
          value={label}
          onChangeText={setLabel}
          style={styles.input}
        />

        {/* MULTIPLIER */}
        <Text style={styles.label}>Multiplier</Text>
        <TextInput
          placeholder="e.g. 0.5, 1, 0.05"
          value={multiplier}
          onChangeText={setMultiplier}
          keyboardType="numeric"
          style={styles.input}
        />

        {/* ORDER */}
        <Text style={styles.label}>Order</Text>
        <TextInput
          placeholder="1, 2, 3..."
          value={order}
          onChangeText={setOrder}
          keyboardType="numeric"
          style={[styles.input, { marginBottom: 20 }]}
        />

        {/* SAVE BUTTON */}
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveText}>
              {editingSize ? "Update Size" : "Save Size"}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#eafbe7",
  },

  container: {
    padding: 16,
    paddingBottom: 40,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#22543d",
    marginLeft: 12,
  },

  label: {
    marginBottom: 6,
    fontWeight: "600",
    color: "#22543d",
  },

  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d1fae5",
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },

  saveBtn: {
    backgroundColor: "#22543d",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },

  saveText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
