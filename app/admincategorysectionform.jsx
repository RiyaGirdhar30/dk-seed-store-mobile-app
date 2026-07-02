import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
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

const BASE_URL = "http://172.21.112.206:5000";

export default function AdminCategorySectionForm() {
  const router = useRouter();
  const { token } = useUser();

  const [saving, setSaving] = useState(false);

  const [localImage, setLocalImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const params = useLocalSearchParams();

  let editingSection = null;

  if (params.section && params.section !== "null") {
    editingSection = JSON.parse(params.section);
  }

  const [key, setKey] = useState(editingSection?.key || "");
  const [name, setName] = useState(editingSection?.name || "");
  const [image, setImage] = useState(
    editingSection && editingSection.image ? editingSection.image : "",
  );
  const [order, setOrder] = useState(
    editingSection ? String(editingSection.order) : "0",
  );

  useEffect(() => {
    if (editingSection?.image) {
      setLocalImage(editingSection.image);
    }
  }, []);

  const pickSectionImage = async () => {
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
      name: "category-section.jpg",
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

      setImage(data.url); //Cloudinary URL
    } catch (err) {
      Alert.alert("Image upload error");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!key || !name || !image) {
      Alert.alert("Error", "Key, Name and Image are required");
      return;
    }

    const isEdit = !!editingSection;

    const url = isEdit
      ? `${BASE_URL}/api/category-sections/${editingSection._id}`
      : `${BASE_URL}/api/category-sections`;

    const method = isEdit ? "PUT" : "POST";

    setSaving(true); //start spinner

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          key,
          name,
          image,
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
          ? "Category section updated successfully"
          : "Category section added successfully",
      );

      router.replace("/admincategorysections");
    } catch (err) {
      console.log("SAVE CATEGORY SECTION ERROR:", err);
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
          <TouchableOpacity
            onPress={() => router.replace("/admincategorysections")}
          >
            <Ionicons name="arrow-back" size={24} color="#22543d" />
          </TouchableOpacity>

          <Text style={styles.title}>
            {editingSection ? "Edit Category Section" : "Add Category Section"}
          </Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Key (e.g. agriculture)"
          value={key}
          onChangeText={setKey}
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Display Name (e.g. Agriculture Seeds)"
          value={name}
          onChangeText={setName}
        />
        <TouchableOpacity style={styles.imagePicker} onPress={pickSectionImage}>
          {uploadingImage ? (
            <ActivityIndicator />
          ) : localImage || image ? (
            <Image
              source={{ uri: localImage || image }}
              style={styles.previewImage}
            />
          ) : (
            <Text style={styles.pickText}>Choose Section Image</Text>
          )}
        </TouchableOpacity>

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
          disabled={saving || uploadingImage}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveText}>
              {editingSection ? "Update Section" : "Save Section"}
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
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#d1fae5",
  },

  saveBtn: {
    backgroundColor: "#1b4332",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
  },

  saveText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  imagePicker: {
    backgroundColor: "#fff",
    height: 160,
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
    color: "#22543d",
    fontWeight: "600",
  },
});
