import { useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORES, ESPACIADO, FUENTES, RADIOS, TIPOGRAFIA } from "../constants/theme";
import { enviarMotivoFeedback } from "../lib/api";

const MOTIVOS = ["no_suena_a_mi", "demasiado_formal", "demasiado_largo", "inventa_cosas", "estructura_ia", "otro"] as const;

type Props = {
    notaId: string;
    onOmitir: () => void;
};

export default function MotivoFeedback({ notaId, onOmitir }: Props) {
    const { t } = useTranslation();
    const [listo, setListo] = useState(false);

    async function seleccionar(motivo: string) {
        try { await enviarMotivoFeedback(notaId, motivo); } catch {}
        setListo(true);
        setTimeout(onOmitir, 1200);
    }

    if (listo) {
        return <Text style={s.anotado}>{t("feedback.anotado")}</Text>;
    }

    return (
        <View style={s.contenedor}>
            <Text style={s.titulo}>{t("feedback.motivoTitulo")}</Text>
            <View style={s.chips}>
                {MOTIVOS.map((m) => (
                    <TouchableOpacity key={m} style={s.chip} onPress={() => seleccionar(m)} activeOpacity={0.7}>
                        <Text style={s.chipTexto}>{t(`feedback.motivo_${m}`)}</Text>
                    </TouchableOpacity>
                ))}
                <TouchableOpacity style={[s.chip, s.chipOmitir]} onPress={onOmitir} activeOpacity={0.7}>
                    <Text style={[s.chipTexto, { color: COLORES.textMuted }]}>{t("feedback.omitir")}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    contenedor: { gap: ESPACIADO.sm },
    titulo: { fontFamily: FUENTES.cuerpo, fontSize: TIPOGRAFIA.minimo + 1, color: COLORES.textMuted },
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
