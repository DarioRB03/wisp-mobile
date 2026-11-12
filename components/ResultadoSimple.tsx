import * as Clipboard from "expo-clipboard";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { COLORES, ESPACIADO, FUENTES, RADIOS, TIPOGRAFIA } from "../constants/theme";
import { DESTINOS, copiarYAbrir, etiquetaDestino } from "../lib/destinos";
import type { ExtraGuardado } from "../lib/api";
import BotonConRebote from "./BotonConRebote";
import MotivoFeedback from "./FeedbackPost";

type Props = {
    post: string;
    formato: string;
    onGuardar: (post: string, feedback?: "positivo" | "negativo", extra?: ExtraGuardado) => Promise<string>;
};

export default function ResultadoSimple({ post, formato, onGuardar }: Props) {
    const { t } = useTranslation();
    const [guardado, setGuardado] = useState(false);
    const [copiado, setCopiado] = useState(false);
    const [editando, setEditando] = useState(false);
    const [borrador, setBorrador] = useState("");
    const [textoFinal, setTextoFinal] = useState("");
    const [notaId, setNotaId] = useState<string | null>(null);

    const destino = DESTINOS[formato];
    const postActivo = textoFinal || post;

    function iniciarEdicion() {
        setBorrador(postActivo);
        setEditando(true);
    }

    function confirmarEdicion() {
        setTextoFinal(borrador.trim() || post);
        setEditando(false);
    }

    function cancelarEdicion() {
        setEditando(false);
        setBorrador("");
    }

    async function copiar() {
        await Clipboard.setStringAsync(postActivo);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 1800);
    }

    async function guardar(feedback?: "positivo" | "negativo") {
        setGuardado(true);
        const id = await onGuardar(postActivo, feedback, {
            postGenerado: textoFinal ? post : undefined,
            tono: "personalizado",
        });
        if (feedback === "negativo") setNotaId(id);
    }

    return (
        <View style={styles.contenedor}>
            <View style={styles.caja}>
                {editando ? (
                    <>
                        <TextInput
                            style={styles.inputEdicion}
                            value={borrador}
                            onChangeText={setBorrador}
                            multiline
                            autoFocus
                            textAlignVertical="top"
                        />
                        <View style={{ flexDirection: "row", gap: ESPACIADO.sm, padding: ESPACIADO.sm }}>
                            <TouchableOpacity style={styles.botonConfirmar} onPress={confirmarEdicion}>
                                <Text style={styles.botonConfirmarTexto}>{t("comun.editarConfirmar")}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.botonCancelar} onPress={cancelarEdicion}>
                                <Text style={styles.botonCancelarTexto}>{t("comun.cancelar")}</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                ) : (
                    <Text style={styles.texto}>{postActivo}</Text>
                )}
            </View>

            <BotonConRebote style={[styles.boton, { backgroundColor: COLORES.accentCool }]} onPress={copiar}>
                <Text style={styles.botonTexto}>{copiado ? t("comun.copiado") : t("comun.copiar")}</Text>
            </BotonConRebote>

            {destino && (
                <TouchableOpacity
                    style={[styles.boton, { backgroundColor: destino.color }]}
                    onPress={() => copiarYAbrir(formato, postActivo)}
                >
                    <Text style={styles.botonTexto}>{etiquetaDestino(formato, t)}</Text>
                </TouchableOpacity>
            )}

            {!editando && (
                <TouchableOpacity
                    style={[styles.boton, { backgroundColor: "transparent", borderWidth: 1, borderColor: COLORES.border }]}
                    onPress={iniciarEdicion}
                >
                    <Text style={[styles.botonTexto, { color: COLORES.textMuted }]}>{t("comun.editarPost")}</Text>
                </TouchableOpacity>
            )}

            <View style={{ flexDirection: "row", alignItems: "center", gap: ESPACIADO.xs }}>
                <BotonConRebote
                    style={[styles.botonGuardar, { opacity: guardado ? 0.5 : 1 }]}
                    onPress={() => guardar()}
                    disabled={guardado}
                >
                    <Text style={[styles.botonTexto, { color: COLORES.textMuted }]}>
                        {guardado ? t("comun.guardado") : t("comun.guardarHistorial")}
                    </Text>
                </BotonConRebote>
                {!guardado && (
                    <>
                        <TouchableOpacity style={styles.botonEmoji} onPress={() => guardar("positivo")} activeOpacity={0.7}>
                            <Text style={styles.emoji}>👍</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.botonEmoji} onPress={() => guardar("negativo")} activeOpacity={0.7}>
                            <Text style={styles.emoji}>👎</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>

            {notaId && (
                <MotivoFeedback notaId={notaId} onOmitir={() => setNotaId(null)} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    contenedor: { width: "100%", marginTop: ESPACIADO.xl - 4, gap: ESPACIADO.sm },
    caja: { width: "100%", borderWidth: 1, borderColor: COLORES.accentWarm, borderRadius: RADIOS.sm },
    texto: { color: COLORES.text, fontFamily: FUENTES.cuerpo, fontSize: TIPOGRAFIA.cuerpo, padding: ESPACIADO.md },
    inputEdicion: {
        color: COLORES.text,
        fontFamily: FUENTES.cuerpo,
        fontSize: TIPOGRAFIA.cuerpo,
        padding: ESPACIADO.md,
        minHeight: 120,
    },
    botonConfirmar: {
        backgroundColor: COLORES.accentCool,
        borderRadius: RADIOS.sm,
        paddingHorizontal: ESPACIADO.md,
        paddingVertical: ESPACIADO.xs + 2,
    },
    botonConfirmarTexto: { color: "white", fontFamily: FUENTES.cuerpoNegro, fontSize: TIPOGRAFIA.minimo + 1 },
    botonCancelar: {
        borderWidth: 1,
        borderColor: COLORES.border,
        borderRadius: RADIOS.sm,
        paddingHorizontal: ESPACIADO.md,
        paddingVertical: ESPACIADO.xs + 2,
    },
    botonCancelarTexto: { color: COLORES.textMuted, fontFamily: FUENTES.cuerpo, fontSize: TIPOGRAFIA.minimo + 1 },
    boton: { width: "100%", borderRadius: RADIOS.sm, padding: ESPACIADO.md + 2, alignItems: "center" },
    botonTexto: { color: "white", fontFamily: FUENTES.cuerpoNegro, fontSize: TIPOGRAFIA.cuerpo },
    botonGuardar: {
        flex: 1,
        borderRadius: RADIOS.sm,
        padding: ESPACIADO.md + 2,
        alignItems: "center",
        borderWidth: 1,
        borderColor: COLORES.border,
        backgroundColor: "transparent",
    },
    botonEmoji: {
        borderRadius: RADIOS.sm,
        padding: ESPACIADO.sm,
        alignItems: "center",
        justifyContent: "center",
    },
    emoji: { fontSize: 20 },
});
