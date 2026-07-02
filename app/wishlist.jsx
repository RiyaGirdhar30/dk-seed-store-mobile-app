import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useWishlist } from "../contexts/wishlistContext";
import { useBag } from "../contexts/bagContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function Wishlist() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToBag,loadCart } = useBag(); 
  const router = useRouter();
  const params = useLocalSearchParams();

  const [quantities, setQuantities] = useState({});
  const [selectMode, setSelectMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const increaseQty = (id) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: (prev[id] || 1) + 1,
    }));
  };

  const decreaseQty = (id) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) - 1),
    }));
  };

  // BACK HANDLER
  const handleBack = () => {
    if (params.returnTo === "profile") {
      router.replace("/(tabs)/profile");
    } else {
      router.back();
    }
  };

  // TOGGLE SINGLE ITEM
  const toggleItem = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  // SELECT/DESELECT ALL
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectAll(false);
      setSelectedItems([]);
    } else {
      setSelectAll(true);
      setSelectedItems(wishlist.map((item) => String(item.id)));
    }
  };

  // ADD SELECTED ITEMS TO BAG
const addSelectedToBag = async () => {
  for (const wid of selectedItems) {
    const item = wishlist.find(w => String(w.id) === String(wid));
    if (!item) continue;

    console.log("bulk adding to bag", item.id);

    await addToBag({
      id: item.productId,            
      qty: quantities[item.id] || 1,
      size: item.size || "Full KG",
    });
  }

  router.push("/(tabs)/bag");
};
  return (
    <SafeAreaView style={styles.safe}>
      {/* HEADER */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1b4332" />
        </TouchableOpacity>

        <Text style={styles.header}>Wishlist</Text>

        {/* SELECT / DONE BUTTON */}
        {wishlist.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setSelectMode(!selectMode);
              setSelectedItems([]);
              setSelectAll(false);
            }}
          >
            <Text style={styles.selectBtn}>
              {selectMode ? "Done" : "Select"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* SELECT ALL CHECKBOX */}
      {selectMode && wishlist.length > 0 && (
        <TouchableOpacity style={styles.selectAllRow} onPress={toggleSelectAll}>
          <Text style={styles.checkbox}>
            {selectAll ? "☑" : "☐"}
          </Text>
          <Text style={styles.selectAllTxt}>Select All</Text>
        </TouchableOpacity>
      )}

      <View style={styles.container}>
        {wishlist.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Your wishlist is empty 😔</Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {wishlist.map((item) => {
              const id = String(item.id);
              const isSelected = selectedItems.includes(id);

               const productId = item.productId ?? item.id; // ✅ FIX

              return (
                <View key={`${id}-wishlist`} style={styles.card}>
                  {/* CHECKBOX */}
                  {selectMode && (
                    <TouchableOpacity
                      onPress={() => toggleItem(id)}
                      style={styles.checkboxBox}
                    >
                      <Text style={styles.checkboxText}>
                        {isSelected ? "☑" : "☐"}
                      </Text>
                    </TouchableOpacity>
                  )}

                  <Image source={item.img} style={styles.image} />

                  <View style={{ flex: 1 }}>
                    <Text style={styles.title}>{item.name}</Text>
                    <Text style={styles.price}>₹{item.price}</Text>

                    {/* Quantity Selector */}
                    <View style={styles.qtyRow}>
                      <TouchableOpacity
                        onPress={() => decreaseQty(item.id)}
                        style={styles.qtyBtn}
                      >
                        <Text style={styles.qtyText}>-</Text>
                      </TouchableOpacity>

                      <Text style={styles.qtyNumber}>
                        {quantities[item.id] || 1}
                      </Text>

                      <TouchableOpacity
                        onPress={() => increaseQty(item.id)}
                        style={styles.qtyBtn}
                      >
                        <Text style={styles.qtyText}>+</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Buttons */}
                    {!selectMode && (
                      <View style={styles.row}>
<TouchableOpacity
  style={styles.bagBtn}
  onPress={async () => {
    console.log("adding to bag", item.id);

    const success = await addToBag({
      id: item.productId,        
      qty: quantities[item.id] || 1,
      size: item.size || "Full KG",
    });

    if (success) {
      router.push("/(tabs)/bag");
    }
  }}
>
 <Text style={styles.bagBtnText}>Add to Bag</Text>
</TouchableOpacity>

      <TouchableOpacity
        onPress={() => removeFromWishlist(productId)}
            style={styles.removeBtn}
     >
          <Ionicons
                 name="trash-outline"
                  size={22}
                    color="#D12C2C"
          />
         </TouchableOpacity>
      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* ADD SELECTED BUTTON */}
      {selectMode && selectedItems.length > 0 && (
        <TouchableOpacity
          style={styles.addSelectedBtn}
          onPress={addSelectedToBag}
        >
          <Text style={styles.addSelectedTxt}>
            Add Selected to Bag ({selectedItems.length})
          </Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#E8F8E6",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#DFF2D9",
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 26,
    fontWeight: "700",
    color: "#0A5E2A",
    marginLeft: 12,
    flex: 1,
  },
  selectBtn: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0A5E2A",
  },
  selectAllRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    marginBottom: 10,
  },
  checkbox: {
    fontSize: 22,
    marginRight: 8,
  },
  selectAllTxt: {
    fontSize: 16,
    color: "#0A5E2A",
    fontWeight: "600",
  },
  container: {
    flex: 1,
    paddingHorizontal: 15,
  },
  emptyContainer: { flex: 1, alignItems: "center", marginTop: 50 },
  emptyText: { fontSize: 18, color: "gray" },
  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 12,
    marginBottom: 15,
    alignItems: "center",
    elevation: 2,
  },
  checkboxBox: {
    marginRight: 10,
  },
  checkboxText: {
    fontSize: 22,
  },
  image: { width: 90, height: 90, borderRadius: 10, marginRight: 12 },
  title: { fontSize: 17, fontWeight: "600", color: "#0A5E2A" },
  price: { fontSize: 15, color: "#0A5E2A", marginVertical: 4 },
  qtyRow: { flexDirection: "row", alignItems: "center", marginTop: 5 },
  qtyBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#DFF2D9",
    justifyContent: "center",
    alignItems: "center",
  },
  qtyText: { fontSize: 18, fontWeight: "700", color: "#0A5E2A" },
  qtyNumber: {
    paddingHorizontal: 10,
    fontSize: 16,
    fontWeight: "600",
    color: "#0A5E2A",
  },
  row: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  bagBtn: {
    flex: 1,
    backgroundColor: "#0A5E2A",
    paddingVertical: 10,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  bagBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  removeBtn: {
    backgroundColor: "#FFE5E5",
    padding: 10,
    borderRadius: 10,
  },

  addSelectedBtn: {
    backgroundColor: "#0A5E2A",
    paddingVertical: 14,
    alignItems: "center",
  },
  addSelectedTxt: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
});