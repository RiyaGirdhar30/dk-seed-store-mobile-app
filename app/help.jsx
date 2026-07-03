import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HelpCenter() {
  const router = useRouter();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const res = await fetch("https://dk-seed-store-backend-1.onrender.com/api/help");
        const data = await res.json();
        setFaqs(data);
      } catch (err) {
        console.log("FAQ fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFAQs();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container}>
        {/*Back Arrow & Title*/}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push("/(tabs)/profile")}>
            <Ionicons name="arrow-back" size={24} color="#1b4332" />
          </TouchableOpacity>
          <Text style={styles.title}>Help Center 🆘</Text>
        </View>

        {/*FAQ SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

          {loading ? (
            <Text style={styles.answer}>Loading FAQs...</Text>
          ) : faqs.length === 0 ? (
            <Text style={styles.answer}>No FAQs available.</Text>
          ) : (
            faqs.map((item) => (
              <View key={item._id}>
                <Text style={styles.faq}>• {item.question}</Text>
                <Text style={styles.answer}>{item.answer}</Text>
              </View>
            ))
          )}
        </View>

        {/*CONTACT SUPPORT */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Support</Text>

          <TouchableOpacity
            style={styles.contactBtn}
            onPress={() => Linking.openURL("tel:+919999999999")}
          >
            <Ionicons name="call" size={20} color="#fff" />
            <Text style={styles.contactText}> Call Support</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactBtn}
            onPress={() => Linking.openURL("https://wa.me/919999999999")}
          >
            <Ionicons name="logo-whatsapp" size={20} color="#fff" />
            <Text style={styles.contactText}> WhatsApp Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactBtn}
            onPress={() => Linking.openURL("mailto:support@dkseedstore.com")}
          >
            <Ionicons name="mail" size={20} color="#fff" />
            <Text style={styles.contactText}> Email Support</Text>
          </TouchableOpacity>
        </View>

        {/* ABOUT APP*/}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About DK Seed Store</Text>
          <Text style={styles.aboutText}>
            DK Seed Store provides high-quality agricultural and vegetable seeds
            for farmers and home gardeners. We ensure best germination and fast
            delivery.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#eafbe7",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  container: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1b4332",
    marginLeft: 12,
    flexShrink: 1,
  },
  section: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
    color: "#1b4332",
  },
  faq: {
    fontWeight: "700",
    marginTop: 6,
  },
  answer: {
    color: "#40916c",
    marginBottom: 8,
  },
  contactBtn: {
    flexDirection: "row",
    backgroundColor: "#1b4332",
    padding: 12,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  contactText: {
    color: "#fff",
    fontWeight: "700",
  },
  aboutText: {
    color: "#40916c",
    lineHeight: 20,
  },
});
