import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { C } from "../theme";

export default function NetworkBanner({ isOnline, syncing, pendingCount }) {
  const anim = useRef(new Animated.Value(0)).current;
  const visible = !isOnline || syncing;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: visible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [-40, 0] });

  if (!visible && pendingCount === 0) return null;

  return (
    <Animated.View style={[s.banner, { transform: [{ translateY }] }, !isOnline ? s.offline : s.syncing]}>
      <MaterialIcons
        name={!isOnline ? "wifi-off" : "sync"}
        size={15}
        color="#fff"
      />
      <Text style={s.text}>
        {!isOnline
          ? `Hors ligne · ${pendingCount} action${pendingCount > 1 ? "s" : ""} en attente`
          : "Synchronisation en cours..."}
      </Text>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  banner:   { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 7, paddingHorizontal: 16, gap: 8 },
  offline:  { backgroundColor: "#3a1a1a" },
  syncing:  { backgroundColor: "#1a2a3a" },
  text:     { color: "#fff", fontSize: 12, fontWeight: "600" },
});
