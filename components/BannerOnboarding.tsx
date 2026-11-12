import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORES, ESPACIADO, FUENTES, RADIOS, TIPOGRAFIA } from "../constants/theme";
import { obtenerPerfil } from "../lib/api";

const DISMISSED_KEY = "wisp_onboarding_dismissed";

function perfilVacio(raw: string): boolean {
    if (!raw) return true;
    try {
        const p = JSON.parse(raw);
        return !p.sector?.trim() && !p.audiencia?.trim() && !p.estilo && !p.postsReferencia?.trim();
    } catch {
        return false;
    }
}

type Props = {
    onAbrirPerfil: () => void;
};

export default function BannerOnboarding({ onAbrirPerfil }: Props) {
    const { t } = useTranslation();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        AsyncStorage.getItem(DISMISSED_KEY).then((val) => {
            if (val) return;
            obtenerPerfil().then((raw) => {
                if (perfilVacio(raw)) setVisible(true);
            }).catch(() => {});
        }).catch(() => {});
    }, []);

    function descartar() {
        AsyncStorage.setItem(DISMISSED_KEY, "1").catch(() => {});
        setVisible(false);
    }

    if (!visible) return null;

    return (
        <View style={s.contenedor}>
            <Text style={s.icono}>✦</Text>
            <Text style={s.texto}>{t("onboarding.banner")}</Text>
            <TouchableOpacity onPress={() => { onAbrirPerfil(); descartar(); }} activeOpacity={0.8}>
                <Text style={s.accion}>{t("onboarding.completarPerfil")} →</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={descartar} activeOpacity={0.6} style={{ padding: 4 }}>
                <Text style={s.cerrar}>✕</Text>
            </TouchableOpacity>
        </View>
    );
}

const s = StyleSheet.create({
    contenedor: {
        flexDirection: "row",
        alignItems: "center",
        gap: ESPACIADO.sm,
        borderRadius: RADIOS.sm,
        paddingHorizontal: ESPACIADO.md,
        paddingVertical: ESPACIADO.sm + 2,
        backgroundColor: "rgba(234,179,8,0.10)",
        borderWidth: 1,
        borderColor: "rgba(234,179,8,0.25)",
        width: "100%",
    },
    icono: { color: COLORES.accentWarm, fontSize: 14, flexShrink: 0 },
    texto: { flex: 1, fontFamily: FUENTES.cuerpo, fontSize: TIPOGRAFIA.minimo + 1, color: COLORES.text },
    accion: { fontFamily: FUENTES.cuerpoMedio, fontSize: TIPOGRAFIA.minimo + 1, color: COLORES.accentCool, flexShrink: 0 },
    cerrar: { fontFamily: FUENTES.cuerpo, fontSize: TIPOGRAFIA.minimo + 1, color: COLORES.textMuted },
});
