import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  Image, StyleSheet, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { C } from "../theme";
import { USERS } from "../data";

export default function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [err, setErr]           = useState("");
  const [loading, setLoading]   = useState(false);

  const handleLogin = () => {
    // Trim spaces from both fields — fixes accidental space bug
    const trimmedUser = username.trim().toLowerCase();
    const trimmedPass = password.trim();

    setErr("");
    setLoading(true);
    setTimeout(() => {
      const u = USERS[trimmedUser];
      if (u && u.password === trimmedPass) {
        onLogin({ username: trimmedUser, ...u });
      } else {
        setErr("Identifiants incorrects");
        setLoading(false);
      }
    }, 700);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={s.container}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        {/* Hero */}
        <View style={s.hero}>
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800&q=80" }}
            style={s.heroImg}
            resizeMode="cover"
          />
          <View style={s.heroOverlay} />
          <View style={s.heroContent}>
            <View style={s.logoBox}>
              <MaterialIcons name="local-car-wash" size={22} color="#fff" />
            </View>
            <View>
              <Text style={s.appName}>Lavage de Mahdi</Text>
              <Text style={s.appSub}>SYSTÈME CARTE FIDÉLITÉ</Text>
            </View>
          </View>
        </View>

        {/* Form */}
        <View style={s.form}>
          <Text style={s.formTitle}>Connectez-vous pour continuer</Text>

          {/* Username */}
          <Text style={s.label}>IDENTIFIANT</Text>
          <View style={s.inputWrap}>
            <MaterialIcons name="person-outline" size={18} color={C.gray} />
            <TextInput
              style={s.input}
              value={username}
              onChangeText={setUsername}
              placeholder="admin"
              placeholderTextColor={C.gray}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
            {/* Show trimmed indicator if spaces detected */}
            {username !== username.trim() && (
              <MaterialIcons name="warning" size={16} color="#e5a" />
            )}
          </View>

          {/* Password */}
          <Text style={s.label}>MOT DE PASSE</Text>
          <View style={s.inputWrap}>
            <MaterialIcons name="lock-outline" size={18} color={C.gray} />
            <TextInput
              style={[s.input, { flex: 1 }]}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={C.gray}
              secureTextEntry={!showPass}
              autoCapitalize="none"
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
            <TouchableOpacity onPress={() => setShowPass(!showPass)} style={s.eyeBtn}>
              <MaterialIcons name={showPass ? "visibility-off" : "visibility"} size={18} color={C.gray} />
            </TouchableOpacity>
          </View>

          {!!err && (
            <View style={s.errRow}>
              <MaterialIcons name="error-outline" size={15} color={C.red} />
              <Text style={s.errText}>{err}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[s.btn, (!username.trim() || !password.trim() || loading) && s.btnDisabled]}
            onPress={handleLogin}
            disabled={!username.trim() || !password.trim() || loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <MaterialIcons name="login" size={18} color="#fff" />
                <Text style={s.btnText}>Se connecter</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Photo strip */}
          <View style={s.strip}>
            {[
              "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
              "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=400&q=80",
              "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=400&q=80",
            ].map((uri, i) => (
              <Image key={i} source={{ uri }} style={s.stripImg} resizeMode="cover" />
            ))}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: C.navy },
  hero:         { height: 240, position: "relative" },
  heroImg:      { width: "100%", height: "100%", opacity: 0.5 },
  heroOverlay:  { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(8,15,26,0.55)" },
  heroContent:  { position: "absolute", bottom: 24, left: 24, flexDirection: "row", alignItems: "center", gap: 12 },
  logoBox:      { width: 48, height: 48, borderRadius: 14, backgroundColor: C.blue, alignItems: "center", justifyContent: "center" },
  appName:      { color: C.white, fontSize: 22, fontWeight: "700", fontFamily: "Georgia" },
  appSub:       { color: C.water, fontSize: 11, letterSpacing: 2, marginTop: 2 },
  form:         { flex: 1, backgroundColor: C.navy, padding: 24 },
  formTitle:    { color: C.grayLt, fontSize: 15, marginBottom: 22 },
  label:        { color: C.gray, fontSize: 11, letterSpacing: 1.5, marginBottom: 7, fontWeight: "600" },
  inputWrap:    { backgroundColor: C.navyMid, borderWidth: 1.5, borderColor: C.navyLt, borderRadius: 13, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  input:        { paddingVertical: 14, color: C.white, fontSize: 15, flex: 1 },
  eyeBtn:       { padding: 4 },
  errRow:       { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 12 },
  errText:      { color: C.red, fontSize: 13 },
  btn:          { backgroundColor: C.blue, borderRadius: 14, padding: 15, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, shadowColor: C.blue, shadowOpacity: 0.4, shadowRadius: 12, elevation: 6, marginTop: 4 },
  btnDisabled:  { backgroundColor: C.navyLt, shadowOpacity: 0, elevation: 0 },
  btnText:      { color: "#fff", fontSize: 16, fontWeight: "700" },
  strip:        { flexDirection: "row", gap: 8, marginTop: 28, height: 68, borderRadius: 12, overflow: "hidden" },
  stripImg:     { flex: 1, borderRadius: 8, opacity: 0.65 },
});