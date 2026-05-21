import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  Image, StyleSheet, Alert, Modal, TextInput,
  Animated, KeyboardAvoidingView, Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";
import { C } from "../theme";
import { fmtDate } from "../data";
import { PriceSelector } from "../components";

export default function ClientScreen({ customer, onAddWash, onConfirmFreeWash, onEditClient, onDeleteCard, onBack }) {
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [editModal, setEditModal]         = useState(false);
  const [editName, setEditName]           = useState(customer.name);
  const [editPhone, setEditPhone]         = useState(customer.phone || "");
  const [showSuccess, setShowSuccess]     = useState(false);
  const successAnim = useRef(new Animated.Value(0)).current;

  // Count paid washes since the last free wash (or from the beginning)
  const lastFreeIndex = [...customer.history].map((h, i) => h.free ? i : -1).filter(i => i >= 0).pop() ?? -1;
  const washesSinceLastFree = customer.history.slice(lastFreeIndex + 1).filter(h => !h.free).length;
  const paidWashes   = customer.history.filter(h => !h.free).length;
  const isFreeReady  = washesSinceLastFree >= 5;
  const nextFreeIn   = 5 - (washesSinceLastFree % 5);

  useEffect(() => {
    if (customer.history.length > 0) {
      const lastPaid = [...customer.history].reverse().find(h => !h.free);
      if (lastPaid) setSelectedPrice(lastPaid.price);
    }
  }, [customer.id]);

  // Success flash animation
  const triggerSuccess = () => {
    setShowSuccess(true);
    successAnim.setValue(0);
    Animated.sequence([
      Animated.timing(successAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.delay(900),
      Animated.timing(successAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setShowSuccess(false));
  };

  const canValidate = selectedPrice !== null;

  const handleWashPress = () => {
    if (!canValidate) return;
    Alert.alert(
      "Confirmer le lavage",
      `${customer.name}\n\nMontant : ${selectedPrice} TND\nLavage n° ${customer.washes + 1}`,
      [
        { text: "Annuler", style: "cancel" },
        { text: "Valider", onPress: () => { onAddWash(selectedPrice); triggerSuccess(); } },
      ]
    );
  };

  const handleFreeWashPress = () => {
    if (!canValidate) return;
    Alert.alert(
      "Confirmer le lavage GRATUIT",
      `${customer.name}\n\nCe lavage est offert !\nValeur : ${selectedPrice} TND`,
      [
        { text: "Annuler", style: "cancel" },
        { text: "Confirmer", onPress: () => { onConfirmFreeWash(selectedPrice); triggerSuccess(); } },
      ]
    );
  };

  const handleSaveEdit = () => {
    if (!editName.trim()) return;
    onEditClient({ ...customer, name: editName.trim(), phone: editPhone.trim() || null });
    setEditModal(false);
  };

  const handleDeleteCard = () => {
    Alert.alert(
      "Supprimer cette carte ?",
      `La carte ${customer.id} sera réinitialisée et redeviendra disponible.\n\nTout l'historique de ${customer.name} sera perdu.`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => { onDeleteCard(customer.id); onBack(); },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={s.hero}>
          <Image
            source={{ uri: selectedPrice === 15
              ? "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=600&q=80"
              : "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=600&q=80" }}
            style={s.heroImg} resizeMode="cover"
          />
          <View style={s.heroOverlay} />
          <TouchableOpacity style={s.backBtn} onPress={onBack}>
            <MaterialIcons name="arrow-back" size={18} color={C.water} />
            <Text style={s.backText}>Retour</Text>
          </TouchableOpacity>
          {/* Edit + Delete buttons in hero */}
          <View style={s.heroActions}>
            <TouchableOpacity style={s.heroBtn} onPress={() => { setEditName(customer.name); setEditPhone(customer.phone || ""); setEditModal(true); }}>
              <MaterialIcons name="edit" size={16} color={C.water} />
            </TouchableOpacity>
            <TouchableOpacity style={[s.heroBtn, s.heroBtnDelete]} onPress={handleDeleteCard}>
              <MaterialIcons name="delete-outline" size={16} color="#e55" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={s.body}>
          {/* Client card */}
          <View style={s.clientCard}>
            <View style={s.clientHeader}>
              <View style={{ flex: 1 }}>
                <Text style={s.clientName}>{customer.name}</Text>
                {customer.phone ? (
                  <View style={s.phoneRow}>
                    <MaterialIcons name="phone" size={13} color={C.gray} />
                    <Text style={s.clientPhone}>{customer.phone}</Text>
                  </View>
                ) : (
                  <TouchableOpacity style={s.addPhoneBtn} onPress={() => { setEditName(customer.name); setEditPhone(""); setEditModal(true); }}>
                    <MaterialIcons name="add" size={12} color={C.gray} />
                    <Text style={s.addPhoneText}>Ajouter un numéro</Text>
                  </TouchableOpacity>
                )}
                <View style={s.badgesRow}>
                  <View style={s.badge}>
                    <MaterialIcons name="credit-card" size={10} color={C.water} />
                    <Text style={s.badgeText}>{customer.id}</Text>
                  </View>
                  <View style={[s.badge, s.badgeGreen]}>
                    <MaterialIcons name="local-car-wash" size={10} color={C.green} />
                    <Text style={[s.badgeText, { color: C.green }]}>{customer.washes} lavages</Text>
                  </View>
                  {customer.totalSpent > 0 && (
                    <View style={[s.badge, s.badgeGold]}>
                      <MaterialIcons name="payments" size={10} color={C.gold} />
                      <Text style={[s.badgeText, { color: C.gold }]}>{customer.totalSpent} TND</Text>
                    </View>
                  )}
                </View>
              </View>
              <View style={s.qrWrap}>
                <QRCode value={customer.id} size={60} color={C.navy} backgroundColor="#fff" />
              </View>
            </View>

            {/* Stamp dots with cycle count */}
            <View style={s.stampSection}>
              <View style={s.stampsRow}>
                {[1,2,3,4,5].map((n) => (
                  <View key={n} style={[s.stamp, washesSinceLastFree >= n && s.stampFilled]}>
                    {washesSinceLastFree >= n
                      ? <MaterialIcons name="local-car-wash" size={14} color={C.navy} />
                      : <Text style={s.stampNum}>{n}</Text>
                    }
                  </View>
                ))}
                <View style={[s.stamp, s.stampStar, isFreeReady && s.stampStarReady]}>
                  <MaterialIcons name="star" size={16} color={isFreeReady ? C.navy : C.gold} />
                </View>
              </View>
              <Text style={s.cycleLabel}>
                {Math.min(washesSinceLastFree, 5)}/5 dans le cycle actuel
                {customer.history.filter(h => h.free).length > 0 && <Text style={{ color: C.blue }}> · {customer.history.filter(h => h.free).length} gratuit{customer.history.filter(h => h.free).length > 1 ? "s" : ""} utilisé{customer.history.filter(h => h.free).length > 1 ? "s" : ""}</Text>}
              </Text>
            </View>

            {!isFreeReady && (
              <View style={s.nextFreeRow}>
                <MaterialIcons name="info-outline" size={13} color={C.gray} />
                <Text style={s.nextFreeText}>
                  Encore <Text style={{ color: C.blue, fontWeight: "700" }}>{nextFreeIn} lavage{nextFreeIn > 1 ? "s" : ""}</Text> avant le prochain gratuit
                </Text>
              </View>
            )}
          </View>

          {/* Free wash */}
          {isFreeReady && (
            <View style={s.freeBox}>
              <View style={s.freeHeader}>
                <View style={s.freeIcon}>
                  <MaterialIcons name="card-giftcard" size={24} color="#fff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.freeTitle}>Ce lavage est GRATUIT !</Text>
                  <Text style={s.freeSub}>Le client a complété 5 lavages payants.</Text>
                </View>
              </View>
              <PriceSelector selected={selectedPrice} onChange={setSelectedPrice} isFree={true} />
              {selectedPrice && (
                <View style={s.amountBox}>
                  <Text style={s.amountLabel}>{selectedPrice} TND offerts à ce client</Text>
                </View>
              )}
              <TouchableOpacity style={[s.confirmBtn, !canValidate && s.btnDisabled]} onPress={handleFreeWashPress} disabled={!canValidate}>
                <MaterialIcons name="check-circle" size={18} color="#fff" />
                <Text style={s.confirmBtnText}>Confirmer le lavage gratuit</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Normal wash */}
          {!isFreeReady && (
            <View style={s.washBox}>
              <PriceSelector selected={selectedPrice} onChange={setSelectedPrice} />
              {selectedPrice && (
                <View style={s.amountRow}>
                  <Text style={s.amountRowLabel}>Montant à encaisser</Text>
                  <Text style={s.amountRowValue}>{selectedPrice} TND</Text>
                </View>
              )}
              <TouchableOpacity style={[s.washBtn, !canValidate && s.btnDisabled]} onPress={handleWashPress} disabled={!canValidate}>
                <MaterialIcons name="local-car-wash" size={18} color="#fff" />
                <Text style={s.washBtnText}>Valider ce lavage</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* History */}
          <View style={s.historyBox}>
            <View style={s.historyTitleRow}>
              <MaterialIcons name="history" size={15} color={C.water} />
              <Text style={s.historyTitle}>HISTORIQUE DES LAVAGES</Text>
              <Text style={s.historyCount}>{customer.history.length}</Text>
            </View>
            {customer.history.length === 0 ? (
              <View style={s.emptyHistory}>
                <MaterialIcons name="hourglass-empty" size={32} color={C.navyLt} />
                <Text style={s.emptyText}>Aucun lavage enregistré</Text>
              </View>
            ) : (
              [...customer.history].reverse().map((h, i, arr) => (
                <View key={i} style={[s.historyRow, i < arr.length - 1 && s.historyRowBorder]}>
                  <View style={[s.historyIcon, h.free && s.historyIconFree]}>
                    <MaterialIcons name={h.free ? "card-giftcard" : "local-car-wash"} size={16} color={h.free ? C.green : C.water} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.historyDate}>{fmtDate(h.date)}</Text>
                    {h.free && <Text style={s.historyFreeLabel}>Lavage gratuit</Text>}
                  </View>
                  {h.free ? (
                    <View style={s.freeBadge}><Text style={s.freeBadgeText}>GRATUIT</Text></View>
                  ) : (
                    <Text style={s.historyPrice}>{h.price} TND</Text>
                  )}
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Success flash overlay */}
      {showSuccess && (
        <Animated.View
          style={[s.successOverlay, { opacity: successAnim }]}
          pointerEvents="none"
        >
          <View style={s.successBadge}>
            <MaterialIcons name="check-circle" size={32} color="#fff" />
            <Text style={s.successText}>Lavage enregistré !</Text>
          </View>
        </Animated.View>
      )}

      {/* Edit modal */}
      <Modal visible={editModal} transparent animationType="slide" onRequestClose={() => setEditModal(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Modifier le client</Text>
              <TouchableOpacity onPress={() => setEditModal(false)} style={s.closeBtn}>
                <MaterialIcons name="close" size={18} color={C.gray} />
              </TouchableOpacity>
            </View>

            <Text style={s.modalLabel}>NOM COMPLET</Text>
            <View style={s.modalInputWrap}>
              <MaterialIcons name="person-outline" size={18} color={C.gray} />
              <TextInput
                style={s.modalInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Nom complet"
                placeholderTextColor={C.gray}
                autoFocus
              />
            </View>

            <Text style={s.modalLabel}>TÉLÉPHONE <Text style={s.optional}>optionnel</Text></Text>
            <View style={s.modalInputWrap}>
              <MaterialIcons name="phone" size={18} color={C.gray} />
              <TextInput
                style={s.modalInput}
                value={editPhone}
                onChangeText={setEditPhone}
                placeholder="ex: 55 123 456"
                placeholderTextColor={C.gray}
                keyboardType="phone-pad"
              />
            </View>

            <TouchableOpacity
              style={[s.saveBtn, !editName.trim() && s.btnDisabled]}
              onPress={handleSaveEdit}
              disabled={!editName.trim()}
            >
              <MaterialIcons name="check" size={18} color="#fff" />
              <Text style={s.saveBtnText}>Enregistrer</Text>
            </TouchableOpacity>
          </View>
        </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container:        { flex: 1, backgroundColor: C.navy },
  hero:             { height: 140 },
  heroImg:          { ...StyleSheet.absoluteFillObject, opacity: 0.4 },
  heroOverlay:      { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(8,15,26,0.55)" },
  backBtn:          { position: "absolute", top: 14, left: 14, backgroundColor: "rgba(0,0,0,0.55)", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7, flexDirection: "row", alignItems: "center", gap: 5 },
  backText:         { color: C.water, fontSize: 13 },
  heroActions:      { position: "absolute", top: 14, right: 14, flexDirection: "row", gap: 8 },
  heroBtn:          { backgroundColor: "rgba(0,0,0,0.55)", borderRadius: 10, padding: 9 },
  heroBtnDelete:    { borderWidth: 1, borderColor: "#e5555533" },
  body:             { padding: 16, gap: 14, marginTop: -20 },
  clientCard:       { backgroundColor: C.navyMid, borderRadius: 18, padding: 18, borderWidth: 1, borderColor: C.navyLt, elevation: 6 },
  clientHeader:     { flexDirection: "row", gap: 12, marginBottom: 16, alignItems: "flex-start" },
  clientName:       { color: C.white, fontSize: 19, fontWeight: "700", fontFamily: "Georgia", marginBottom: 4 },
  phoneRow:         { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 8 },
  clientPhone:      { color: C.gray, fontSize: 13 },
  addPhoneBtn:      { flexDirection: "row", alignItems: "center", gap: 3, marginBottom: 8 },
  addPhoneText:     { color: C.gray, fontSize: 12 },
  badgesRow:        { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  badge:            { backgroundColor: C.navyLt, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3, flexDirection: "row", alignItems: "center", gap: 4 },
  badgeText:        { color: C.water, fontSize: 11, fontWeight: "600" },
  badgeGreen:       { backgroundColor: "#0a2a10" },
  badgeGold:        { backgroundColor: "#1a1400" },
  qrWrap:           { backgroundColor: "#fff", padding: 4, borderRadius: 8 },
  stampSection:     { alignItems: "center", gap: 8 },
  stampsRow:        { flexDirection: "row", gap: 8, justifyContent: "center" },
  stamp:            { width: 38, height: 38, borderRadius: 19, borderWidth: 2, borderColor: C.navyLt, alignItems: "center", justifyContent: "center" },
  stampFilled:      { backgroundColor: C.blue, borderColor: C.blue },
  stampNum:         { color: C.gray, fontSize: 13, fontWeight: "700" },
  stampStar:        { borderColor: C.gold },
  stampStarReady:   { backgroundColor: C.gold, borderColor: C.gold },
  cycleLabel:       { color: C.gray, fontSize: 11, textAlign: "center" },
  nextFreeRow:      { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: C.navyLt, borderRadius: 10, padding: 10, marginTop: 10 },
  nextFreeText:     { color: C.gray, fontSize: 12 },
  freeBox:          { backgroundColor: "#0d2d14", borderRadius: 16, padding: 18, borderWidth: 2, borderColor: C.green, gap: 12 },
  freeHeader:       { flexDirection: "row", alignItems: "center", gap: 12 },
  freeIcon:         { width: 46, height: 46, borderRadius: 13, backgroundColor: C.green, alignItems: "center", justifyContent: "center" },
  freeTitle:        { color: C.green, fontSize: 16, fontWeight: "700" },
  freeSub:          { color: "#6db88a", fontSize: 13 },
  amountBox:        { backgroundColor: "rgba(39,201,138,0.1)", borderRadius: 10, padding: 10, alignItems: "center" },
  amountLabel:      { color: "#6db88a", fontSize: 14 },
  confirmBtn:       { backgroundColor: C.green, borderRadius: 13, padding: 15, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, elevation: 5 },
  confirmBtnText:   { color: "#fff", fontSize: 15, fontWeight: "700" },
  washBox:          { backgroundColor: C.navyMid, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: C.navyLt, gap: 12 },
  amountRow:        { backgroundColor: C.navyLt, borderRadius: 10, padding: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  amountRowLabel:   { color: C.grayLt, fontSize: 13 },
  amountRowValue:   { color: C.white, fontSize: 18, fontWeight: "700" },
  washBtn:          { backgroundColor: C.blue, borderRadius: 13, padding: 15, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, elevation: 5 },
  washBtnText:      { color: "#fff", fontSize: 15, fontWeight: "700" },
  btnDisabled:      { backgroundColor: C.navyLt, elevation: 0 },
  historyBox:       { backgroundColor: C.navyMid, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.navyLt, marginBottom: 30 },
  historyTitleRow:  { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 14 },
  historyTitle:     { color: C.water, fontSize: 11, fontWeight: "700", letterSpacing: 1, flex: 1 },
  historyCount:     { backgroundColor: C.navyLt, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, color: C.gray, fontSize: 11 },
  emptyHistory:     { alignItems: "center", paddingVertical: 20, gap: 8 },
  emptyText:        { color: C.gray, fontSize: 13 },
  historyRow:       { flexDirection: "row", alignItems: "center", gap: 10, paddingBottom: 11, marginBottom: 11 },
  historyRowBorder: { borderBottomWidth: 1, borderBottomColor: C.navyLt },
  historyIcon:      { width: 36, height: 36, borderRadius: 10, backgroundColor: C.navyLt, alignItems: "center", justifyContent: "center" },
  historyIconFree:  { backgroundColor: "#0d2d14" },
  historyDate:      { color: C.white, fontSize: 14 },
  historyFreeLabel: { color: C.green, fontSize: 11, fontWeight: "600" },
  historyPrice:     { color: C.gold, fontSize: 15, fontWeight: "700" },
  freeBadge:        { backgroundColor: "#0a2010", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  freeBadgeText:    { color: C.green, fontSize: 11, fontWeight: "700" },
  // Success overlay
  successOverlay:   { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center", pointerEvents: "none" },
  successBadge:     { backgroundColor: C.green, borderRadius: 20, paddingHorizontal: 28, paddingVertical: 18, flexDirection: "row", alignItems: "center", gap: 12, elevation: 20 },
  successText:      { color: "#fff", fontSize: 17, fontWeight: "700" },
  // Edit modal
  modalOverlay:     { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
  modalCard:        { backgroundColor: C.navyMid, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 36, borderTopWidth: 1, borderColor: C.navyLt },
  modalHeader:      { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitle:       { color: C.white, fontSize: 17, fontWeight: "700" },
  closeBtn:         { width: 32, height: 32, borderRadius: 16, backgroundColor: C.navyLt, alignItems: "center", justifyContent: "center" },
  modalLabel:       { color: C.gray, fontSize: 11, letterSpacing: 1.5, fontWeight: "600", marginBottom: 7 },
  optional:         { color: C.navyLt, fontSize: 10 },
  modalInputWrap:   { backgroundColor: C.navy, borderWidth: 1.5, borderColor: C.navyLt, borderRadius: 13, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  modalInput:       { flex: 1, paddingVertical: 14, color: C.white, fontSize: 15 },
  saveBtn:          { backgroundColor: C.blue, borderRadius: 13, padding: 15, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, elevation: 5, marginTop: 4, marginBottom: 8 },
  saveBtnText:      { color: "#fff", fontSize: 15, fontWeight: "700" },
});