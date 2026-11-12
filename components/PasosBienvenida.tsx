import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORES, ESPACIADO, FUENTES, RADIOS, TIPOGRAFIA } from "../constants/theme";
import { obtenerFicha, obtenerPerfil, obtenerUso } from "../lib/api";

const DISMISSED_KEY = "wisp_pasos_dismissed";

type Paso = { etiqueta: string; hecho: boolean; accion?: () => void };

type Props = {
    onAbrirPerfil: () => void;
};

export default function PasosBienvenida({ onAbrirPerfil }: Props) {
    const { t } = useTranslation();
    const [visible, setVisible] = useState(false);
    const [pasos, setPasos] = useState<Paso[]>([]);

    useEffect(() => {
        AsyncStorage.getItem(DISMISSED_KEY).then((val) => {
            if (val) return;
            cargar();
        }).catch(() => {});
    }, []);

    async function cargar() {
        try {
            const [perfilRaw, uso, ficha] = await Promise.all([
                obtenerPerfil().catch(() => null),
                obtenerUso().catch(() => null),
                obtenerFicha().catch(() => null),
            ]);

            const perfilCompleto = (() => {
                if (!perfilRaw) return false;
                try {
                    const p = JSON.parse(perfilRaw);
                    return !!(p.sector?.trim() || p.audiencia?.trim() || p.estilo);
                } catch { return false; }
            })();

            const tieneNotas = (uso?.usadas ?? 0) > 0;
            const tieneVoz = !!ficha?.ficha;

            const listaPasos: Paso[] = [
                { etiqueta: t("onboarding.paso1"), hecho: perfilCompleto, accion: perfilCompleto ? undefined : onAbrirPerfil },
                { etiqueta: t("onboarding.paso2"), hecho: tieneNotas },
                { etiqueta: t("onboarding.paso3"), hecho: tieneVoz },
            ];

            if (listaPasos.every((p) => p.hecho)) return;
            setPasos(listaPasos);
            setVisible(true);
        } catch {}
    }

    function descartar() {
        AsyncStorage.setItem(DISMISSED_KEY, "1").catch(() => {});
        setVisible(false);
    }

    if (!visible || pasos.length === 0) return null;

    const hechos = pasos.filter((p) => p.hecho).length;

    return (
        <View style={s.contenedor}>
            <View style={s.cabecera}>
                <Text style={s.titulo}>{t("onboarding.titulo")} · {hechos}/{pasos.length}</Text>
                <TouchableOpacity onPress={descartar} style={{ padding: 4 }}>
                    <Text style={s.cerrar}>✕</Text>
                </TouchableOpacity>
            </View>
            {pasos.map((paso, i) => (
                <TouchableOpacity
                    key={i}
                    style={s.fila}
                    onPress={paso.accion}
                    activeOpacity={paso.accion ? 0.7 : 1}
                    disabled={!paso.accion}
                >
                    <Text style={[s.check, paso.hecho && s.checkHecho]}>
                        {paso.hecho ? "✓" : "○"}
                    </Text>
                    <Text style={[s.etiqueta, paso.hecho && s.etiquetaHecha]}>
                        {paso.etiqueta}
                    </Text>
                    {paso.accion && !paso.hecho && (
                        <Text style={s.flecha}>→</Text>
                    )}
                </TouchableOpacity>
            ))}
        </View>
    );
}

const s = StyleSheet.create({
    contenedor: {
        borderWidth: 1,
        borderColor: "rgba(234,179,8,0.3)",
        borderRadius: RADIOS.sm,
        paddingHorizontal: ESPACIADO.md,
        paddingVertical: ESPACIADO.sm + 2,
        backgroundColor: "rgba(234,179,8,0.07)",
        gap: ESPACIADO.xs,
    },
    cabecera: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: ESPACIADO.xs,
    },
    titulo: {
        fontFamily: FUENTES.mono,
        fontSize: TIPOGRAFIA.minimo,
        color: COLORES.accentWarm,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    cerrar: { fontFamily: FUENTES.cuerpo, fontSize: TIPOGRAFIA.minimo + 1, color: COLORES.textMuted },
    fila: { flexDirection: "row", alignItems: "center", gap: ESPACIADO.sm },
    check: { fontFamily: FUENTES.mono, fontSize: TIPOGRAFIA.minimo + 1, color: COLORES.textMuted, width: 14 },
    checkHecho: { color: COLORES.accentCool },
    etiqueta: { fontFamily: FUENTES.cuerpo, fontSize: TIPOGRAFIA.minimo + 1, color: COLORES.text, flex: 1 },
    etiquetaHecha: { color: COLORES.textMuted, textDecorationLine: "line-through" },
    flecha: { fontFamily: FUENTES.cuerpo, fontSize: TIPOGRAFIA.minimo + 1, color: COLORES.accentCool },
});
