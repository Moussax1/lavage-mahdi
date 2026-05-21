import React, { useState, useEffect } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  StatusBar, Platform, Alert, ToastAndroid, ActivityIndicator,
} from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { C } from "./src/theme";
import { seedCards, subscribeToCustomers, updateCustomer, assignCard } from "./src/firebase/firebaseService";
import { today } from "./src/data";
import useOfflineQueue from "./src/hooks/useOfflineQueue";
import NetworkBanner from "./src/components/NetworkBanner";
import LoginScreen      from "./src/screens/LoginScreen";
import ScannerScreen    from "./src/screens/ScannerScreen";
import ClientScreen     from "./src/screens/ClientScreen";
import NewClientScreen  from "./src/screens/NewClientScreen";
import ClientListScreen from "./src/screens/ClientListScreen";
import QRExportScreen   from "./src/screens/QRExportScreen";

const showToast = (msg) => {
  if (Platform.OS === "android") ToastAndroid.show(msg, ToastAndroid.SHORT);
  else Alert.alert("", msg);
};

const TABS = [
  { id: "scanner",   label: "Scanner",  icon: "qr-code-scanner" },
  { id: "list",      label: "Clients",  icon: "people" },
  { id: "newclient", label: "Nouveau",  icon: "person-add" },
  { id: "qr",        label: "QR Codes", icon: "print" },
];

