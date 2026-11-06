import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import SelectorIdioma from "../components/SelectorIdioma";
import SkeletonPerfil from "../components/SkeletonPerfil";
import TabBar from "../components/TabBar";
import { COLORES, ESPACIADO, RADIOS, TIPOGRAFIA } from "../constants/theme";
import { guardarPerfil, obtenerPerfil } from "../lib/api";
import { supabase } from "../lib/supabase";

export default function Perfil() {
    const { t } = useTranslation();

    const [contexto, setContexto] = useState("");
    const [cargando, setCargando] = useState(true);
    const [editando, setEditando] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        obtenerPerfil()
            .then((texto) => {
                setContexto(texto);
                setEditando(!texto);
            })
            .catch(() => setError(t("perfil.errorCargar")))
            .finally(() => setCargando(false));
    }, []);

    async function manejarGuardar() {
        Keyboard.dismiss();
        setGuardando(true);
        setError("");
        try {
            await guardarPerfil(contexto);
            setEditando(false);
        } catch (err) {
            setError(t("perfil.errorGuardar"));
        } finally {
            setGuardando(false);
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.titulo}>{t("perfil.titulo")}</Text>
                <View style={styles.headerDer}>
                    <SelectorIdioma />
                    <TouchableOpacity onPress={() => supabase.auth.signOut()}>
                        <Text style={styles.enlace}>{t("nav.cerrarSesion")}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {cargando ? (
                <SkeletonPerfil />
            ) : (
                <View style={styles.contenido}>
                    <Text style={styles.descripcion}>{t("perfil.descripcion")}</Text>
                    {editando ? (
                        <>
                            <TextInput
                                style={styles.input}
                                value={contexto}
                                onChangeText={setContexto}
                                placeholder={t("perfil.placeholder")}
                                placeholderTextColor={COLORES.textMuted}
                                multiline
                                autoFocus
                            />
                            {error ? <Text style={styles.error}>{error}</Text> : null}
                            <TouchableOpacity style={styles.boton} onPress={manejarGuardar} disabled={guardando}>
                                {guardando ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text style={styles.botonTexto}>{t("perfil.guardar")}</Text>
                                )}
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <View style={styles.vistaTexto}>
                                <Text style={styles.textoGuardado}>{contexto || t("perfil.placeholder")}</Text>
                            </View>
                            <TouchableOpacity style={styles.botonEditar} onPress={() => setEditando(true)}>
                                <Text style={styles.botonEditarTexto}>{t("perfil.editar")}</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            )}
            <TabBar />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORES.bg, paddingTop: 60 },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: ESPACIADO.lg, marginBottom: ESPACIADO.lg },
    headerDer: { flexDirection: "row", alignItems: "center", gap: ESPACIADO.md },
    titulo: { fontSize: TIPOGRAFIA.subtitulo, fontWeight: "600", color: COLORES.text },
    enlace: { color: COLORES.danger, fontSize: TIPOGRAFIA.pequeno },
    contenido: { paddingHorizontal: ESPACIADO.lg, paddingBottom: 90 },
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
    botonEditar: { backgroundColor: COLORES.accentCool, borderRadius: RADIOS.sm, padding: ESPACIADO.md + 2, marginTop: ESPACIADO.md, alignItems: "center" },
    botonEditarTexto: { color: "white", fontWeight: "600", fontSize: TIPOGRAFIA.cuerpo },
    vistaTexto: { borderWidth: 1, borderColor: COLORES.border, borderRadius: RADIOS.sm, padding: ESPACIADO.md, minHeight: 120 },
    textoGuardado: { color: COLORES.text, fontSize: TIPOGRAFIA.cuerpo, lineHeight: 20 },
    error: { color: "#F87171", fontSize: TIPOGRAFIA.pequeno, marginTop: ESPACIADO.sm },
});