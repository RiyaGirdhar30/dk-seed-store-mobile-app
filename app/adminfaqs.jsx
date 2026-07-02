import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "../contexts/userContext";

const BASE_URL = "http://172.21.112.206:5000";

export default function ManageFAQs() {
  const router = useRouter();
  const { token } = useUser();

  const [saving, setSaving] = useState(false);

  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [editId, setEditId] = useState(null);

  // 🔹 Fetch FAQs
  const fetchFAQs = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/help`);
      const data = await res.json();
      setFaqs(data);
    } catch (err) {
      console.log("FAQ fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFAQs();
  }, []);

  //Add / Edit FAQ
  const saveFAQ = async () => {
    if (!question || !answer) {
      Alert.alert("Error", "Question and answer required");
      return;
    }

    const url = editId
      ? `${BASE_URL}/api/help/${editId}`
      : `${BASE_URL}/api/help`;

    const method = editId ? "PUT" : "POST";

    setSaving(true); //start spinner

    try {
      await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ question, answer }),
      });

      setModalVisible(false);
      setQuestion("");
      setAnswer("");
      setEditId(null);
      fetchFAQs();
    } catch (err) {
      Alert.alert("Error", "Failed to save FAQ");
    } finally {
      setSaving(false); //stop spinner
    }
  };

  // 🔹 Delete FAQ
  const deleteFAQ = async (id) => {
    Alert.alert("Confirm", "Delete this FAQ?", [
      { text: "Cancel" },
      {
        text: "Delete",
        onPress: async () => {
          await fetch(`${BASE_URL}/api/help/${id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          fetchFAQs();
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator size="large" color="#22543d" />
        <Text style={{ textAlign: "center", marginTop: 8 }}>Loading FAQs…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1b4332" />
        </TouchableOpacity>
        <Text style={styles.title}>Manage FAQs</Text>
      </View>

      {/* ADD FAQ */}
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={styles.addText}>Add FAQ</Text>
      </TouchableOpacity>

      {/* FAQ LIST */}
      <FlatList
        data={faqs}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.q}>Q: {item.question}</Text>
            <Text style={styles.a}>A: {item.answer}</Text>

            <View style={styles.actions}>
              <TouchableOpacity
                onPress={() => {
                  setQuestion(item.question);
                  setAnswer(item.answer);
                  setEditId(item._id);
                  setModalVisible(true);
                }}
              >
                <Text style={styles.edit}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => deleteFAQ(item._id)}>
                <Text style={styles.delete}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* MODAL */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>
              {editId ? "Edit FAQ" : "Add FAQ"}
            </Text>

            <TextInput
              placeholder="Question"
              value={question}
              onChangeText={setQuestion}
              style={styles.input}
            />

            <TextInput
              placeholder="Answer"
              value={answer}
              onChangeText={setAnswer}
              style={[styles.input, { height: 80 }]}
              multiline
            />

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={saveFAQ}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveText}>Save</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => {
                setModalVisible(false);
                setQuestion("");
                setAnswer("");
                setEditId(null);
              }}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#eafbe7", padding: 14 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  title: { fontSize: 22, fontWeight: "800", marginLeft: 10, color: "#1b4332" },

  addBtn: {
    flexDirection: "row",
    backgroundColor: "#1b4332",
    padding: 12,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  addText: { color: "#fff", fontWeight: "700", marginLeft: 6 },

  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
  },
  q: { fontWeight: "700", marginBottom: 4 },
  a: { color: "#555" },

  actions: { flexDirection: "row", marginTop: 10 },
  edit: { color: "#1b4332", marginRight: 20, fontWeight: "700" },
  delete: { color: "#b00020", fontWeight: "700" },

  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 20,
  },
  modal: { backgroundColor: "#fff", borderRadius: 16, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: "800", marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },
  saveBtn: {
    backgroundColor: "#1b4332",
    padding: 12,
    borderRadius: 20,
    alignItems: "center",
  },
  saveText: { color: "#fff", fontWeight: "700" },

  cancelBtn: {
    marginTop: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1b4332",
    alignItems: "center",
  },

  cancelText: {
    color: "#1b4332",
    fontWeight: "700",
    fontSize: 15,
  },
});
