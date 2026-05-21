import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Platform, Vibration,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { C } from "../theme";

let CameraView, useCameraPermissions;
if (Platform.OS !== "web") {
  const Camera = require("expo-camera");
  CameraView = Camera.CameraView;
  useCameraPermissions = Camera.useCameraPermissions;
}

export default function ScannerScreen({ customers, onScanResult }) {
  const [input, setInput] = useState("");
  const [cameraMode, setCameraMode] = useState(false);
  const [scanned, setScanned] = useState(false);
  const isWeb = Platform.OS === "web";

  const permHook = !isWeb && useCameraPermissions ? useCameraPermissions() : [null, null];
  const permission = permHook[0];
  const requestPermission = permHook[1];

  const handleManualSearch = () => {
    const val = input.trim().toUpperCase();
    if (!val) return;
    const found = customers.find((c) => c.id === val);
    onScanResult(found || null, val);
    setInput("");
  };

  const handleBarcodeScanned = ({ data }) => {
    if (scanned) return;
    setScanned(true);
    Vibration.vibrate(100);
    const val = data.trim().toUpperCase();
    const found = customers.find((c) => c.id === val);
    onScanResult(found || null, val);
    setCameraMode(false);
    setTimeout(() => setScanned(false), 2000);
  };

  const openCamera = async () => {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) return;
    }
    setScanned(false);
    setCameraMode(true);
  };

  if (cameraMode && !isWeb && CameraView) {
    return (
      <View style={{ flex: 1, backgroundColor: "#000" }}>
        <CameraView
          style={{ flex: 1 }}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        />
        <View style={s.overlay}>
          <View style={s.overlayTop} />
          <View style={s.overlayMiddle}>
            <View style={s.overlaySide} />
            <View style={s.scanFrame}>
              <View style={[s.corner, s.cornerTL]} />
              <View style={[s.corner, s.cornerTR]} />
              <View style={[s.corner, s.cornerBL]} />
              <View style={[s.corner, s.cornerBR]} />
              {scanned && <View style={s.scannedFlash} />}
            </View>
            <View style={s.overlaySide} />
          </View>
          <View style={s.overlayBottom}>
            <Text style={s.scanHint}>
              {scanned ? "QR détecté !" : "Placez le QR code dans le cadre"}
            </Text>
            <TouchableOpacity style={s.cancelBtn} onPress={() => setCameraMode(false)}>
              <Text style={s.cancelBtnText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={s.container} keyboardShouldPersistTaps="handled">
      <View style={s.body}>
        <Text style={s.title}>Scanner une carte</Text>

        {!isWeb && (
          <TouchableOpacity style={s.cameraBtn} onPress={openCamera} activeOpacity={0.85}>
            <View style={s.cameraBtnIcon}>
              <MaterialIcons name="qr-code-scanner" size={28} color={C.blue} />
            </View>
            <View>
              <Text style={s.cameraBtnText}>Ouvrir la caméra</Text>
              <Text style={s.cameraBtnSub}>Scanner le QR code du client</Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color={C.gray} style={{ marginLeft: "auto" }} />
          </TouchableOpacity>
        )}

        {isWeb && (
          <View style={s.webBanner}>
            <MaterialIcons name="computer" size={18} color={C.blue} />
            <Text style={s.webBannerText}>Mode PC — Saisissez l'ID manuellement</Text>
          </View>
        )}

        <View style={s.dividerRow}>
          <View style={s.dividerLine} />
          <Text style={s.dividerText}>ou saisir manuellement</Text>
          <View style={s.dividerLine} />
        </View>

        <View style={s.inputRow}>
          <TextInput
            style={s.input}
            value={input}
            onChangeText={(t) => setInput(t.toUpperCase())}
            placeholder="ex: LM-001"
            placeholderTextColor={C.gray}
            autoCapitalize="characters"
            returnKeyType="search"
            onSubmitEditing={handleManualSearch}
          />
          <TouchableOpacity
            style={[s.searchBtn, !input.trim() && s.searchBtnDisabled]}
            onPress={handleManualSearch}
            disabled={!input.trim()}
          >
            <MaterialIcons name="search" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        <Text style={s.quickTitle}>ACCÈS RAPIDE</Text>
        <View style={s.quickGrid}>
          {customers.filter(c => c.assigned).slice(0, 6).map((c) => (
            <TouchableOpacity
              key={c.id}
              style={s.quickChip}
              onPress={() => onScanResult(c, c.id)}
            >
              <MaterialIcons name="person" size={14} color={C.blue} />
              <Text style={s.quickChipId}>{c.id}</Text>
              <Text style={s.quickChipName} numberOfLines={1}>
                {c.name?.split(" ")[0] || "—"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const FRAME = 220;
const s = StyleSheet.create({
  container:      { flex: 1, backgroundColor: C.navy },
  body:           { padding: 24, gap: 0 },
  title:          { color: C.white, fontSize: 22, fontWeight: "700", fontFamily: "Georgia", marginBottom: 24 },
  cameraBtn:      { backgroundColor: C.navyMid, borderRadius: 16, padding: 18, borderWidth: 1.5, borderColor: C.blue + "44", flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 20 },
  cameraBtnIcon:  { width: 48, height: 48, borderRadius: 12, backgroundColor: C.blue + "22", alignItems: "center", justifyContent: "center" },
  cameraBtnText:  { color: C.white, fontSize: 15, fontWeight: "700" },
  cameraBtnSub:   { color: C.gray, fontSize: 12, marginTop: 2 },
  webBanner:      { backgroundColor: C.navyMid, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: C.blue + "44", marginBottom: 20, flexDirection: "row", alignItems: "center", gap: 8 },
  webBannerText:  { color: C.water, fontSize: 13 },
  dividerRow:     { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 18 },
  dividerLine:    { flex: 1, height: 1, backgroundColor: C.navyLt },
  dividerText:    { color: C.gray, fontSize: 12 },
  inputRow:       { flexDirection: "row", gap: 10, marginBottom: 28 },
  input:          { flex: 1, backgroundColor: C.navyMid, borderWidth: 1.5, borderColor: C.navyLt, borderRadius: 13, padding: 14, color: C.white, fontSize: 16, fontFamily: "monospace", letterSpacing: 1 },
  searchBtn:      { backgroundColor: C.blue, borderRadius: 13, width: 52, alignItems: "center", justifyContent: "center", shadowColor: C.blue, shadowOpacity: 0.4, shadowRadius: 10, elevation: 5 },
  searchBtnDisabled: { backgroundColor: C.navyLt, shadowOpacity: 0 },
  quickTitle:     { color: C.gray, fontSize: 11, letterSpacing: 1.5, fontWeight: "600", marginBottom: 12 },
  quickGrid:      { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  quickChip:      { backgroundColor: C.navyMid, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: C.navyLt, alignItems: "center", minWidth: 80, gap: 3 },
  quickChipId:    { color: C.blue, fontSize: 12, fontWeight: "700", fontFamily: "monospace" },
  quickChipName:  { color: C.gray, fontSize: 10 },
  overlay:        { ...StyleSheet.absoluteFillObject },
  overlayTop:     { flex: 1, backgroundColor: "rgba(0,0,0,0.6)" },
  overlayMiddle:  { flexDirection: "row", height: FRAME },
  overlaySide:    { flex: 1, backgroundColor: "rgba(0,0,0,0.6)" },
  scanFrame:      { width: FRAME, height: FRAME, borderRadius: 12 },
  overlayBottom:  { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center", gap: 16 },
  scanHint:       { color: "#fff", fontSize: 15, fontWeight: "600" },
  cancelBtn:      { backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 24, paddingHorizontal: 32, paddingVertical: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.3)" },
  cancelBtnText:  { color: "#fff", fontSize: 15, fontWeight: "600" },
  scannedFlash:   { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(39,201,138,0.3)", borderRadius: 12 },
  corner:         { position: "absolute", width: 24, height: 24, borderColor: C.blue, borderWidth: 3 },
  cornerTL:       { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 6 },
  cornerTR:       { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 6 },
  cornerBL:       { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 6 },
  cornerBR:       { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 6 },
});
