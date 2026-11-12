import { useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORES, ESPACIADO, FUENTES, RADIOS, TIPOGRAFIA } from "../constants/theme";
import { enviarFeedback, enviarMotivoFeedback } from "../lib/api";

const MOTIVOS = ["no_suena_a_mi", "demasiado_formal", "demasiado_largo", "inventa_cosas", "estructura_ia", "otro"] as const;

type Props = {
    postId: string | null;
};

export default function FeedbackPost({ postId }: Props) {
    const { t } = useTranslation();
    const [fase, setFase] = useState<"esperando" | "motivos" | "listo">("esperando");

    if (!postId) return null;

    async function meGusta() {
        if (!postId) return;
        try { await enviarFeedback(postId, "positivo"); } catch {}
        setFase("listo");
    }

    async function noMeGusta() {
        setFase("motivos");
    }

    async function seleccionarMotivo(motivo: string) {
        if (!postId) return;
        try { await enviarMotivoFeedback(postId, motivo); } catch {}
        setFase("listo");
    }

    if (fase === "listo") {
        return <Text style={s.anotado}>{t("feedback.anotado")}</Text>;
    }

    if (fase === "motivos") {
        return (
            <View style={s.motivos}>
                <Text style={s.motivoTitulo}>{t("feedback.motivoTitulo")}</Text>
                <View style={s.chips}>
                    {MOTIVOS.map((m) => (
                        <TouchableOpacity key={m} style={s.chip} onPress={() => seleccionarMotivo(m)} activeOpacity={0.7}>
                            <Text style={s.chipTexto}>{t(`feedback.motivo_${m}`)}</Text>
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity style={[s.chip, s.chipOmitir]} onPress={() => setFase("listo")} activeOpacity={0.7}>
                        <Text style={[s.chipTexto, { color: COLORES.textMuted }]}>{t("feedback.omitir")}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={s.fila}>
            <TouchableOpacity style={[s.boton, s.botonSi]} onPress={meGusta} activeOpacity={0.7}>
                <Text style={s.botonTexto}>{t("comun.meGusta")}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.boton, s.botonNo]} onPress={noMeGusta} activeOpacity={0.7}>
                <Text style={s.botonTexto}>{t("comun.noMeGusta")}</Text>
            </TouchableOpacity>
        </View>
    );
}

const s = StyleSheet.create({
    fila: { flexDirection: "row", gap: ESPACIADO.sm },
    boton: {
        flex: 1,
        borderRadius: RADIOS.sm,
        paddingVertical: ESPACIADO.sm,
        alignItems: "center",
        borderWidth: 1,
    },
    botonSi: { borderColor: "rgba(74,222,128,0.4)", backgroundColor: "rgba(74,222,128,0.07)" },
    botonNo: { borderColor: COLORES.border, backgroundColor: "transparent" },
    botonTexto: { fontFamily: FUENTES.cuerpo, fontSize: TIPOGRAFIA.pequeno, color: COLORES.text },
    motivos: { gap: ESPACIADO.sm },
    motivoTitulo: { fontFamily: FUENTES.cuerpo, fontSize: TIPOGRAFIA.minimo + 1, color: COLORES.textMuted },
    chips: { flexDirection: "row", flexWrap: "wrap", gap: ESPACIADO.xs },
    chip: {
        borderWidth: 1,
        borderColor: COLORES.border,
        borderRadius: RADIOS.full,
        paddingHorizontal: ESPACIADO.md,
        paddingVertical: 4,
    },
    chipOmitir: { borderColor: "transparent" },
    chipTexto: { fontFamily: FUENTES.cuerpo, fontSize: TIPOGRAFIA.minimo + 1, color: COLORES.text },
    anotado: { fontFamily: FUENTES.cuerpo, fontSize: TIPOGRAFIA.pequeno, color: COLORES.textMuted, textAlign: "center" },
});
