//PERFECT
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "../../contexts/userContext"; // ← using global user context

import { useState } from "react";
import * as ImagePicker from "expo-image-picker";


export default function Profile() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);

  const { user, logout,token,updateProfilePhoto} = useUser(); // ← user & logout from context
  const [localImage, setLocalImage] = useState(null);

const pickImage = async () => {
  const permission =
    await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    alert("Permission required to access gallery");
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
  });

  if (result.canceled) return;

  const imageUri = result.assets[0].uri;
  setLocalImage(imageUri);

  const formData = new FormData();
  formData.append("image", {
    uri: imageUri,
    name: "profile.jpg",
    type: "image/jpeg",
  });

  setUploading(true); //START LOADER

  try {
    const res = await fetch(
      "http://172.21.112.206:5000/api/users/update-profile-photo",
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Image upload failed");
      return;
    }

    updateProfilePhoto(data.profileImage);
  } catch (err) {
    console.log("Upload error:", err);
    alert("Something went wrong");
  } finally {
    setUploading(false); //STOP LOADER
  }
};

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/*HEADER*/}
        <View style={styles.header}>
<TouchableOpacity onPress={pickImage}>
  {uploading ? (
    <View style={styles.skeleton} />
  ) : localImage || user?.profileImage ? (
    <Image
      source={{ uri: localImage || user.profileImage }}
      style={styles.avatar}
    />
  ) : (
    <View style={styles.defaultAvatar}>
      <Text style={styles.avatarText}>
        {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
      </Text>
    </View>
  )}
</TouchableOpacity>


  {/*REMOVE PHOTO BUTTON */}
  {user?.profileImage && !uploading && (
    <TouchableOpacity
      onPress={async () => {
        setUploading(true);

        try {
          await fetch(
            "http://172.21.112.206:5000/api/users/remove-profile-photo",
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          updateProfilePhoto("");
          setLocalImage(null);
        } catch (e) {
          alert("Failed to remove photo");
        } finally {
          setUploading(false);
        }
      }}
    >
      <Text style={{ color: "#b00020", marginTop: 6 }}>
        Remove Photo
      </Text>
    </TouchableOpacity>
  )}

          <Text style={styles.userName}>
            {user ? user.name || "User" : "Guest User"}
          </Text>

          <Text style={styles.subText}>
            {user ? user.email : "Please sign in to continue"}
          </Text>
        </View>

        {/*GRID MENU*/}
        <View style={styles.grid}>
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: "/myorders",
                params: { returnTo: "profile" },
              })
            }
          >
            <Ionicons name="bag-handle" size={26} color="#1b4332" />
            <Text style={styles.cardText}>My Orders</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: "/wishlist",
                params: { returnTo: "profile" },
              })
            }
          >
            <Ionicons name="heart" size={26} color="#1b4332" />
            <Text style={styles.cardText}>Saved Seeds</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push("/help")}
          >
            <Ionicons name="help-circle" size={26} color="#1b4332" />
            <Text style={styles.cardText}>Help Center</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push("/settings")}
          >
            <Ionicons name="settings" size={26} color="#1b4332" />
            <Text style={styles.cardText}>Settings</Text>
          </TouchableOpacity>
        </View>

        {/*  ADMIN PANEL BUTTON*/}
        {user?.email === "admin@gmail.com" && (
          <TouchableOpacity
            style={styles.adminBtn}
            onPress={() => router.push("/adminorders")}
          >
            <Text style={styles.adminText}>Admin Panel</Text>
          </TouchableOpacity>
        )}

        {/*LOGIN / LOGOUT*/}
        {user ? (
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={async () => {
              await logout();                // clear user + token
              alert("Logged out successfully");
              router.replace("/(tabs)/home"); // show guest mode
            }}
          >
            <Text style={styles.btnText}>Logout</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              style={styles.loginBtn}
              onPress={() => router.push("/auth/signin")}
            >
              <Text style={styles.btnText}>Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.signupBtn}
              onPress={() => router.push("/auth/signup")}
            >
              <Text style={styles.btnText}>Sign Up</Text>
            </TouchableOpacity>
          </>
        )}

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#eafbe7",
  },

  container: {
    flex: 1,
    paddingTop: 50,     
    padding: 16,        
  },

  header: {
    alignItems: "center",
    marginBottom: 30,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 10,
  },

  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1b4332",
  },

  subText: {
    color: "#40916c",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
    elevation: 4,
  },

  cardText: {
    marginTop: 8,
    fontWeight: "700",
    color: "#1b4332",
  },

  /* ================= ADMIN BUTTON ================= */
  adminBtn: {
    marginTop: 20,
    backgroundColor: "#1b4332",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  adminText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  loginBtn: {
    backgroundColor: "#1b4332",
    padding: 14,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 20,
  },

  signupBtn: {
    backgroundColor: "#2d6a4f",
    padding: 14,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 12,
  },

  logoutBtn: {
    backgroundColor: "#b00020",
    padding: 14,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 24,
  },

  btnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  defaultAvatar: {
  width: 90,
  height: 90,
  borderRadius: 45,
  backgroundColor: "#1b4332",
  justifyContent: "center",
  alignItems: "center",
  marginBottom: 10,
},

avatarText: {
  color: "#fff",
  fontSize: 36,
  fontWeight: "bold",
},
skeleton: {
  width: 90,
  height: 90,
  borderRadius: 45,
  backgroundColor: "#cce3d3",
  marginBottom: 10,
},

});








