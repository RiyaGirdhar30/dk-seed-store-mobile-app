import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useUser } from "../contexts/userContext";

import { Ionicons } from "@expo/vector-icons";

import { ActivityIndicator } from "react-native";

import * as ImagePicker from "expo-image-picker";
import { Image } from "react-native";


const BASE_URL = "http://172.21.112.206:5000";

export default function AdminBannerForm() {
  const router = useRouter();
  const { token } = useUser();
const [saving, setSaving] = useState(false);

  const [loading, setLoading] = useState(true);


  const [localImage, setLocalImage] = useState(null);
const [uploadingImage, setUploadingImage] = useState(false);

  const params = useLocalSearchParams();
  const editingBanner = params.banner
    ? JSON.parse(params.banner)
    : null;

  const [image, setImage] = useState(editingBanner?.image || "");
  const [category, setCategory] = useState(editingBanner?.category || "all");
  const [order, setOrder] = useState(
    editingBanner ? String(editingBanner.order) : "1"
  );

  const pickBannerImage = async () => {
  const permission =
    await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    Alert.alert("Permission required to access gallery");
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes:["images"],
    allowsEditing: true,
    quality: 0.7,
  });

  if (result.canceled) return;

  const imageUri = result.assets[0].uri;
  setLocalImage(imageUri);
  setUploadingImage(true);

 
  const formData = new FormData();
  formData.append("image", {
    uri: imageUri.startsWith("file://")
      ? imageUri
      : `file://${imageUri}`,
    name: "banner.jpg",
    type: "image/jpeg",
  });
  try {
    const res = await fetch(
      `${BASE_URL}/api/uploads/image`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    const data = await res.json();

    if (!res.ok) {
      Alert.alert("Image upload failed");
      return;
    }

    //Save Cloudinary URL
    setImage(data.url);
  } catch (err) {
    Alert.alert("Image upload error");
  } finally {
    setUploadingImage(false);
  }
};

  const handleSave = async () => {
    if (!image) {
      Alert.alert("Error", "Banner image is required");
      return;
    }

    const isEdit = !!editingBanner;

    const url = isEdit
      ? `${BASE_URL}/api/banners/${editingBanner._id}`
      : `${BASE_URL}/api/banners`;

    const method = isEdit ? "PUT" : "POST";

    setSaving(true);

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          image,
          category,
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
        isEdit ? "Banner updated successfully" : "Banner added successfully"
      );

      router.replace("/adminbanners");
    } catch (err) {
      console.log("SAVE BANNER ERROR:", err);
      Alert.alert("Error", "Something went wrong");
    }
    finally {
    setSaving(false);
  }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>

<View style={styles.header}>
  <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
    <Ionicons name="arrow-back" size={24} color="#22543d" />
  </TouchableOpacity>

  <Text style={styles.title}>
    {editingBanner ? "Edit Banner 🖼️" : "Add New Banner 🖼️"}
  </Text>
</View>

       <TouchableOpacity
  style={styles.imagePicker}
  onPress={pickBannerImage}
>
  {uploadingImage ? (
    <ActivityIndicator />
  ) : localImage || image ? (
    <Image
      source={{ uri: localImage || image }}
      style={styles.previewImage}
    />
  ) : (
    <Text style={styles.pickText}>Choose Banner Image</Text>
  )}
</TouchableOpacity>


        <TextInput
          style={styles.input}
          placeholder="Category (all / agriculture / vegetable)"
          value={category}
          onChangeText={setCategory}
        />

        <TextInput
          style={styles.input}
          placeholder="Order (1, 2, 3...)"
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
    <Text style={styles.saveBtnText}>
      {editingBanner ? "Update Banner" : "Save Banner"}
    </Text>
  )}
</TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace("/adminbanners")}>
          <Text style={styles.backText}>← Back</Text>
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
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#22543d",
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
  saveBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  backText: {
    marginTop: 16,  
    textAlign: "center",
    fontSize: 14,
    color: "#22543d",
    fontWeight: "600",
  },


  header: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 20,
},

backBtn: {
  marginRight: 10,
  padding: 4,
},
imagePicker: {
  backgroundColor: "#fff",
  height: 160,
  borderRadius: 14,
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 16,
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