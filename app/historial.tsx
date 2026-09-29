import { router } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ItemHistorial from "../components/ItemHistorial";
import ModalNota from "../components/ModalNota";
import { COLORES, ESPACIADO, TIPOGRAFIA } from "../constants/theme";
import { borrarNota, enviarFeedback, obtenerHistorial } from "../lib/api";

type Nota = {
    id: string;
    texto: string;
    post: string;
    formato: string;
    feedback: string | null;
    creado_en: string;
};

export default function Historial() {
    const { t, i18n } = useTranslation();

    const [notas, setNotas] = useState<Nota[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [seleccionada, setSeleccionada] = useState<Nota | null>(null);

    useEffect(() => {
        cargarHistorial();
    }, []);

    async function cargarHistorial() {
        setCargando(true);
        try {
            const datos: Nota[] = await obtenerHistorial();
            setNotas(datos);
        } catch (err) {
            setError(t("historial.errorCargar"));
        } finally {
            setCargando(false);
        }
    }

    function formatearFecha(iso: string) {
        const locale = i18n.language === "en" ? "en-GB" : "es-ES";
        return new Date(iso).toLocaleString(locale, {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    async function manejarBorrar(id: string) {
        await borrarNota(id);
        setNotas((prev) => prev.filter((n) => n.id !== id));
    }

    async function manejarFeedback(id: string, valor: "positivo" | "negativo") {
        await enviarFeedback(id, valor);
        setNotas((prev) => prev.map((n) => (n.id === id ? { ...n, feedback: valor } : n)));
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.enlace}>{t("comun.volver")}</Text>
                </TouchableOpacity>
                <Text style={styles.titulo}>{t("historial.titulo")}</Text>
                <View style={{ width: 50 }} />
            </View>

            {cargando ? (
                <ActivityIndicator color={COLORES.accentCool} style={{ marginTop: ESPACIADO.xxl + 8 }} />
            ) : error ? (
                <Text style={styles.error}>{error}</Text>
            ) : notas.length === 0 ? (
                <Text style={styles.vacio}>{t("historial.vacio")}</Text>
            ) : (
                <FlatList
                    data={notas}
                    extraData={i18n.language}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: ESPACIADO.lg, gap: ESPACIADO.sm + 2 }}
                    renderItem={({ item }) => (
                        <ItemHistorial
                            formato={item.formato}
                            fecha={formatearFecha(item.creado_en)}
                            post={item.post}
                            onPress={() => setSeleccionada(item)}
                        />
                    )}
                />
            )}

            <ModalNota
                nota={seleccionada ? { ...seleccionada, fecha: formatearFecha(seleccionada.creado_en) } : null}
                onCerrar={() => setSeleccionada(null)}
                onBorrar={manejarBorrar}
                onFeedback={manejarFeedback}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORES.bg, paddingTop: 60 },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: ESPACIADO.lg, marginBottom: ESPACIADO.sm + 2 },
    titulo: { fontSize: TIPOGRAFIA.subtitulo, fontWeight: "600", color: COLORES.text },
    enlace: { color: COLORES.accentCool, fontSize: TIPOGRAFIA.cuerpo },
    error: { color: "#F87171", textAlign: "center", marginTop: ESPACIADO.xxl + 8 },
    vacio: { color: COLORES.textMuted, textAlign: "center", marginTop: ESPACIADO.xxl + 8, fontSize: TIPOGRAFIA.pequeno },
});