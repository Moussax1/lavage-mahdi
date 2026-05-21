import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, FlatList, Share,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { C } from "../theme";

export default function ClientListScreen({ customers, onSelect, onBack }) {
  const [search, setSearch] = useState("");

  const filtered = customers.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.id.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  // Replicate ClientScreen's washesSinceLastFree logic to avoid modulo bugs
  const lastFreeIndex = (c) => ([...c.history].map((h, i) => h.free ? i : -1).filter(i => i >= 0).pop() ?? -1);
  const washesSinceLastFree = (c) => c.history.slice(lastFreeIndex(c) + 1).filter(h => !h.free).length;
  const paidWashes = (c) => c.history.filter(h => !h.free).length;
  const nextFreeIn = (c) => 5 - (washesSinceLastFree(c) % 5);

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={onBack} style={s.backBtn}>
          <MaterialIcons name="arrow-back" size={20} color={C.water} />
        </TouchableOpacity>
        <TouchableOpacity onPress={async () => {
          try {
            const assigned = customers || [];
            const payload = JSON.stringify(assigned, null, 2);
            await Share.share({ title: "Export clients", message: payload });
          } catch (e) { console.warn("Export error:", e); }
        }} style={[s.backBtn, { marginLeft: 8 }]}
        accessibilityLabel="Export clients">
          <MaterialIcons name="share" size={18} color={C.water} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>Clients</Text>
          <Text style={s.subtitle}>{customers.length} carte{customers.length !== 1 ? "s" : ""} assignée{customers.length !== 1 ? "s" : ""}</Text>
        </View>
      </View>

      <View style={s.searchRow}>
        <MaterialIcons name="search" size={20} color={C.gray} style={s.searchIcon} />
        <TextInput
          style={s.search}
          value={search}
          onChangeText={setSearch}
          placeholder="Rechercher par nom, ID ou téléphone..."
          placeholderTextColor={C.gray}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <MaterialIcons name="close" size={18} color={C.gray} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: c }) => {
          const paid = paidWashes(c);
          const washes = washesSinceLastFree(c);
          const freeReady = washes >= 5;
          return (
            <TouchableOpacity style={s.card} onPress={() => onSelect(c)} activeOpacity={0.8}>
              {/* Avatar */}
              <View style={[s.avatar, freeReady && s.avatarFree]}>
                <MaterialIcons name="person" size={22} color={freeReady ? C.navy : C.blue} />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={s.name}>{c.name}</Text>
                <View style={s.infoRow}>
                  <MaterialIcons name="credit-card" size={11} color={C.gray} />
                  <Text style={s.info}>{c.id}</Text>
                  <MaterialIcons name="phone" size={11} color={C.gray} />
                  <Text style={s.info}>{c.phone}</Text>
                </View>

                {/* Stamp mini bar */}
                <View style={s.miniStamps}>
                  {[1,2,3,4,5].map((n) => (
                    <View key={n} style={[s.miniDot, washes >= n && s.miniDotFilled]} />
                  ))}
                  <View style={[s.miniDot, s.miniStar, freeReady && s.miniStarReady]}>
                    <MaterialIcons name="star" size={8} color={freeReady ? C.navy : C.gold} />
                  </View>
                </View>
              </View>

              <View style={s.right}>
                {freeReady ? (
                  <View style={s.freeBadge}>
                    <MaterialIcons name="card-giftcard" size={12} color={C.green} />
                    <Text style={s.freeBadgeText}>Gratuit</Text>
                  </View>
                ) : (
                  <Text style={s.nextFree}>{nextFreeIn(c)} restant{nextFreeIn(c) > 1 ? "s" : ""}</Text>
                )}
                <MaterialIcons name="chevron-right" size={20} color={C.navyLt} />
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={s.empty}>
            <MaterialIcons name="person-search" size={48} color={C.navyLt} />
            <Text style={s.emptyText}>Aucun client trouvé</Text>
          </View>
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  container:      { flex: 1, backgroundColor: C.navy },
  header:         { flexDirection: "row", alignItems: "center", gap: 12, padding: 20, paddingBottom: 12 },
  backBtn:        { width: 36, height: 36, borderRadius: 10, backgroundColor: C.navyMid, alignItems: "center", justifyContent: "center" },
  title:          { color: C.white, fontSize: 20, fontWeight: "700", fontFamily: "Georgia" },
  subtitle:       { color: C.gray, fontSize: 12, marginTop: 2 },
  searchRow:      { flexDirection: "row", alignItems: "center", backgroundColor: C.navyMid, marginHorizontal: 16, borderRadius: 13, paddingHorizontal: 12, borderWidth: 1.5, borderColor: C.navyLt, marginBottom: 4 },
  searchIcon:     { marginRight: 6 },
  search:         { flex: 1, paddingVertical: 12, color: C.white, fontSize: 14 },
  card:           { backgroundColor: C.navyMid, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: C.navyLt, flexDirection: "row", alignItems: "center", gap: 12 },
  avatar:         { width: 44, height: 44, borderRadius: 13, backgroundColor: C.blue + "22", alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: C.blue + "44" },
  avatarFree:     { backgroundColor: C.green + "22", borderColor: C.green + "66" },
  name:           { color: C.white, fontSize: 15, fontWeight: "700", marginBottom: 3 },
  infoRow:        { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 6 },
  info:           { color: C.gray, fontSize: 11, marginRight: 6 },
  miniStamps:     { flexDirection: "row", gap: 4, alignItems: "center" },
  miniDot:        { width: 12, height: 12, borderRadius: 6, borderWidth: 1.5, borderColor: C.navyLt },
  miniDotFilled:  { backgroundColor: C.blue, borderColor: C.blue },
  miniStar:       { borderColor: C.gold, alignItems: "center", justifyContent: "center" },
  miniStarReady:  { backgroundColor: C.gold, borderColor: C.gold },
  right:          { alignItems: "flex-end", gap: 6 },
  freeBadge:      { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "#0a2a10", borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  freeBadgeText:  { color: C.green, fontSize: 11, fontWeight: "700" },
  nextFree:       { color: C.gray, fontSize: 11 },
  empty:          { alignItems: "center", paddingVertical: 40, gap: 12 },
  emptyText:      { color: C.gray, fontSize: 14 },
});
