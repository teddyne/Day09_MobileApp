import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Badge } from "./Badge";
import { colors } from "../theme";

interface Props {
  count: number;
  onPress?: () => void;
}

// Nút giỏ hàng nổi: position absolute + Badge góc trên-phải
export function FloatingCartButton({ count, onPress }: Props) {
  return (
    <Pressable style={styles.fab} onPress={onPress} accessibilityLabel="Giỏ hàng">
      <Ionicons name="cart" size={26} color="#fff" />
      <Badge count={count} style={styles.badge} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: { position: "absolute", right: 16, bottom: 16, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.cyan, alignItems: "center", justifyContent: "center", elevation: 6, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
  badge: { position: "absolute", top: -4, right: -4 },
});
