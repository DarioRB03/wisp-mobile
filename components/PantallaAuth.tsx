import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { COLORES, ESPACIADO, RADIOS, TIPOGRAFIA } from "../constants/theme";
import { supabase } from "../lib/supabase";
import SelectorIdioma from "./SelectorIdioma";

export default function PantallaAuth() {
    const { t } = useTranslation();
    const [modo, setModo] = useState<"login" | "registro">("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [cargando, setCargando] = useState(false);

    async function manejarSubmit() {
        setError("");
        setMensaje("");
        setCargando(true);
        try {
            if (modo === "registro") {
                const { error, data } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                if (!data.session) setMensaje(t("auth.confirmacion"));
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            }
        } catch (err: any) {
            setError(err.message || t("auth.errorGenerico"));
        } finally {
            setCargando(false);
        }
    }

    return (
        <View style={[styles.container, styles.centrado]}>
            <View style={{ position: "absolute", top: ESPACIADO.xl, right: ESPACIADO.xl }}>
                <SelectorIdioma />
            </View>
            <Text style={styles.titulo}>{t("app.nombre")}</Text>
            <Text style={styles.subtitulo}>{t("app.lema")}</Text>
            <Text style={[styles.subtitulo, { marginTop: ESPACIADO.xl, marginBottom: ESPACIADO.md, fontSize: TIPOGRAFIA.subtitulo, color: COLORES.text }]}>
                {modo === "login" ? t("auth.login") : t("auth.registro")}
            </Text>
            <TextInput
                style={styles.input}
                placeholder={t("auth.email")}
                placeholderTextColor={COLORES.textMuted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />
            <TextInput
                style={styles.input}
                placeholder={t("auth.password")}
                placeholderTextColor={COLORES.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {mensaje ? <Text style={styles.mensaje}>{mensaje}</Text> : null}
            <TouchableOpacity style={styles.boton} onPress={manejarSubmit} disabled={cargando}>
                {cargando ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text style={styles.botonTexto}>{modo === "login" ? t("auth.entrar") : t("auth.registrarme")}</Text>
                )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModo(modo === "login" ? "registro" : "login")}>
                <Text style={styles.enlace}>
                    {modo === "login" ? t("auth.sinCuenta") : t("auth.conCuenta")}
                </Text>
            </TouchableOpacity>
            <StatusBar style="light" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORES.bg, paddingHorizontal: ESPACIADO.xl },
    centrado: { justifyContent: "center", alignItems: "center" },
    titulo: { fontSize: TIPOGRAFIA.titulo, fontWeight: "600", color: COLORES.text },
    subtitulo: { fontSize: TIPOGRAFIA.pequeno, color: COLORES.textMuted, marginTop: ESPACIADO.xs },
    input: {
        width: "100%",
        borderWidth: 1,
        borderColor: COLORES.border,
        borderRadius: RADIOS.sm,
        padding: ESPACIADO.md,
        marginTop: ESPACIADO.sm,
        color: COLORES.text,
        fontSize: TIPOGRAFIA.cuerpo,
    },
    boton: { width: "100%", backgroundColor: COLORES.accentCool, borderRadius: RADIOS.sm, padding: ESPACIADO.md + 2, marginTop: ESPACIADO.lg, alignItems: "center" },
    botonTexto: { color: "white", fontWeight: "600", fontSize: TIPOGRAFIA.cuerpo },
    enlace: { color: COLORES.accentCool, fontSize: TIPOGRAFIA.pequeno, textAlign: "center", marginTop: ESPACIADO.lg },
    error: { color: "#F87171", fontSize: TIPOGRAFIA.pequeno, marginTop: ESPACIADO.sm },
    mensaje: { color: COLORES.accentWarm, fontSize: TIPOGRAFIA.pequeno, marginTop: ESPACIADO.sm },
});