import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import {useAddress} from "../contexts/addressContext";
import { useLocalSearchParams } from "expo-router";

import { useUser} from "../contexts/userContext";

export default function Address() {
  const router = useRouter();
const {user}=useUser();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");

  const {updateAddress}=useAddress();

  const params = useLocalSearchParams();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>

        {/* ✅ BACK BUTTON */}
         <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1b4332" />
        </TouchableOpacity>

        <Text style={styles.title}>My Address 📍</Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          keyboardType="numeric"
          value={phone}
          onChangeText={setPhone}
        />

        <TextInput
          style={styles.input}
          placeholder="Full Address"
          multiline
          value={address}
          onChangeText={setAddress}
        />

        <TextInput
          style={styles.input}
          placeholder="City"
          value={city}
          onChangeText={setCity}
        />

        <TextInput
          style={styles.input}
          placeholder="Pincode"
          keyboardType="numeric"
          value={pincode}
          onChangeText={setPincode}
        />

        {/*SAVE BUTTON */}
        <TouchableOpacity style={styles.saveBtn}

        onPress={() => {
  if (!name || !phone || !address || !city || !pincode) {
    alert("Please fill all fields");
    return;
  }

   updateAddress({
    name,
    phone,
    address:address,
    city,
    pincode,
  });

  alert("Address Saved Successfully ✅");
if (params.from === "checkout") {
      router.back(); 
    } else {
      router.replace("/settings");
    }
  }}   
        >
          <Text style={styles.btnText}>Save Address</Text>
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
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },

  backBtn: {
    marginRight: 12,
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1b4332",
  },

  input: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
  },

  saveBtn: {
    backgroundColor: "#1b4332",
    padding: 14,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 20,
  },

  btnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});