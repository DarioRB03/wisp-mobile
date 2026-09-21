import { router } from "expo-router";
import { useEffect, useState } from "react";
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

type NotaFormateada = Nota & { fecha: string };

export default function Historial() {
    const [notas, setNotas] = useState<NotaFormateada[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [seleccionada, setSeleccionada] = useState<NotaFormateada | null>(null);

    useEffect(() => {
        cargarHistorial();
    }, []);

    async function cargarHistorial() {
        setCargando(true);
        try {
            const datos: Nota[] = await obtenerHistorial();
            const formateado = datos.map((n) => ({
                ...n,
                fecha: new Date(n.creado_en).toLocaleDateString("es-ES", { day: "numeric", month: "short" }),
            }));
            setNotas(formateado);
        } catch (err) {
            setError("No se pudo cargar el historial.");
        } finally {
            setCargando(false);
        }
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
                    <Text style={styles.enlace}>← Volver</Text>
                </TouchableOpacity>
                <Text style={styles.titulo}>Historial</Text>
                <View style={{ width: 50 }} />
            </View>

            {cargando ? (
                <ActivityIndicator color={COLORES.accentCool} style={{ marginTop: ESPACIADO.xxl + 8 }} />
            ) : error ? (
                <Text style={styles.error}>{error}</Text>
            ) : notas.length === 0 ? (
                <Text style={styles.vacio}>Todavía no has guardado ningún post.</Text>
            ) : (
                <FlatList
                    data={notas}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: ESPACIADO.lg, gap: ESPACIADO.sm + 2 }}
                    renderItem={({ item }) => (
                        <ItemHistorial
                            formato={item.formato}
                            fecha={item.fecha}
                            post={item.post}
                            onPress={() => setSeleccionada(item)}
                        />
                    )}
                />
            )}

            <ModalNota
                nota={seleccionada}
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