export default function App() {
  const [user, setUser]                       = useState(null);
  const [customers, setCustomers]             = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [screen, setScreen]                   = useState("scanner");
  const [activeCustomer, setActiveCustomer]   = useState(null);
  const [notFoundId, setNotFoundId]           = useState("");
  const [preselectedCard, setPreselectedCard] = useState(null);

  const { isOnline, syncing, pendingCount, enqueueUpdate, enqueueAssign } = useOfflineQueue();

  useEffect(() => {
    const init = async () => {
      try { await seedCards(); } catch (e) { console.warn("Seed error:", e); }
    };
    init();
    const unsub = subscribeToCustomers((data) => {
      setCustomers([...data].sort((a, b) => a.id.localeCompare(b.id)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (activeCustomer) {
      const fresh = customers.find((c) => c.id === activeCustomer.id);
      if (fresh) setActiveCustomer({ ...fresh });
    }
  }, [customers]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleScanResult = (customer, scannedId) => {
    if (!customer) { setNotFoundId(scannedId); setScreen("notfound"); return; }
    if (!customer.assigned) { setPreselectedCard(customer); setScreen("newclient"); return; }
    setActiveCustomer({ ...customer });
    setScreen("client");
  };

  const handleAddWash = async (price) => {
    const updated = {
      ...activeCustomer,
      washes: activeCustomer.washes + 1,
      totalSpent: activeCustomer.totalSpent + price,
      history: [...activeCustomer.history, { date: today(), price, free: false }],
    };
    setActiveCustomer(updated);
    setCustomers((prev) => prev.map((c) => c.id === updated.id ? updated : c));
    try {
      await enqueueUpdate(updated);
      showToast(isOnline ? `Lavage ${price} TND enregistré` : `Sauvegardé hors ligne`);
    } catch { showToast("Erreur — réessayez"); }
  };

  const handleConfirmFreeWash = async (price) => {
    const updated = {
      ...activeCustomer,
      washes: activeCustomer.washes + 1,
      history: [...activeCustomer.history, { date: today(), price, free: true }],
    };
    setActiveCustomer(updated);
    setCustomers((prev) => prev.map((c) => c.id === updated.id ? updated : c));
    try {
      await enqueueUpdate(updated);
      showToast(isOnline ? `Lavage gratuit confirmé !` : `Sauvegardé hors ligne`);
    } catch { showToast("Erreur — réessayez"); }
  };

  const handleEditClient = async (updatedCustomer) => {
    setActiveCustomer(updatedCustomer);
    setCustomers((prev) => prev.map((c) => c.id === updatedCustomer.id ? updatedCustomer : c));
    try {
      await enqueueUpdate(updatedCustomer);
      showToast("Informations mises à jour");
    } catch { showToast("Erreur — réessayez"); }
  };

  const handleDeleteCard = async (cardId) => {
    // Reset the card back to unassigned blank state
    const resetCard = {
      id: cardId,
      name: null,
      phone: null,
      assigned: false,
      washes: 0,
      totalSpent: 0,
      history: [],
      createdAt: null,
    };
    setCustomers((prev) => prev.map((c) => c.id === cardId ? resetCard : c));
    try {
      await enqueueUpdate(resetCard);
      showToast(`Carte ${cardId} réinitialisée`);
    } catch { showToast("Erreur — réessayez"); }
  };

  const handleAddCustomer = async (updatedCard) => {
    setCustomers((prev) => prev.map((c) => c.id === updatedCard.id ? updatedCard : c));
    try {
      await enqueueAssign(updatedCard);
      showToast(isOnline
        ? `Carte ${updatedCard.id} assignée à ${updatedCard.name}`
        : `Assignation sauvegardée hors ligne`
      );
      setPreselectedCard(null);
    } catch { showToast("Erreur — réessayez"); }
  };

  const handleSelectCustomer = (c) => {
    setActiveCustomer({ ...c });
    setScreen("client");
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) return (
    <SafeAreaProvider>
      <SafeAreaView style={[s.safe, { alignItems: "center", justifyContent: "center", gap: 16 }]}>
        <ActivityIndicator size="large" color={C.blue} />
        <Text style={{ color: C.gray, fontSize: 14 }}>Connexion à la base de données...</Text>
      </SafeAreaView>
    </SafeAreaProvider>
  );

  // ── Login ──────────────────────────────────────────────────────────────────
  if (!user) return (
    <SafeAreaProvider>
      <SafeAreaView style={s.safe}>
        <StatusBar barStyle="light-content" backgroundColor={C.navy} />
        <LoginScreen onLogin={(u) => { setUser(u); setScreen("scanner"); }} />
      </SafeAreaView>
    </SafeAreaProvider>
  );

  const renderScreen = () => {
    switch (screen) {
      case "scanner":   return <ScannerScreen customers={customers} onScanResult={handleScanResult} />;
      case "client":    return activeCustomer ? (
        <ClientScreen
          customer={activeCustomer}
          onBack={() => setScreen("scanner")}
          onAddWash={handleAddWash}
          onConfirmFreeWash={handleConfirmFreeWash}
          onEditClient={handleEditClient}
          onDeleteCard={handleDeleteCard}
        />
      ) : null;
      case "notfound":  return (
        <View style={s.notFound}>
          <MaterialIcons name="search-off" size={64} color={C.gray} />
          <Text style={s.notFoundTitle}>Carte non trouvée</Text>
          <Text style={s.notFoundSub}>Aucune carte associée à{"\n"}<Text style={{ color: C.blue, fontFamily: "monospace", fontWeight: "700" }}>{notFoundId}</Text></Text>
          <TouchableOpacity style={s.rescanBtn} onPress={() => setScreen("scanner")}>
            <MaterialIcons name="qr-code-scanner" size={18} color="#fff" />
            <Text style={s.rescanBtnText}>Rescanner</Text>
          </TouchableOpacity>
        </View>
      );
      case "newclient": return <NewClientScreen customers={customers} preselectedCard={preselectedCard} onAdd={handleAddCustomer} onBack={() => { setPreselectedCard(null); setScreen("scanner"); }} />;
      case "list":      return <ClientListScreen customers={customers.filter(c => c.assigned)} onSelect={handleSelectCustomer} onBack={() => setScreen("scanner")} />;
      case "qr":        return <QRExportScreen customers={customers} onBack={() => setScreen("scanner")} />;
      default: return null;
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={s.safe}>
        <StatusBar barStyle="light-content" backgroundColor={C.navyMid} />

        <View style={s.header}>
          <View style={s.headerLeft}>
            <View style={s.logoBox}>
              <MaterialIcons name="local-car-wash" size={20} color="#fff" />
            </View>
            <View>
              <Text style={s.appName}>Lavage de Mahdi</Text>
              <Text style={s.appRole}>{user.name}</Text>
            </View>
          </View>
          <View style={s.headerRight}>
            <View style={[s.onlineDot, { backgroundColor: isOnline ? C.green : "#e55" }]} />
            <TouchableOpacity style={s.logoutBtn} onPress={() => setUser(null)}>
              <MaterialIcons name="power-settings-new" size={18} color={C.gray} />
            </TouchableOpacity>
          </View>
        </View>

        <NetworkBanner isOnline={isOnline} syncing={syncing} pendingCount={pendingCount} />

        <View style={{ flex: 1 }}>{renderScreen()}</View>

        <View style={s.tabBar}>
          {TABS.map(({ id, label, icon }) => {
            const active = screen === id;
            return (
              <TouchableOpacity
                key={id}
                style={s.tab}
                onPress={() => { setPreselectedCard(null); setScreen(id); }}
                activeOpacity={0.7}
              >
                {active && <View style={s.tabIndicator} />}
                <MaterialIcons name={icon} size={24} color={active ? C.blue : C.gray} />
                <Text style={[s.tabLabel, active && s.tabLabelActive]}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: C.navy },
  header:         { backgroundColor: C.navyMid, paddingHorizontal: 18, paddingVertical: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderBottomColor: C.navyLt },
  headerLeft:     { flexDirection: "row", alignItems: "center", gap: 10 },
  headerRight:    { flexDirection: "row", alignItems: "center", gap: 10 },
  logoBox:        { width: 36, height: 36, borderRadius: 10, backgroundColor: C.blue, alignItems: "center", justifyContent: "center" },
  appName:        { color: C.white, fontSize: 15, fontWeight: "700", fontFamily: "Georgia" },
  appRole:        { color: C.gray, fontSize: 11 },
  onlineDot:      { width: 8, height: 8, borderRadius: 4 },
  logoutBtn:      { borderWidth: 1, borderColor: C.navyLt, borderRadius: 9, padding: 8 },
  tabBar:         { backgroundColor: C.navyMid, flexDirection: "row", borderTopWidth: 1, borderTopColor: C.navyLt, paddingBottom: 4 },
  tab:            { flex: 1, alignItems: "center", paddingTop: 10, paddingBottom: 6, position: "relative" },
  tabIndicator:   { position: "absolute", top: 0, width: 28, height: 2, backgroundColor: C.blue, borderBottomLeftRadius: 3, borderBottomRightRadius: 3 },
  tabLabel:       { fontSize: 10, color: C.gray, marginTop: 3 },
  tabLabelActive: { color: C.blue, fontWeight: "700" },
  notFound:       { flex: 1, alignItems: "center", justifyContent: "center", padding: 40, gap: 14 },
  notFoundTitle:  { color: C.white, fontSize: 20, fontWeight: "700" },
  notFoundSub:    { color: C.gray, fontSize: 14, textAlign: "center", lineHeight: 22 },
  rescanBtn:      { backgroundColor: C.blue, borderRadius: 13, paddingHorizontal: 36, paddingVertical: 14, marginTop: 8, flexDirection: "row", alignItems: "center", gap: 8, elevation: 5 },
  rescanBtnText:  { color: "#fff", fontSize: 15, fontWeight: "700" },
});