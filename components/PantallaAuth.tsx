import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import { COLORES, ESPACIADO, FUENTES, RADIOS, TIPOGRAFIA } from "../constants/theme";
import { supabase } from "../lib/supabase";
import SelectorIdioma from "./SelectorIdioma";

function localizarError(msg: string, t: (k: string) => string): string {
    const m = msg.toLowerCase();
    if (m.includes("invalid login credentials") || m.includes("invalid email or password")) return t("auth.errorCredenciales");
    if (m.includes("email not confirmed")) return t("auth.errorEmailNoConfirmado");
    if (m.includes("user already registered") || m.includes("already registered")) return t("auth.errorEmailRegistrado");
    if (m.includes("password should be at least") || m.includes("password must be at least")) return t("auth.errorPasswordCorta");
    if (m.includes("unable to validate email") || m.includes("invalid email")) return t("auth.errorEmailInvalido");
    if (m.includes("rate limit") || m.includes("too many requests") || m.includes("email rate limit")) return t("auth.errorRateLimit");
    return t("auth.errorGenerico");
}

export default function PantallaAuth() {
    const { t } = useTranslation();
    const [modo, setModo] = useState<"login" | "registro" | "recuperar">("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [verPassword, setVerPassword] = useState(false);
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [cargando, setCargando] = useState(false);
    const [emailPendiente, setEmailPendiente] = useState("");

    async function manejarSubmit() {
        setError("");
        setMensaje("");
        setCargando(true);
        try {
            if (modo === "recuperar") {
                const { error } = await supabase.auth.resetPasswordForEmail(email);
                if (error) throw error;
                setMensaje(t("auth.recuperarEnviado"));
            } else if (modo === "registro") {
                const { error, data } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                if (!data.session) {
                    setMensaje(t("auth.confirmacion"));
                    setEmailPendiente(email);
                }
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            }
        } catch (err: any) {
            setError(localizarError(err.message || "", t));
        } finally {
            setCargando(false);
        }
    }

    async function reenviarConfirmacion() {
        if (!emailPendiente) return;
        setCargando(true);
        try {
            await supabase.auth.resend({ type: "signup", email: emailPendiente });
            setMensaje(t("auth.confirmacionReenviada"));
        } catch {
            setError(t("auth.errorGenerico"));
        } finally {
            setCargando(false);
        }
    }

    function cambiarModo(nuevoModo: "login" | "registro" | "recuperar") {
        setModo(nuevoModo);
        setError("");
        setMensaje("");
        setVerPassword(false);
        setEmailPendiente("");
    }

    return (
        <View style={[styles.container, styles.centrado]}>
            <View style={{ position: "absolute", top: ESPACIADO.xl, right: ESPACIADO.xl }}>
                <SelectorIdioma />
            </View>

            <Text style={styles.titulo}>{t("app.nombre")}</Text>
            <Text style={styles.subtitulo}>{t("app.lema")}</Text>

            <Text style={[styles.subtitulo, {
                marginTop: ESPACIADO.xl,
                marginBottom: ESPACIADO.md,
                fontSize: TIPOGRAFIA.subtitulo,
                color: COLORES.text,
                fontFamily: FUENTES.cuerpoNegro,
            }]}>
                {modo === "recuperar" ? t("auth.recuperar") : modo === "login" ? t("auth.login") : t("auth.registro")}
            </Text>

            <TextInput
                style={styles.input}
                placeholder={t("auth.email")}
                placeholderTextColor={COLORES.textMuted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                selectionColor={COLORES.accentCool}
                cursorColor={COLORES.accentCool}
            />

            {modo !== "recuperar" && (
                <>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={[styles.input, { flex: 1, marginTop: 0, borderWidth: 0 }]}
                            placeholder={t("auth.password")}
                            placeholderTextColor={COLORES.textMuted}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!verPassword}
                            autoComplete={modo === "login" ? "current-password" : "new-password"}
                            selectionColor={COLORES.accentCool}
                            cursorColor={COLORES.accentCool}
                        />
                        <TouchableOpacity
                            onPress={() => setVerPassword((v) => !v)}
                            style={styles.togglePassword}
                            accessibilityLabel={verPassword ? t("auth.ocultarPassword") : t("auth.mostrarPassword")}
                        >
                            <FontAwesome6
                                name={verPassword ? "eye-slash" : "eye"}
                                size={15}
                                color={COLORES.textMuted}
                            />
                        </TouchableOpacity>
                    </View>
                    {modo === "registro" && (
                        <Text style={styles.hint}>{t("auth.passwordHint")}</Text>
                    )}
                </>
            )}

            {error ? <Text style={styles.error}>{error}</Text> : null}
            {mensaje ? <Text style={styles.mensaje}>{mensaje}</Text> : null}
            {emailPendiente ? (
                <TouchableOpacity onPress={reenviarConfirmacion} disabled={cargando}>
                    <Text style={[styles.enlace, { fontSize: TIPOGRAFIA.pequeno, color: COLORES.textMuted, marginTop: ESPACIADO.xs }]}>
                        {t("auth.reenviarConfirmacion")}
                    </Text>
                </TouchableOpacity>
            ) : null}

            <TouchableOpacity style={styles.boton} onPress={manejarSubmit} disabled={cargando}>
                {cargando ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text style={styles.botonTexto}>
                        {modo === "recuperar"
                            ? t("auth.recuperarBoton")
                            : modo === "login"
                            ? t("auth.entrar")
                            : t("auth.registrarme")}
                    </Text>
                )}
            </TouchableOpacity>

            {modo === "login" && (
                <>
                    <TouchableOpacity onPress={() => cambiarModo("registro")}>
                        <Text style={styles.enlace}>{t("auth.sinCuenta")}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => cambiarModo("recuperar")}>
                        <Text style={[styles.enlace, { color: COLORES.textMuted, marginTop: ESPACIADO.xs }]}>
                            {t("auth.olvidaste")}
                        </Text>
                    </TouchableOpacity>
                </>
            )}
            {modo === "registro" && (
                <TouchableOpacity onPress={() => cambiarModo("login")}>
                    <Text style={styles.enlace}>{t("auth.conCuenta")}</Text>
                </TouchableOpacity>
            )}
            {modo === "recuperar" && (
                <TouchableOpacity onPress={() => cambiarModo("login")}>
                    <Text style={[styles.enlace, { marginTop: ESPACIADO.md }]}>{t("auth.volverLogin")}</Text>
                </TouchableOpacity>
            )}

            <StatusBar style="light" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORES.bg, paddingHorizontal: ESPACIADO.xl },
    centrado: { justifyContent: "center", alignItems: "center" },
    titulo: { fontSize: TIPOGRAFIA.titulo, fontFamily: FUENTES.display, color: COLORES.accentWarm },
    subtitulo: { fontSize: TIPOGRAFIA.pequeno, fontFamily: FUENTES.cuerpo, color: COLORES.textMuted, marginTop: ESPACIADO.xs },
    input: {
        width: "100%",
        borderWidth: 1,
        borderColor: COLORES.border,
        borderRadius: RADIOS.sm,
        padding: ESPACIADO.md,
        marginTop: ESPACIADO.sm,
        color: COLORES.text,
        fontSize: TIPOGRAFIA.cuerpo,
        fontFamily: FUENTES.cuerpo,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        borderWidth: 1,
        borderColor: COLORES.border,
        borderRadius: RADIOS.sm,
        marginTop: ESPACIADO.sm,
        paddingRight: ESPACIADO.md,
    },
    togglePassword: { padding: ESPACIADO.sm },
    hint: { alignSelf: "flex-start", color: COLORES.textMuted, fontSize: TIPOGRAFIA.pequeno, fontFamily: FUENTES.cuerpo, marginTop: ESPACIADO.xs },
    boton: { width: "100%", backgroundColor: COLORES.accentCool, borderRadius: RADIOS.sm, padding: ESPACIADO.md + 2, marginTop: ESPACIADO.lg, alignItems: "center" },
    botonTexto: { color: "white", fontFamily: FUENTES.cuerpoNegro, fontSize: TIPOGRAFIA.cuerpo },
    enlace: { color: COLORES.accentCool, fontFamily: FUENTES.cuerpo, fontSize: TIPOGRAFIA.pequeno, textAlign: "center", marginTop: ESPACIADO.lg },
    error: { color: "#F87171", fontFamily: FUENTES.cuerpo, fontSize: TIPOGRAFIA.pequeno, marginTop: ESPACIADO.sm, textAlign: "center" },
    mensaje: { color: COLORES.accentWarm, fontFamily: FUENTES.cuerpo, fontSize: TIPOGRAFIA.pequeno, marginTop: ESPACIADO.sm, textAlign: "center" },
});
