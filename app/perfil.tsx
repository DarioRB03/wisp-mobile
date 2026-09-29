import { router } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { COLORES, ESPACIADO, RADIOS, TIPOGRAFIA } from "../constants/theme";
import { guardarPerfil, obtenerPerfil } from "../lib/api";

export default function Perfil() {
    const { t } = useTranslation();

    const [contexto, setContexto] = useState("");
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [guardado, setGuardado] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        obtenerPerfil()
            .then(setContexto)
            .catch(() => setError(t("perfil.errorCargar")))
            .finally(() => setCargando(false));
    }, []);

    async function manejarGuardar() {
        setGuardando(true);
        setGuardado(false);
        setError("");
        try {
            await guardarPerfil(contexto);
            setGuardado(true);
        } catch (err) {
            setError(t("perfil.errorGuardar"));
        } finally {
            setGuardando(false);
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.enlace}>{t("comun.volver")}</Text>
                </TouchableOpacity>
                <Text style={styles.titulo}>{t("perfil.titulo")}</Text>
                <View style={{ width: 50 }} />
            </View>

            <View style={styles.contenido}>
                <Text style={styles.descripcion}>{t("perfil.descripcion")}</Text>

                {cargando ? (
                    <ActivityIndicator color={COLORES.accentCool} style={{ marginTop: ESPACIADO.lg }} />
                ) : (
                    <>
                        <TextInput
                            style={styles.input}
                            value={contexto}
                            onChangeText={setContexto}
                            placeholder={t("perfil.placeholder")}
                            placeholderTextColor={COLORES.textMuted}
                            multiline
                        />
                        {error ? <Text style={styles.error}>{error}</Text> : null}
                        <TouchableOpacity style={styles.boton} onPress={manejarGuardar} disabled={guardando}>
                            {guardando ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={styles.botonTexto}>{guardado ? t("comun.guardado") : t("perfil.guardar")}</Text>
                            )}
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORES.bg, paddingTop: 60 },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: ESPACIADO.lg, marginBottom: ESPACIADO.lg },
    titulo: { fontSize: TIPOGRAFIA.subtitulo, fontWeight: "600", color: COLORES.text },
    enlace: { color: COLORES.accentCool, fontSize: TIPOGRAFIA.cuerpo },
    contenido: { paddingHorizontal: ESPACIADO.lg },
    descripcion: { color: COLORES.textMuted, fontSize: TIPOGRAFIA.pequeno, marginBottom: ESPACIADO.lg },
    input: {
        borderWidth: 1,
        borderColor: COLORES.border,
        borderRadius: RADIOS.sm,
        padding: ESPACIADO.md,
        color: COLORES.text,
        fontSize: TIPOGRAFIA.cuerpo,
        minHeight: 120,
        textAlignVertical: "top",
    },
    boton: { backgroundColor: COLORES.accentCool, borderRadius: RADIOS.sm, padding: ESPACIADO.md + 2, marginTop: ESPACIADO.md, alignItems: "center" },
    botonTexto: { color: "white", fontWeight: "600", fontSize: TIPOGRAFIA.cuerpo },
    error: { color: "#F87171", fontSize: TIPOGRAFIA.pequeno, marginTop: ESPACIADO.sm },
});