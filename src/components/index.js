import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { C } from "../theme";

// ── Price Selector ─────────────────────────────────────────────────────────────
export function PriceSelector({ selected, onChange, isFree = false }) {
  const options = [
    { price: 10, label: "Petite voiture",      icon: "directions-car" },
    { price: 15, label: "Grande voiture / SUV", icon: "directions-car" },
  ];

  return (
    <View>
      <Text style={s.sectionLabel}>Type de véhicule</Text>
      <View style={{ flexDirection: "row", gap: 10 }}>
        {options.map(({ price, label, icon }, idx) => {
          const active = selected === price;
          return (
            <TouchableOpacity
              key={price}
              onPress={() => onChange(price)}
              style={[s.priceCard, active && s.priceCardActive]}
              activeOpacity={0.8}
            >
              <View style={[s.priceIconBox, active && s.priceIconBoxActive]}>
                <MaterialIcons
                  name={icon}
                  size={idx === 1 ? 28 : 22}
                  color={active ? "#fff" : C.gray}
                />
              </View>
              <View style={s.priceInfo}>
                <Text style={[s.priceLabel, active && s.priceLabelActive]} numberOfLines={2}>
                  {label}
                </Text>
                {isFree ? (
                  <View style={s.freeRow}>
                    <Text style={s.priceStrike}>{price} TND</Text>
                    <Text style={s.freeTag}>GRATUIT</Text>
                  </View>
                ) : (
                  <Text style={[s.priceValue, active && s.priceValueActive]}>
                    {price} TND
                  </Text>
                )}
              </View>
              {active && (
                <View style={s.checkMark}>
                  <MaterialIcons name="check" size={12} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  sectionLabel:       { color: C.grayLt, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10, fontWeight: "600" },
  priceCard:          { flex: 1, borderRadius: 14, borderWidth: 2, borderColor: C.navyLt, backgroundColor: C.navyMid, padding: 12, gap: 8, position: "relative" },
  priceCardActive:    { borderColor: C.blue, backgroundColor: C.blue + "15" },
  priceIconBox:       { width: 44, height: 44, borderRadius: 12, backgroundColor: C.navyLt, alignItems: "center", justifyContent: "center" },
  priceIconBoxActive: { backgroundColor: C.blue },
  priceInfo:          { gap: 3 },
  priceLabel:         { color: C.gray, fontSize: 11, lineHeight: 15 },
  priceLabelActive:   { color: C.white },
  priceValue:         { color: C.blue, fontSize: 18, fontWeight: "700" },
  priceValueActive:   { color: C.white },
  freeRow:            { flexDirection: "row", alignItems: "center", gap: 6 },
  priceStrike:        { color: C.gray, fontSize: 11, textDecorationLine: "line-through" },
  freeTag:            { color: C.green, fontWeight: "700", fontSize: 13 },
  checkMark:          { position: "absolute", top: 8, right: 8, width: 18, height: 18, borderRadius: 9, backgroundColor: C.blue, alignItems: "center", justifyContent: "center" },
});