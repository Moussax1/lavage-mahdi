import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Modal, Share, useWindowDimensions,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { MaterialIcons } from "@expo/vector-icons";
import { C } from "../theme";

const COLUMNS = 3;
const GAP = 10;
const PADDING = 20;

export default function QRExportScreen({ customers, onBack }) {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter]     = useState("all");
  const { width } = useWindowDimensions();

  // Exact card width so 3 columns are always perfectly equal
  const cardWidth = (width - PADDING * 2 - GAP * (COLUMNS - 1)) / COLUMNS;
  const qrSize = cardWidth - 28; // padding inside card

  const filtered = customers.filter(c => {
    if (filter === "assigned")   return c.assigned;
    if (filter === "unassigned") return !c.assigned;
    return true;
  });

  const handleShare = async (customer) => {
    try {
      await Share.share({
        message: `Carte Fidélité — Lavage de Mahdi\n${customer.assigned ? `Client : ${customer.name}\n` : ""}ID Carte : ${customer.id}`,
        title: `Carte ${customer.id}`,
      });
    } catch (e) {}
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.navy }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[s.body, { paddingHorizontal: PADDING }]}>
          <TouchableOpacity onPress={onBack} style={s.backBtn}>
            <MaterialIcons name="arrow-back" size={20} color={C.water} />
            <Text style={s.backText}>Retour</Text>
          </TouchableOpacity>

          <Text style={s.title}>QR Codes</Text>
          <Text style={s.subtitle}>Appuyez sur une carte pour l'agrandir.</Text>

          {/* Filter tabs */}
          <View style={s.filterRow}>
            {[
              { key: "all",        label: `Toutes (${customers.length})` },
              { key: "unassigned", label: `Libres (${customers.filter(c => !c.assigned).length})` },
              { key: "assigned",   label: `Assignées (${customers.filter(c => c.assigned).length})` },
            ].map(f => (
              <TouchableOpacity
                key={f.key}
                style={[s.filterBtn, filter === f.key && s.filterBtnActive]}
                onPress={() => setFilter(f.key)}
              >
                <Text style={[s.filterText, filter === f.key && s.filterTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Grid — fixed equal column widths */}
          <View style={s.grid}>
            {filtered.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={[s.qrCard, { width: cardWidth }, !c.assigned && s.qrCardFree]}
                onPress={() => setSelected(c)}
                activeOpacity={0.75}
              >
                <View style={s.qrWrapper}>
                  <QRCode value={c.id} size={qrSize} color={C.navy} backgroundColor="#ffffff" />
                </View>
                <Text style={s.qrId}>{c.id}</Text>
                <Text style={s.qrName} numberOfLines={1}>
                  {c.assigned ? c.name?.split(" ")[0] : "—"}
                </Text>
                <View style={[s.qrStatusBadge, c.assigned ? s.qrStatusAssigned : s.qrStatusFree]}>
                  <MaterialIcons
                    name={c.assigned ? "person" : "person-outline"}
                    size={9}
                    color={c.assigned ? C.blue : C.green}
                  />
                  <Text style={[s.qrStatusText, c.assigned ? s.qrStatusTextAssigned : s.qrStatusTextFree]}>
                    {c.assigned ? "Assignée" : "Libre"}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={s.tipBox}>
            <MaterialIcons name="info-outline" size={15} color="#80b850" />
            <Text style={s.tipText}>
              Appuyez sur une carte pour l'agrandir et faire une capture d'écran.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Full screen modal */}
      <Modal
        visible={!!selected}
        transparent
        animationType="fade"
        onRequestClose={() => setSelected(null)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <View style={s.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={s.modalName}>
                  {selected?.assigned ? selected.name : "Carte non assignée"}
                </Text>
                <Text style={s.modalPhone}>
                  {selected?.assigned ? (selected.phone || selected.id) : selected?.id}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelected(null)} style={s.closeBtn}>
                <MaterialIcons name="close" size={18} color={C.gray} />
              </TouchableOpacity>
            </View>

            <View style={s.modalQR}>
              <View style={s.qrBigWrapper}>
                {selected && (
                  <QRCode value={selected.id} size={220} color={C.navy} backgroundColor="#ffffff" />
                )}
              </View>
            </View>

            <View style={s.modalIdBox}>
              <Text style={s.modalIdLabel}>ID CARTE</Text>
              <Text style={s.modalId}>{selected?.id}</Text>
            </View>

            <View style={s.modalBrand}>
              <MaterialIcons name="local-car-wash" size={16} color={C.water} />
              <Text style={s.modalBrandText}>Lavage de Mahdi</Text>
            </View>
            <Text style={s.modalBrandSub}>5 lavages = 1 gratuit</Text>

            <View style={s.modalActions}>
              <TouchableOpacity style={s.shareBtn} onPress={() => handleShare(selected)} activeOpacity={0.85}>
                <MaterialIcons name="share" size={18} color="#fff" />
                <Text style={s.shareBtnText}>Partager cette carte</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.closeModalBtn} onPress={() => setSelected(null)} activeOpacity={0.85}>
                <Text style={s.closeModalBtnText}>Fermer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  body:                  { paddingTop: 20, paddingBottom: 100 },
  backBtn:               { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 16 },
  backText:              { color: C.water, fontSize: 14 },
  title:                 { color: C.white, fontSize: 20, fontWeight: "700", fontFamily: "Georgia", marginBottom: 4 },
  subtitle:              { color: C.gray, fontSize: 13, marginBottom: 14 },
  filterRow:             { flexDirection: "row", gap: 8, marginBottom: 16 },
  filterBtn:             { flex: 1, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: C.navyLt, alignItems: "center" },
  filterBtnActive:       { borderColor: C.blue, backgroundColor: C.blue + "22" },
  filterText:            { color: C.gray, fontSize: 11, fontWeight: "600" },
  filterTextActive:      { color: C.blue },
  grid:                  { flexDirection: "row", flexWrap: "wrap", gap: GAP, marginBottom: 16 },
  qrCard:                { backgroundColor: C.navyMid, borderRadius: 12, padding: 10, alignItems: "center", gap: 5, borderWidth: 1, borderColor: C.navyLt },
  qrCardFree:            { borderColor: C.green + "44" },
  qrWrapper:             { backgroundColor: "#fff", padding: 4, borderRadius: 6 },
  qrId:                  { color: C.white, fontSize: 10, fontWeight: "700", fontFamily: "monospace" },
  qrName:                { color: C.gray, fontSize: 9, textAlign: "center" },
  qrStatusBadge:         { flexDirection: "row", alignItems: "center", gap: 2, borderRadius: 20, paddingHorizontal: 5, paddingVertical: 2 },
  qrStatusAssigned:      { backgroundColor: C.blue + "22" },
  qrStatusFree:          { backgroundColor: C.green + "22" },
  qrStatusText:          { fontSize: 8, fontWeight: "700" },
  qrStatusTextAssigned:  { color: C.blue },
  qrStatusTextFree:      { color: C.green },
  tipBox:                { backgroundColor: "#0d2010", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#2a5a10", flexDirection: "row", alignItems: "center", gap: 8 },
  tipText:               { color: "#80b850", fontSize: 13, flex: 1 },
  modalOverlay:          { flex: 1, backgroundColor: "rgba(0,0,0,0.85)", alignItems: "center", justifyContent: "center", padding: 20 },
  modalCard:             { backgroundColor: C.navyMid, borderRadius: 24, padding: 24, width: "100%", maxWidth: 380, borderWidth: 1, borderColor: C.navyLt },
  modalHeader:           { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
  modalName:             { color: C.white, fontSize: 17, fontWeight: "700", fontFamily: "Georgia" },
  modalPhone:            { color: C.gray, fontSize: 13, marginTop: 2 },
  closeBtn:              { width: 32, height: 32, borderRadius: 16, backgroundColor: C.navyLt, alignItems: "center", justifyContent: "center" },
  modalQR:               { alignItems: "center", marginBottom: 20 },
  qrBigWrapper:          { backgroundColor: "#fff", padding: 12, borderRadius: 12 },
  modalIdBox:            { backgroundColor: C.navyLt, borderRadius: 12, padding: 12, alignItems: "center", marginBottom: 12 },
  modalIdLabel:          { color: C.gray, fontSize: 10, letterSpacing: 1.5, marginBottom: 4 },
  modalId:               { color: C.blue, fontSize: 24, fontWeight: "700", fontFamily: "monospace" },
  modalBrand:            { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 2 },
  modalBrandText:        { color: C.water, fontSize: 14, fontWeight: "600" },
  modalBrandSub:         { color: C.gray, fontSize: 11, textAlign: "center", marginBottom: 20 },
  modalActions:          { gap: 10 },
  shareBtn:              { backgroundColor: C.blue, borderRadius: 13, padding: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, elevation: 5 },
  shareBtnText:          { color: "#fff", fontSize: 15, fontWeight: "700" },
  closeModalBtn:         { borderWidth: 1, borderColor: C.navyLt, borderRadius: 13, padding: 13, alignItems: "center" },
  closeModalBtnText:     { color: C.gray, fontSize: 14 },
});