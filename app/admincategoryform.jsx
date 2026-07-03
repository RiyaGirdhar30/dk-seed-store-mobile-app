import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
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

import { ActivityIndicator } from "react-native";

import { Ionicons } from "@expo/vector-icons";
// const BASE_URL = "http://172.21.112.206:5000";
const BASE_URL = "https://dk-seed-store-backend-1.onrender.com";

export default function AdminCategoryForm() {
  const router = useRouter();
  const { token } = useUser();

  const [saving, setSaving] = useState(false);

  const params = useLocalSearchParams();
  const editingCategory = params.category ? JSON.parse(params.category) : null;

  const [key, setKey] = useState(editingCategory?.key || "");
  const [title, setTitle] = useState(editingCategory?.title || "");
  const [order, setOrder] = useState(
    editingCategory ? String(editingCategory.order) : "0",
  );

  const handleSave = async () => {
    if (!key || !title) {
      Alert.alert("Error", "Key and Title are required");
      return;
    }

    const isEdit = !!editingCategory;

    const url = isEdit
      ? `${BASE_URL}/api/categories/${editingCategory._id}`
      : `${BASE_URL}/api/categories`;

    const method = isEdit ? "PUT" : "POST";

    setSaving(true); //start button spinner

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          key,
          title,
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
        isEdit
          ? "Category updated successfully"
          : "Category added successfully",
      );

      router.replace("/admincategories");
    } catch (err) {
      console.log("SAVE CATEGORY ERROR:", err);
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
          <TouchableOpacity onPress={() => router.replace("/admincategories")}>
            <Ionicons name="arrow-back" size={24} color="#22543d" />
          </TouchableOpacity>

          <Text style={styles.title}>
            {editingCategory ? "Edit Category" : "Add Category"}
          </Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Key (e.g. agricultural)"
          value={key}
          onChangeText={setKey}
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Title (e.g. Agricultural)"
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          style={styles.input}
          placeholder="Order (0, 1, 2...)"
          keyboardType="numeric"
          value={order}
          onChangeText={setOrder}
        />
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveText}>
              {editingCategory ? "Update Category" : "Save Category"}
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
    fontSize: 22,
    fontWeight: "700",
    color: "#22543d",
    marginLeft: 12,
  },

  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d1fae5",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },

  saveBtn: {
    backgroundColor: "#22543d",
    padding: 14,
    borderRadius: 10,
    marginTop: 8,
    alignItems: "center",
  },

  saveText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
