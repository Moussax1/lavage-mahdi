import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";
import { C } from "../theme";
import { today } from "../data";

export default function NewClientScreen({ customers, preselectedCard, onAdd, onBack }) {
  const [name, setName]                 = useState("");
  const [phone, setPhone]               = useState("");
  const [selectedCard, setSelectedCard] = useState(null);
  const [done, setDone]                 = useState(null);
  const nameRef = useRef(null);

  const unassigned = customers.filter(c => !c.assigned);

  useEffect(() => {
    if (preselectedCard) setSelectedCard(preselectedCard);
    else if (unassigned.length > 0) setSelectedCard(unassigned[0]);
  }, [preselectedCard]);

  // Auto-focus name input on open
  useEffect(() => {
    const t = setTimeout(() => nameRef.current?.focus(), 400);
    return () => clearTimeout(t);
  }, []);

  const handleAdd = () => {
    if (!name.trim() || !selectedCard) return;
    const updated = {
      ...selectedCard,
      name: name.trim(),
      phone: phone.trim() || null,  // optional
      assigned: true,
      washes: 0,
      totalSpent: 0,
      history: [],
      createdAt: today(),
    };
    onAdd(updated);
    setDone(updated);
    setName("");
    setPhone("");
  };

  // ── Success screen ────────────────────────────────────────────────────────
  if (done) {
    return (
      <ScrollView style={s.container} contentContainerStyle={s.doneContent}>
        <View style={s.successIcon}>
          <MaterialIcons name="check-circle" size={36} color="#fff" />
        </View>
        <Text style={s.successTitle}>Client ajouté !</Text>

        <View style={s.cardBox}>
          <Text style={s.cardLabel}>CARTE ASSIGNÉE</Text>
          <Text style={s.cardId}>{done.id}</Text>
          <Text style={s.cardName}>{done.name}</Text>
          {done.phone && (
            <View style={s.phoneRow}>
              <MaterialIcons name="phone" size={13} color={C.gray} />
              <Text style={s.cardPhone}>{done.phone}</Text>
            </View>
          )}
          <View style={s.qrWrap}>
            <QRCode value={done.id} size={130} color={C.navy} backgroundColor="#ffffff" />
          </View>
          <View style={s.hintRow}>
            <MaterialIcons name="print" size={13} color={C.gray} />
            <Text style={s.cardHint}>Imprimez ce QR code et collez-le sur la carte physique</Text>
          </View>
        </View>

        <TouchableOpacity style={s.primaryBtn} onPress={() => setDone(null)} activeOpacity={0.85}>
          <MaterialIcons name="person-add" size={18} color="#fff" />
          <Text style={s.primaryBtnText}>Ajouter un autre client</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.secondaryBtn} onPress={onBack} activeOpacity={0.85}>
          <MaterialIcons name="qr-code-scanner" size={16} color={C.gray} />
          <Text style={s.secondaryBtnText}>Retour au scanner</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  return (
    <ScrollView style={s.container} keyboardShouldPersistTaps="handled">
      <View style={s.body}>
        <TouchableOpacity onPress={onBack} style={s.backBtn}>
          <MaterialIcons name="arrow-back" size={20} color={C.water} />
          <Text style={s.backText}>Retour</Text>
        </TouchableOpacity>

        <Text style={s.pageTitle}>Nouveau client</Text>

        {/* Card selector */}
        <Text style={s.label}>CARTE À ASSIGNER</Text>
        {selectedCard ? (
          <View style={s.cardSelector}>
            <MaterialIcons name="credit-card" size={16} color={C.blue} />
            <Text style={s.cardSelectorId}>{selectedCard.id}</Text>
            <Text style={s.cardSelectorSub}>{unassigned.length} disponible{unassigned.length !== 1 ? "s" : ""}</Text>
          </View>
        ) : (
          <View style={[s.cardSelector, s.cardSelectorEmpty]}>
            <MaterialIcons name="warning" size={16} color="#e55" />
            <Text style={{ color: "#e55", fontSize: 13 }}>Aucune carte libre disponible</Text>
          </View>
        )}

        {unassigned.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.cardScroll}>
            {unassigned.map(c => (
              <TouchableOpacity
                key={c.id}
                style={[s.cardChip, selectedCard?.id === c.id && s.cardChipActive]}
                onPress={() => setSelectedCard(c)}
              >
                <Text style={[s.cardChipText, selectedCard?.id === c.id && s.cardChipTextActive]}>
                  {c.id}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Name — required */}
        <Text style={s.label}>NOM COMPLET <Text style={s.required}>*</Text></Text>
        <View style={s.inputWrap}>
          <MaterialIcons name="person-outline" size={18} color={C.gray} />
          <TextInput
            ref={nameRef}
            style={s.input}
            value={name}
            onChangeText={setName}
            placeholder="ex: Ahmed Ben Salah"
            placeholderTextColor={C.gray}
            returnKeyType="next"
          />
        </View>

        {/* Phone — optional */}
        <View style={s.labelRow}>
          <Text style={s.label}>TÉLÉPHONE</Text>
          <Text style={s.optional}>optionnel</Text>
        </View>
        <View style={s.inputWrap}>
          <MaterialIcons name="phone" size={18} color={C.gray} />
          <TextInput
            style={s.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="ex: 55 123 456"
            placeholderTextColor={C.gray}
            keyboardType="phone-pad"
            returnKeyType="done"
            onSubmitEditing={handleAdd}
          />
        </View>

        <TouchableOpacity
          style={[s.primaryBtn, (!name.trim() || !selectedCard) && s.btnDisabled]}
          onPress={handleAdd}
          disabled={!name.trim() || !selectedCard}
          activeOpacity={0.85}
        >
          <MaterialIcons name="check" size={18} color="#fff" />
          <Text style={s.primaryBtnText}>Créer la carte</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:          { flex: 1, backgroundColor: C.navy },
  body:               { padding: 24 },
  backBtn:            { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 20 },
  backText:           { color: C.water, fontSize: 14 },
  pageTitle:          { color: C.white, fontSize: 20, fontWeight: "700", fontFamily: "Georgia", marginBottom: 20 },
  label:              { color: C.gray, fontSize: 11, letterSpacing: 1.5, fontWeight: "600", marginBottom: 7, marginTop: 4 },
  labelRow:           { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4, marginBottom: 7 },
  required:           { color: "#e55" },
  optional:           { color: C.navyLt, fontSize: 10, backgroundColor: C.navyMid, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10 },
  cardSelector:       { backgroundColor: C.navyMid, borderRadius: 13, borderWidth: 1.5, borderColor: C.blue + "44", padding: 14, flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  cardSelectorEmpty:  { borderColor: "#e5555544" },
  cardSelectorId:     { color: C.blue, fontSize: 16, fontWeight: "700", fontFamily: "monospace", flex: 1 },
  cardSelectorSub:    { color: C.gray, fontSize: 11, flexShrink: 1, textAlign: "right" },
  cardScroll:         { marginBottom: 18 },
  cardChip:           { borderWidth: 1.5, borderColor: C.navyLt, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, marginRight: 8 },
  cardChipActive:     { borderColor: C.blue, backgroundColor: C.blue + "22" },
  cardChipText:       { color: C.gray, fontSize: 12, fontFamily: "monospace" },
  cardChipTextActive: { color: C.blue, fontWeight: "700" },
  inputWrap:          { backgroundColor: C.navyMid, borderWidth: 1.5, borderColor: C.navyLt, borderRadius: 13, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  input:              { flex: 1, paddingVertical: 14, color: C.white, fontSize: 15 },
  primaryBtn:         { backgroundColor: C.blue, borderRadius: 14, padding: 15, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, elevation: 6, marginTop: 6, marginBottom: 12 },
  primaryBtnText:     { color: "#fff", fontSize: 16, fontWeight: "700" },
  secondaryBtn:       { borderWidth: 1, borderColor: C.navyLt, borderRadius: 13, padding: 13, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  secondaryBtnText:   { color: C.gray, fontSize: 14 },
  btnDisabled:        { backgroundColor: C.navyLt, elevation: 0 },
  doneContent:        { padding: 28, alignItems: "center", gap: 16 },
  successIcon:        { width: 72, height: 72, borderRadius: 20, backgroundColor: C.green, alignItems: "center", justifyContent: "center", elevation: 6 },
  successTitle:       { color: C.white, fontSize: 20, fontWeight: "700", fontFamily: "Georgia" },
  cardBox:            { backgroundColor: C.navyMid, borderRadius: 18, padding: 22, width: "100%", alignItems: "center", borderWidth: 1, borderColor: C.navyLt, gap: 6 },
  cardLabel:          { color: C.gray, fontSize: 11, letterSpacing: 1.5 },
  cardId:             { color: C.blue, fontSize: 28, fontWeight: "700", fontFamily: "monospace" },
  cardName:           { color: C.white, fontSize: 16 },
  phoneRow:           { flexDirection: "row", alignItems: "center", gap: 4 },
  cardPhone:          { color: C.gray, fontSize: 13 },
  qrWrap:             { backgroundColor: "#fff", padding: 10, borderRadius: 10, marginVertical: 12 },
  hintRow:            { flexDirection: "row", alignItems: "center", gap: 6 },
  cardHint:           { color: C.gray, fontSize: 12, textAlign: "center", lineHeight: 18, flex: 1 },
});