import * as Clipboard from "expo-clipboard";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORES, ESPACIADO, RADIOS, TIPOGRAFIA } from "../constants/theme";

type Nota = {
    id: string;
    post: string;
    formato: string;
    feedback: string | null;
    fecha: string;
};

type Props = {
    nota: Nota | null;
    onCerrar: () => void;
    onBorrar: (id: string) => Promise<void>;
    onFeedback: (id: string, valor: "positivo" | "negativo") => Promise<void>;
};

export default function ModalNota({ nota, onCerrar, onBorrar, onFeedback }: Props) {
    const { t } = useTranslation();
    const [copiado, setCopiado] = useState(false);
    const [borrando, setBorrando] = useState(false);
    const [feedbackLocal, setFeedbackLocal] = useState<string | null>(null);

    useEffect(() => {
        setCopiado(false);
        setBorrando(false);
        setFeedbackLocal(null);
    }, [nota?.id]);

    if (!nota) return null;

    const feedbackActual = feedbackLocal !== null ? feedbackLocal : nota.feedback;

    async function copiar() {
        await Clipboard.setStringAsync(nota!.post);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 1800);
    }

    async function borrar() {
        setBorrando(true);
        try {
            await onBorrar(nota!.id);
            onCerrar();
        } catch (err) {
            setBorrando(false);
        }
    }

    async function marcarFeedback(valor: "positivo" | "negativo") {
        setFeedbackLocal(valor);
        try {
            await onFeedback(nota!.id, valor);
        } catch (err) {
            setFeedbackLocal(nota!.feedback);
        }
    }

    return (
        <Modal visible transparent animationType="fade" onRequestClose={onCerrar}>
            <View style={styles.fondo}>
                <View style={styles.caja}>
                    <View style={styles.header}>
                        <Text style={styles.fecha}>{nota.fecha}</Text>
                        <TouchableOpacity onPress={onCerrar}>
                            <Text style={styles.enlace}>{t("comun.cerrar")} ✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={{ maxHeight: 300 }}>
                        <Text style={styles.post}>{nota.post}</Text>
                    </ScrollView>

                    <View style={styles.filaFeedback}>
                        <Text style={styles.pregunta}>{t("historial.util")}</Text>
                        <TouchableOpacity
                            onPress={() => marcarFeedback("positivo")}
                            style={[styles.chip, feedbackActual === "positivo" && { backgroundColor: COLORES.accentCool, borderColor: COLORES.accentCool }]}
                        >
                            <Text style={{ color: feedbackActual === "positivo" ? "white" : COLORES.textMuted, fontSize: TIPOGRAFIA.minimo }}>
                                {t("historial.siUtil")}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => marcarFeedback("negativo")}
                            style={[styles.chip, feedbackActual === "negativo" && { backgroundColor: COLORES.danger, borderColor: COLORES.danger }]}
                        >
                            <Text style={{ color: feedbackActual === "negativo" ? "white" : COLORES.textMuted, fontSize: TIPOGRAFIA.minimo }}>
                                {t("historial.noUtil")}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.filaBotones}>
                        <TouchableOpacity style={[styles.boton, { backgroundColor: COLORES.accentCool }]} onPress={copiar}>
                            <Text style={styles.botonTexto}>{copiado ? t("comun.copiado") : t("comun.copiarPost")}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.boton, { borderWidth: 1, borderColor: COLORES.danger }]}
                            onPress={borrar}
                            disabled={borrando}
                        >
                            <Text style={[styles.botonTexto, { color: COLORES.danger }]}>
                                {borrando ? t("comun.borrando") : t("comun.eliminar")}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    fondo: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", padding: ESPACIADO.lg },
    caja: { backgroundColor: COLORES.bg, borderWidth: 1, borderColor: COLORES.border, borderRadius: RADIOS.sm, padding: ESPACIADO.lg },
    header: { flexDirection: "row", justifyContent: "space-between", marginBottom: ESPACIADO.md },
    fecha: { color: COLORES.textMuted, fontSize: TIPOGRAFIA.minimo },
    enlace: { color: COLORES.textMuted, fontSize: TIPOGRAFIA.pequeno },
    post: { color: COLORES.text, fontSize: TIPOGRAFIA.cuerpo, lineHeight: 20 },
    filaFeedback: { flexDirection: "row", alignItems: "center", gap: ESPACIADO.xs + 2, marginTop: ESPACIADO.md, flexWrap: "wrap" },
    pregunta: { color: COLORES.textMuted, fontSize: TIPOGRAFIA.minimo, marginRight: ESPACIADO.xs },
    chip: { borderWidth: 1, borderColor: COLORES.border, borderRadius: RADIOS.full, paddingHorizontal: ESPACIADO.sm + 2, paddingVertical: ESPACIADO.xs },
    filaBotones: { flexDirection: "row", gap: ESPACIADO.sm, marginTop: ESPACIADO.md },
    boton: { flex: 1, borderRadius: RADIOS.sm, paddingVertical: ESPACIADO.sm + 2, alignItems: "center" },
    botonTexto: { color: "white", fontWeight: "600", fontSize: TIPOGRAFIA.pequeno },
});