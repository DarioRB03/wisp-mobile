import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ItemHistorial from "../components/ItemHistorial";
import ModalNota from "../components/ModalNota";
import SkeletonHistorial from "../components/SkeletonHistorial";
import TabBar from "../components/TabBar";
import { COLORES, ESPACIADO, RADIOS, TIPOGRAFIA } from "../constants/theme";
import { borrarNota, enviarFeedback, obtenerHistorial } from "../lib/api";

type Nota = {
    id: string;
    texto: string;
    post: string;
    formato: string;
    feedback: string | null;
    creado_en: string;
};

const FILTROS = [
    { valor: "todos", etiqueta: "historial.todos" },
    { valor: "linkedin", etiqueta: "LinkedIn" },
    { valor: "hilo", etiqueta: "X" },
    { valor: "instagram", etiqueta: "Instagram" },
    { valor: "tiktok", etiqueta: "TikTok" },
    { valor: "youtube", etiqueta: "YouTube" },
    { valor: "email", etiqueta: "Email" },
];

export default function Historial() {
    const { t, i18n } = useTranslation();

    const [notas, setNotas] = useState<Nota[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [seleccionada, setSeleccionada] = useState<Nota | null>(null);
    const [filtro, setFiltro] = useState("todos");
    const [orden, setOrden] = useState<"reciente" | "antiguo">("reciente");

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
                <Text style={styles.titulo}>{t("historial.titulo")}</Text>
            </View>

            {cargando ? (
                <SkeletonHistorial />
            ) : error ? (
                <Text style={styles.error}>{error}</Text>
            ) : notas.length === 0 ? (
                <Text style={styles.vacio}>{t("historial.vacio")}</Text>
            ) : (
                <>
                    <View style={styles.controles}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtrosFila}>
                            {FILTROS.map((f) => {
                                const activo = filtro === f.valor;
                                const etiqueta = f.valor === "todos" ? t(f.etiqueta) : f.etiqueta;
                                return (
                                    <TouchableOpacity
                                        key={f.valor}
                                        onPress={() => setFiltro(f.valor)}
                                        style={[styles.chip, { backgroundColor: activo ? COLORES.accentCool : "transparent", borderColor: activo ? COLORES.accentCool : COLORES.border }]}
                                    >
                                        <Text style={{ color: activo ? "white" : COLORES.textMuted, fontSize: TIPOGRAFIA.minimo }}>{etiqueta}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                        <View style={styles.ordenFila}>
                            <TouchableOpacity
                                onPress={() => setOrden(orden === "reciente" ? "antiguo" : "reciente")}
                                style={styles.ordenBtn}
                            >
                                <Text style={styles.ordenTexto}>
                                    {orden === "reciente" ? t("historial.masReciente") : t("historial.masAntiguo")} ▾
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <FlatList
                        data={notas
                            .filter((n) => filtro === "todos" || n.formato === filtro)
                            .sort((a, b) => {
                                const diff = new Date(a.creado_en).getTime() - new Date(b.creado_en).getTime();
                                return orden === "reciente" ? -diff : diff;
                            })}
                        extraData={[i18n.language, filtro, orden]}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ padding: ESPACIADO.lg, gap: ESPACIADO.sm + 2, paddingBottom: 90 }}
                        ListEmptyComponent={<Text style={styles.vacio}>{t("historial.sinResultados")}</Text>}
                        renderItem={({ item }) => (
                            <ItemHistorial
                                formato={item.formato}
                                fecha={formatearFecha(item.creado_en)}
                                post={item.post}
                                onPress={() => setSeleccionada(item)}
                                onEliminar={() => manejarBorrar(item.id)}
                            />
                        )}
                    />
                </>
            )}

            <ModalNota
                nota={seleccionada ? { ...seleccionada, fecha: formatearFecha(seleccionada.creado_en) } : null}
                onCerrar={() => setSeleccionada(null)}
                onBorrar={manejarBorrar}
                onFeedback={manejarFeedback}
            />
            <TabBar />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORES.bg, paddingTop: 60 },
    header: { paddingHorizontal: ESPACIADO.lg, marginBottom: ESPACIADO.sm + 2 },
    titulo: { fontSize: TIPOGRAFIA.subtitulo, fontWeight: "600", color: COLORES.text },
    error: { color: "#F87171", textAlign: "center", marginTop: ESPACIADO.xxl + 8 },
    vacio: { color: COLORES.textMuted, textAlign: "center", marginTop: ESPACIADO.xxl + 8, fontSize: TIPOGRAFIA.pequeno },
    controles: { paddingHorizontal: ESPACIADO.lg, gap: ESPACIADO.sm },
    filtrosFila: { flexDirection: "row", gap: ESPACIADO.xs + 2 },
    chip: { borderWidth: 1, borderRadius: RADIOS.full, paddingHorizontal: ESPACIADO.sm + 2, paddingVertical: ESPACIADO.xs },
    ordenFila: { flexDirection: "row", justifyContent: "flex-end" },
    ordenBtn: { paddingVertical: ESPACIADO.xs, paddingHorizontal: ESPACIADO.sm },
    ordenTexto: { color: COLORES.textMuted, fontSize: TIPOGRAFIA.minimo },
});