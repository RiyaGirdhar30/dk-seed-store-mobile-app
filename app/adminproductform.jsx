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

import { Ionicons } from "@expo/vector-icons";

import { ActivityIndicator } from "react-native";

import * as ImagePicker from "expo-image-picker";
import { Image } from "react-native";

// const BASE_URL = "http://172.21.112.206:5000";
const BASE_URL = "https://dk-seed-store-backend-1.onrender.com";

export default function AdminProductForm() {
  const router = useRouter();
  const { token } = useUser();

  const [saving, setSaving] = useState(false);

  const [localImage, setLocalImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const params = useLocalSearchParams();
  const editingProduct = params.product ? JSON.parse(params.product) : null;

  //states
  const [name, setName] = useState(editingProduct?.name || "");
  const [price, setPrice] = useState(
    editingProduct ? String(editingProduct.price) : "",
  );
  const [stock, setStock] = useState(
    editingProduct ? String(editingProduct.stock) : "",
  );
  const [category, setCategory] = useState(editingProduct?.category || "");
  const [image, setImage] = useState(editingProduct?.image || "");
  const [description, setDescription] = useState(
    editingProduct?.description || "",
  );

  const [rating, setRating] = useState(
    editingProduct ? String(editingProduct.rating) : "4.5",
  );

  const pickProductImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission required to access gallery");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.7,
    });

    if (result.canceled) return;

    const imageUri = result.assets[0].uri;
    setLocalImage(imageUri);
    setUploadingImage(true);

    const formData = new FormData();
    formData.append("image", {
      uri: imageUri.startsWith("file://") ? imageUri : `file://${imageUri}`,
      name: "product.jpg",
      type: "image/jpeg",
    });

    try {
      const res = await fetch(`${BASE_URL}/api/uploads/image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Image upload failed");
        return;
      }

      setImage(data.url);
    } catch (err) {
      Alert.alert("Image upload error");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!name || !price || !stock || !image) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    const isEdit = !!editingProduct;

    const url = isEdit
      ? `${BASE_URL}/api/products/${editingProduct._id}`
      : `${BASE_URL}/api/products`;

    const method = isEdit ? "PUT" : "POST";

    try {
      setSaving(true);
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          price: Number(price),
          stock: Number(stock),
          category,
          image,
          description,
          rating: Number(rating), // ⭐ ADD THIS
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Error", data.message || "Operation failed");
        return;
      }

      Alert.alert(
        "Success ✅",
        isEdit ? "Product updated successfully" : "Product added successfully",
      );

      router.replace("/adminproducts");
    } catch (err) {
      console.log("SAVE PRODUCT ERROR:", err);
      Alert.alert("Error", "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace("/adminproducts")}>
            <Ionicons name="arrow-back" size={24} color="#1b4332" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            {editingProduct ? "Edit Product ✏️" : "Add New Product 🌱"}
          </Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Product Name"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={styles.input}
          placeholder="Price"
          keyboardType="numeric"
          value={price}
          onChangeText={setPrice}
        />

        <TextInput
          style={styles.input}
          placeholder="Stock"
          keyboardType="numeric"
          value={stock}
          onChangeText={setStock}
        />

        <TextInput
          style={styles.input}
          placeholder="Rating (0 - 5)"
          keyboardType="numeric"
          value={rating}
          onChangeText={setRating}
        />

        <TextInput
          style={styles.input}
          placeholder="Category"
          value={category}
          onChangeText={setCategory}
        />

        <TouchableOpacity style={styles.imagePicker} onPress={pickProductImage}>
          {uploadingImage ? (
            <ActivityIndicator />
          ) : localImage || image ? (
            <Image
              source={{ uri: localImage || image }}
              style={styles.previewImage}
            />
          ) : (
            <Text style={styles.pickText}>Choose Product Image</Text>
          )}
        </TouchableOpacity>

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Description"
          multiline
          value={description}
          onChangeText={setDescription}
        />
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
          disabled={saving || uploadingImage}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>
              {editingProduct ? "Update Product" : "Save Product"}
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
    padding: 20,
    paddingBottom: 40,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1b4332",
    marginLeft: 12,
  },

  input: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#d1fae5",
  },

  textArea: {
    height: 100,
    textAlignVertical: "top",
  },

  saveBtn: {
    backgroundColor: "#2d6a4f",
    padding: 16,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 10,
  },

  saveBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  imagePicker: {
    backgroundColor: "#fff",
    height: 180,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#d1fae5",
  },

  previewImage: {
    width: "100%",
    height: "100%",
    borderRadius: 14,
  },

  pickText: {
    color: "#1b4332",
    fontWeight: "600",
  },
});
